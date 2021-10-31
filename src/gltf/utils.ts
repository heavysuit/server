import { Document, Node } from '@gltf-transform/core';
import { File } from '@google-cloud/storage';
import { strict as assert } from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Object3D } from 'three';
import { hsBucket } from '../GCP';
import { BodyNode } from '../shared/BodyNode';
import { logger } from '../utils/logger';

export function renameChildren(doc: Document, prefix: string): void {
  for (const n of doc.getRoot().listNodes()) {
    n.setName(`${prefix}-${n.getName()}`);
  }
  for (const s of doc.getRoot().listSkins()) {
    s.setName(`${prefix}-${s.getName()}`);
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

export const gltfDir = 'gltf';
export const thumbnailDir = 'gltf/thumbnails';
export const bufferDir = 'gltf/buffers';
export const textureDir = 'gltf/textures';

export function getTextureBucketPath(uri: string): string {
  assert(shouldUploadToBucket(uri), 'URI is not a local file');
  const filename = path.basename(uri);
  return `${textureDir}/${filename}`;
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

  const localHash = crypto
    .createHash('md5')
    .update(Buffer.from((await fs.promises.readFile(localPath)).buffer))
    .digest('base64');
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
