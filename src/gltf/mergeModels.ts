import { Document, NodeIO } from '@gltf-transform/core';
import { dedup, prune } from '@gltf-transform/functions';
import { strict as assert } from 'assert';
import path from 'path';
import { BodyNode, ModelManifest } from './ModelManifest';
import {
  copyTransform,
  getJointNodeForBodyNode,
  getNode,
  pruneNodes,
  renameChildren
} from './utils';

const REQUIRED_NODES = [BodyNode.Legs, BodyNode.Torso];

export async function mergeModels(manifests: ModelManifest[]): Promise<void> {
  const io = new NodeIO();
  const mainModel = manifests[0];

  const docs: Record<string, Document> = {};
  const nodeSet = new Set<BodyNode>();

  for (const model of manifests) {
    const { localPath, nodes, modelName } = model;
    const doc = io.read(localPath);
    docs[modelName] = doc;

    nodes.forEach((n) => {
      assert(!nodeSet.has(n), `Duplicated nodes defined in manifest: ${n}`);
      nodeSet.add(n);
    });

    const rig = getNode(doc, 'Rig');
    assert(rig, `${modelName} is missing Rig node`);

    // Remove Mesh nodes that are not marked as required from this model
    pruneNodes(modelName, rig, nodes);
  }

  const mainDoc = docs[mainModel.modelName];

  // Check that the union of preserved Mesh nodes satisfies the minimal requirement for a model
  REQUIRED_NODES.forEach((n) => {
    assert(nodeSet.has(n), `Missing required node: ${n}`);
  });

  assert(
    getNode(mainDoc, BodyNode.Torso),
    'No torso defined on the main model',
  );
  assert(
    mainModel.nodes.includes(BodyNode.Torso),
    'Main model must provide torso',
  );

  const outputDoc = mainDoc.clone();

  for (const model of manifests) {
    if (model === mainModel) {
      continue;
    }

    const { nodes, modelName } = model;
    const doc = docs[modelName];

    for (const nodeName of nodes) {
      const n = getNode(doc, nodeName);
      assert(n, `${modelName} is missing node ${nodeName}`);

      const targetJoint = getJointNodeForBodyNode(nodeName);
      if (!targetJoint) {
        continue;
      }

      const from = getNode(mainDoc, targetJoint);
      const to = getNode(doc, targetJoint);
      assert(from && to, `Joint Nodes are missing: ${targetJoint}`);
      copyTransform(from, to);
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
