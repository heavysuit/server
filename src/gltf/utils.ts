import { Document, Node } from '@gltf-transform/core';
import { strict as assert } from 'assert';
import { vec3 } from 'gl-matrix';
import path from 'path';
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

export const binDir = 'bin';
export const textureDir = 'textures';

export function getTextureBucketPath(modelName: string, uri: string): string {
  assert(shouldUploadToBucket(uri), 'URI is not a local file');
  const filename = path.basename(uri);
  return `${textureDir}/${modelName}/${filename}`;
}
