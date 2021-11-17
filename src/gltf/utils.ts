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
import { logger } from '../utils/logger';

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
  modelName: string,
  rig: Node,
  nodesToKeep: BodyNode[],
): void {
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

export const gltfDir = 'alpha';
export const thumbnailDir = 'alpha/thumbnails';
export const bufferDir = 'alpha/buffers';
export const textureDir = 'alpha/textures';

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

  const localHash = generateHash((await fs.promises.readFile(localPath)).buffer)
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
    const response = await axios.get<{ data: {name:string}[]}>('https://story-shack-cdn-v2.glitch.me/generators/mecha-name-generator?count=100');
    const results = response.data;
    _names = results.data.map((r) => r.name);
    name = _names.pop() || '';
    assert(name);
  }

  const letterA = String.fromCharCode(65+Math.floor(Math.random() * 26));
  const letterB = Math.random() > 0.7 ? String.fromCharCode(65+Math.floor(Math.random() * 26)) : '';
  const number = Math.round(Math.random() * 150);

  return `${name} ${letterA}${letterB}-${number}`;
}

export async function saveHashes(tokenId: string, metaHash: string, gltfHash: string): Promise<void> {
  const tokenPath = path.join(__dirname, './usedtokenIds.json');
  const content = await fs.promises.readFile(tokenPath);
  const ids = JSON.parse(content.toString());

  assert(tokenId in ids);
  ids[tokenId].gltfHash = gltfHash;
  ids[tokenId].metaHash = metaHash;

  await fs.promises.writeFile(tokenPath, JSON.stringify(ids, undefined, 2));
}

export async function generateTokenId(name: string): Promise<string> {
  const tokenPath = path.join(__dirname, './usedtokenIds.json');
  const content = await fs.promises.readFile(tokenPath);
  const ids = JSON.parse(content.toString());

  let id = 0;
  while (id in ids) {
    id = _.random(0, 7777, false);
  }

  ids[id] = { name };
  await fs.promises.writeFile(tokenPath, JSON.stringify(ids, undefined, 2));

  return id.toString();
}

export function generateHash(content: ArrayBufferLike): string {
  return crypto
  .createHash('md5')
  .update(Buffer.from(content))
  .digest('base64');
}