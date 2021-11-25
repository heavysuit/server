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
import { batchPromises } from '../utils/batchPromises';
import { BATCH } from '../utils/globals';
import { logger } from '../utils/logger';
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

    console.log(modelName, n.getName(), deleted ? '' : 'kept');
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
  logger.info(`Uploading ${localPath} to ${bucketPath}`);

  const localHash = generateHash(
    (await fs.promises.readFile(localPath)).buffer,
  );
  logger.info(`localHash: ${localHash}`);

  const exists = await file.exists();
  if (exists[0]) {
    const response = await file.getMetadata();
    const metadata = response[0];
    const remoteHash = metadata.md5Hash;

    logger.info(`remoteHash: ${remoteHash}`);

    if (remoteHash === localHash) {
      logger.info('Skipping duplicate hash');
    } else {
      logger.warn('Overwriting previous version');
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
  { name: string; metaHash?: string; gltfHash?: string }
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
  tokenId: string,
  metaHash: string,
  gltfHash: string,
): Promise<void> {
  const ids = await loadCache();

  assert(tokenId in ids);
  ids[tokenId].gltfHash = gltfHash;
  ids[tokenId].metaHash = metaHash;

  await saveCache(ids);
}

export async function countCache(): Promise<number> {
  return (await listCache()).length;
}

export async function listCache(): Promise<string[]> {
  const ids = await loadCache();
  return Object.keys(ids);
}

export async function generateTokenId(name: string): Promise<string> {
  const ids = await loadCache();

  let id = 0;
  while (id in ids) {
    id = _.random(0, 7777, false);
  }

  ids[id] = { name };
  await saveCache(ids);

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
  const dir = path.join(__dirname, '../../assets/screenshots');
  const files = await fs.promises.readdir(dir);
  const uploads = files.map((f) => {
    const assetName = f.split('.')[0];
    const localPath = path.join(dir, f);
    return uploadScreenshot(localPath, getThumbnailBucketPath(assetName));
  });
  const results = await batchPromises(uploads, 5);
  logger.info(`${results.length} uploaded`);
}

export async function createBatchScreenshots(tokenIds: (number | string)[]) {
  const dir = path.join(__dirname, '../../assets/screenshots');
  const failed: string[] = [];
  for (const tokenId of tokenIds) {
    const assetName = tokenId.toString();
    if (parseInt(assetName) < 3563) {
      continue;
    }
    const localPath = path.join(dir, `${tokenId}.png`);
    const assetPath = getGLTFBucketPath(assetName);
    const assetUri = `https://storage.googleapis.com/hs-metadata/${assetPath}`;
    try {
      await createScreenshot(assetUri, localPath);
    } catch (error) {
      logger.error(error);
      failed.push(assetName);
    }
  }
  logger.warn(failed.join(', '));
}
