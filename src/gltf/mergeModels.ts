import { Document, NodeIO } from '@gltf-transform/core';
import { dedup, prune } from '@gltf-transform/functions';
import { strict as assert } from 'assert';
import { vec3 } from 'gl-matrix';
import path from 'path';
import { BodyNode, ModelManifest } from './ModelManifest';
import {
  getJoints,
  getNode,
  Joints,
  pruneNodes,
  renameChildren
} from './utils';

export async function mergeModels(manifests: ModelManifest[]): Promise<void> {
  const io = new NodeIO();
  const outputDoc = new Document();

  const docs: Record<string, Document> = {};

  let joints: Joints | null = null;
  let mainModelName: string = '';

  for (const model of manifests) {
    const { localPath, nodes, modelName } = model;
    const doc = io.read(localPath);
    docs[modelName] = doc;

    if (nodes.includes(BodyNode.Torso)) {
      joints = getJoints(doc);
      mainModelName = modelName;
    }

    const rig = getNode(doc, 'Rig');
    if (!rig) {
      throw new Error(`${modelName} is missing Rig node`);
    }
    pruneNodes(modelName, rig, nodes);
  }

  if (!joints || !mainModelName) {
    throw new Error('No torso defined');
  }

  const j1 = joints;

  for (const model of manifests) {
    const { nodes, modelName } = model;
    const doc = docs[modelName];
    const j2 = getJoints(doc);

    if (mainModelName !== modelName) {
      for (const nodeName of nodes) {
        const n = getNode(doc, nodeName);
        if (!n) {
          throw new Error(`${modelName} is missing node ${nodeName}`);
        }
        const v = n.getTranslation();

        switch (nodeName) {
          case BodyNode.ArmL: {
            assert(j1.left && j2.left);
            vec3.sub(v, j1.left, j2.left);
            break;
          }
        }
        n.setTranslation(v);
      }
    }

    renameChildren(doc, modelName);
    outputDoc.merge(doc);
  }

  const scenes = outputDoc.getRoot().listScenes();
  const scene = scenes[0];
  for (let i = 1; i < scenes.length; i++) {
    const s = scenes[i];
    for (const n of s.listChildren()) {
      s.removeChild(n);
      scene.addChild(n);
    }
    s.dispose();
  }

  // // Optional: Merge binary resources to a single buffer.
  // const buffer = doc.getRoot().listBuffers()[0];
  // doc.getRoot().listAccessors().forEach((a) => a.setBuffer(buffer));
  // doc.getRoot().listBuffers().forEach((b, index) => index > 0 ? b.dispose() : null);

  await outputDoc.transform(dedup(), prune());

  const outputPath = path.join('./assets/output/output.gltf');
  io.write(outputPath, outputDoc);
}