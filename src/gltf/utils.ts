import { Document, Node } from '@gltf-transform/core';
import { File } from '@google-cloud/storage';
import { strict as assert } from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import { vec3 } from 'gl-matrix';
import path from 'path';
import { hsBucket } from '../GCP';
import { logger } from '../utils/logger';
import { BodyNode } from './ModelManifest';

export interface Joints {
  top: vec3 | null;
  bottom: vec3 | null;
  left: vec3 | null;
  right: vec3 | null;
  back: vec3 | null;
}

export function renameChildren(doc: Document, prefix: string): void {
  for (const n of doc.getRoot().listNodes()) {
    n.setName(`${prefix}-${n.getName()}`);
  }
  for (const s of doc.getRoot().listSkins()) {
    s.setName(`${prefix}-${s.getName()}`);
  }
}

export function getJoints(doc: Document): Joints {
  let top: vec3 | null = null;
  let bottom: vec3 | null = null;
  let left: vec3 | null = null;
  let right: vec3 | null = null;
  let back: vec3 | null = null;

  const root = doc.getRoot();
  for (const n of root.listNodes()) {
    switch (n.getName()) {
      case 'Torso_BackJoint': {
        back = vec3.clone(n.getTranslation());
        break;
      }
      case 'Torso_BotJoint': {
        bottom = vec3.clone(n.getTranslation());
        break;
      }
      case 'Torso_HeadJoint': {
        top = vec3.clone(n.getTranslation());
        break;
      }
      case 'Torso_LeftJoint': {
        left = vec3.clone(n.getTranslation());
        break;
      }
      case 'Torso_RightJoint': {
        right = vec3.clone(n.getTranslation());
        break;
      }
    }
  }

  return {
    top,
    bottom,
    left,
    right,
    back,
  };
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

export function getRelativePath(resourcePath: string) {
  return path.relative(gltfDir, resourcePath);
}

export async function uploadResourceFile(
  localPath: string,
  bucketPath: string,
): Promise<File> {
  const file = hsBucket.file(bucketPath);
  logger.info(`Uploading ${localPath} to ${bucketPath}`);

  const localHash = crypto
    .createHash('md5')
    .update(Buffer.from(fs.readFileSync(localPath).buffer))
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
