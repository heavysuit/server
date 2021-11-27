import { Document, Node } from '@gltf-transform/core';
import { File } from '@google-cloud/storage';
import { strict as assert } from 'assert';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import { Object3D } from 'three';
import { hsBucket } from '../GCP';
import { BodyNode } from '../shared/BodyNode';
import { TokenMetadata } from '../shared/TokenMetadata';
import { Trait } from '../shared/Trait';
import { SuitLibrary } from '../suits/SuitLibrary';
import { batchPromises } from '../utils/batchPromises';
import { BATCH } from '../utils/globals';
import { logger } from '../utils/logger';
import { getLocalPath } from './AssetLibrary';
import { createScreenshot } from './createScreenshot';

export function renameChildren(doc: Document, prefix: string): void {
  for (const n of doc.getRoot().listNodes()) {
    if (!n.getName().startsWith(prefix)) {
      n.setName(`${prefix}-${n.getName()}`);
    }
  }
  for (const s of doc.getRoot().listSkins()) {
    if (!s.getName().startsWith(prefix)) {
      s.setName(`${prefix}-${s.getName()}`);
    }
  }
}

export function copyTransform(from: Node, to: Node): void {
  const parent = to.getParent();
  if (parent instanceof Node) {
    const a = new Object3D();
    a.position.fromArray(from.getWorldTranslation());
    a.quaternion.fromArray(to.getWorldRotation());
    a.scale.fromArray(to.getWorldScale());
    a.updateMatrixWorld();

    const b = new Object3D();
    b.position.fromArray(parent.getWorldTranslation());
    b.quaternion.fromArray(parent.getWorldRotation());
    b.scale.fromArray(parent.getWorldScale());
    b.updateMatrixWorld();

    b.attach(a);
    a.updateMatrix();
    to.setMatrix(a.matrix.toArray());
  } else {
    to.setMatrix(from.getWorldMatrix());
  }
}

export function pruneNodes(
  doc: Document,
  modelName: string,
  nodesToKeep: BodyNode[],
): void {
  const rig = getNode(doc, 'Rig');
  assert(rig, `${modelName} is missing Rig node`);

  for (const n of rig.listChildren()) {
    let deleted = false;
    if (n.getMesh() && !nodesToKeep.includes(n.getName() as BodyNode)) {
      n.dispose();
      deleted = true;
    }

    logger.debug(`${modelName} ${n.getName()} ${deleted ? '' : 'kept'}`);
  }
}

export function getNode(doc: Document, nodeName: string): Node | null {
  return (
    doc
      .getRoot()
      .listNodes()
      .find((n) => n.getName() === nodeName) || null
  );
}

export function shouldUploadToBucket(uri: string): boolean {
  const ignore =
    uri.includes('http://') ||
    uri.includes('https://') ||
    uri.includes('data:');
  return !ignore;
}

export const gltfDir = `${BATCH}/gltf`;
export const thumbnailDir = `${BATCH}/thumbnails`;
export const bufferDir = `${BATCH}/buffers`;
export const textureDir = 'textures';

export function getTextureBucketPath(uri: string): string {
  assert(shouldUploadToBucket(uri), 'URI is not a local file');
  const filename = path.basename(uri);
  const folders = path.dirname(uri).split('/');
  return `${textureDir}/${folders[folders.length - 1]}/${filename}`;
}

export function getBufferBucketPath(uri: string): string {
  assert(shouldUploadToBucket(uri), 'URI is not a local file');
  const filename = path.basename(uri);
  return `${bufferDir}/${filename}`;
}

export function getGLTFBucketPath(modelName: string): string {
  return `${gltfDir}/${modelName}.gltf`;
}

export function getThumbnailBucketPath(modelName: string): string {
  return `${thumbnailDir}/${modelName}.png`;
}

export async function uploadResourceFile(
  localPath: string,
  bucketPath: string,
): Promise<File> {
  const file = hsBucket.file(bucketPath);
  logger.debug(`Uploading ${localPath} to ${bucketPath}`);

  const localHash = generateHash(
    (await fs.promises.readFile(localPath)).buffer,
  );
  logger.debug(`localHash: ${localHash}`);

  const exists = await file.exists();
  if (exists[0]) {
    const response = await file.getMetadata();
    const metadata = response[0];
    const remoteHash = metadata.md5Hash;

    logger.debug(`remoteHash: ${remoteHash}`);

    if (remoteHash === localHash) {
      logger.debug('Skipping duplicate hash');
    } else {
      logger.warn(`Overwriting previous version at ${bucketPath}`);
      await hsBucket.upload(localPath, { destination: file });
    }
  } else {
    await hsBucket.upload(localPath, { destination: file });
  }

  return file;
}

let _names: string[] = [];

export async function generateRandomName(name: string = ''): Promise<string> {
  if (!name) {
    name = _names.pop() || '';
  }

  if (!name) {
    const response = await axios.get<{ data: { name: string }[] }>(
      'https://story-shack-cdn-v2.glitch.me/generators/mecha-name-generator?count=100',
    );
    const results = response.data;
    _names = results.data.map((r) => r.name);
    name = _names.pop() || '';
    assert(name);
  }

  const letterA = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const letterB =
    Math.random() > 0.7
      ? String.fromCharCode(65 + Math.floor(Math.random() * 26))
      : '';
  const number = Math.round(Math.random() * 150);

  return `${name} ${letterA}${letterB}-${number}`;
}

type IDCache = Record<
  string,
  { name: string; metaHash?: string; gltfHash?: string; paint?: string }
>;

export async function loadCache(): Promise<IDCache> {
  const tokenPath = path.join(__dirname, './usedtokenIds.json');
  const content = await fs.promises.readFile(tokenPath);
  const ids = JSON.parse(content.toString());
  return ids;
}

export async function saveCache(ids: IDCache): Promise<void> {
  const tokenPath = path.join(__dirname, './usedtokenIds.json');
  await fs.promises.writeFile(tokenPath, JSON.stringify(ids, undefined, 2));
}

export async function saveHashes(
  suitName: string,
  tokenId: string,
  metaHash: string,
  gltfHash: string,
  paintName: string,
): Promise<void> {
  const ids = await loadCache();

  ids[tokenId] = {
    name: suitName,
    gltfHash,
    metaHash,
    paint: paintName,
  };

  await saveCache(ids);
}

export async function listCache(): Promise<string[]> {
  const ids = await loadCache();
  return Object.keys(ids);
}

export async function generateTokenId(): Promise<string> {
  const ids = await loadCache();

  let id = 0;
  while (id in ids) {
    id = _.random(0, 7777, false);
  }

  return id.toString();
}

export function generateHash(content: ArrayBufferLike): string {
  return crypto.createHash('md5').update(Buffer.from(content)).digest('base64');
}

export async function uploadScreenshot(localPath: string, bucketPath: string) {
  const destination = hsBucket.file(bucketPath);
  const [thumbnail] = await hsBucket.upload(localPath, {
    destination,
  });
  logger.info(`Uploaded to: ${thumbnail.publicUrl()}`);
  return thumbnail;
}

export async function uploadBatchScreenshots() {
  const dir = path.join(__dirname, '../../screenshots');
  const files = await fs.promises.readdir(dir);
  const uploads = files.map((f) => {
    const assetName = f.split('.')[0];
    const localPath = path.join(dir, f);
    return uploadScreenshot(localPath, getThumbnailBucketPath(assetName));
  });
  const results = await batchPromises(uploads, 5);
  logger.info(`${results.length} uploaded`);
}

export async function createBatchScreenshots(
  tokenIds: (number | string)[],
  includeVideos = false,
) {
  const dir = path.join(__dirname, '../../screenshots');
  const failed: string[] = [];
  for (const tokenId of tokenIds) {
    logger.info(`📷 ${tokenId}`);
    const assetName = tokenId.toString();
    // if (parseInt(assetName) < 3563) {
    //   continue;
    // }
    const localPath = path.join(dir, `${tokenId}.png`);
    const assetPath = getGLTFBucketPath(assetName);
    const assetUri = `https://storage.googleapis.com/hs-metadata/${assetPath}`;
    try {
      await createScreenshot(assetUri, localPath, includeVideos);
    } catch (error) {
      logger.error(error);
      failed.push(assetName);
    }
  }
  logger.warn(failed.join(', '));
}

export async function randomizeTextures(textureNames: string[]): Promise<void> {
  const assets = SuitLibrary.map((s) => s.parts[0].assetId);
  for (const a of assets) {
    const textureName = _.sample(textureNames);
    const gltfPath = getLocalPath(a);
    const buffer = await fs.promises.readFile(gltfPath);
    const output = buffer
      .toString()
      .replace(/"uri" : ".+\//g, `"uri" : "${textureName}/`);
    await fs.promises.writeFile(gltfPath, output);
  }
}

export async function downloadData() {
  const dir = path.join(__dirname, '../../metadata');
  const cache = await loadCache();
  const promises = Object.keys(cache).map((key, i) => {
    return new Promise<TokenMetadata | null>((resolve, reject) => {
      setTimeout(() => {
        axios
          .get(`https://meta.heavysuit.com/delta/${key}.json`)
          .then(({ data }) => {
            logger.info(key);
            return fs.promises
              .writeFile(
                path.join(dir, `${key}.json`),
                Buffer.from(JSON.stringify(data)),
              )
              .then(() => resolve(data));
          })
          .catch((error) => {
            resolve(null);
            logger.error(key, error);
          });
      }, 20 * i);
    });
  });
  await Promise.all(promises);
}

export function getMetadataHash(data: TokenMetadata) {
  const hash = [
    // data.attributes.find((a) => a.trait_type === Trait.Paint)?.value,
    data.attributes.find((a) => a.trait_type === Trait.Torso)?.value,
    data.attributes.find((a) => a.trait_type === Trait.Legs)?.value,
    data.attributes.find((a) => a.trait_type === Trait.LeftArm)?.value,
    data.attributes.find((a) => a.trait_type === Trait.RightArm)?.value,
    data.attributes.find((a) => a.trait_type === Trait.Head)?.value,
  ]
    .filter(Boolean)
    .join(', ');

  return hash;
}

export function seenMetadata(data: TokenMetadata): boolean {
  const hash = getMetadataHash(data);
  const seen = hash in parts;
  parts[hash] = parts[hash] || ['new'];
  return seen;
}

const paintCounts: Record<string, number> = {};
const parts: Record<string, string[]> = {};

export async function countParts() {
  const ids = await loadCache();
  const dir = path.join(__dirname, '../../metadata');
  const promises = Object.keys(ids).map((tokenId) => {
    return new Promise<TokenMetadata>((resolve) => {
      fs.promises.readFile(path.join(dir, `${tokenId}.json`)).then((buffer) => {
        resolve(JSON.parse(buffer.toString()) as any);
      });
    });
  });
  const results = await batchPromises<TokenMetadata | null>(promises, 10);

  results.forEach((data) => {
    if (!data) {
      return;
    }
    let attribute = data.attributes.find((a) => a.trait_type === Trait.Paint);
    const paint = (attribute?.value || '').toString();
    paintCounts[paint] = paintCounts[paint] || 0;
    paintCounts[paint]++;

    const hash = getMetadataHash(data);
    parts[hash] = parts[hash] || [];
    parts[hash].push(data.image);
  });

  logger.info(JSON.stringify(paintCounts, undefined, 2));

  let count = 0;
  Object.entries(parts).forEach(([hash, value]) => {
    if (value.length > 1) {
      logger.info(hash);
      console.log(value);
      count++;
    }
  });
  if (count > 0) {
    logger.warn('Duplicates', { count });
  }
  logger.info(results.length);

  return parts;
}

function getIdFromURI(uri: string): string {
  const parts = uri.split('/');
  const id = parts[parts.length - 1].split('.')[0];
  return id;
}

export async function removeStaleMetadata() {
  const parts = await countParts();
  const ids = await loadCache();

  let deleted = 0;
  Object.entries(parts).forEach(([key, value]) => {
    if (value.length > 1) {
      for (let i = 1; i < value.length; i++) {
        const id = getIdFromURI(value[i]);
        delete ids[id];
        deleted++;
      }
    } else {
      const id = getIdFromURI(value[0]);
      if (!ids[id].paint) {
        delete ids[id];
        deleted++;
      }
    }
  });

  await saveCache(ids);
  logger.warn(`Deleted ${deleted} entries`);

  const dir = path.join(__dirname, '../../metadata');
  const files = await fs.promises.readdir(dir);

  for (const f of files) {
    if (!(f.split('.')[0] in ids)) {
      await fs.promises.rm(path.join(dir, f));
    }
  }
}

export async function removeStaleAssets() {
  const ids = await loadCache();
  const dir = path.join(__dirname, '../../assets');
  const files = await fs.promises.readdir(dir);

  for (const f of files) {
    if (f.startsWith('M')) {
      continue;
    }

    if (!(f in ids)) {
      logger.info(`Deleting ${f}`);
      await fs.promises.rmdir(path.join(dir, f), { recursive: true });
    }
  }
}
