import { Document, Node, NodeIO } from '@gltf-transform/core';
import { dedup, prune } from '@gltf-transform/functions';
import { strict as assert } from 'assert';
import { vec3 } from 'gl-matrix';
import path from 'path';

enum BodyNode {
  Torso = 'Torso',
  ArmL = 'Arm_L',
  ArmR = 'Arm_R',
  Head = 'Head',
  Legs = 'Legs',
}

interface ModelMetadata {
  path: string;
  nodes: BodyNode[];
}

type Manifest = Record<string, ModelMetadata>;

interface Joints {
  top: vec3 | null;
  bottom: vec3 | null;
  left: vec3 | null;
  right: vec3 | null;
  back: vec3 | null;
}

function renameChildren(doc: Document, prefix: string): void {
  for (const n of doc.getRoot().listNodes()) {
    n.setName(`${prefix}-${n.getName()}`);
  }
  for (const s of doc.getRoot().listSkins()) {
    s.setName(`${prefix}-${s.getName()}`);
  }
}

function getJoints(doc: Document): Joints {
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

function pruneNodes(
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

function getNode(doc: Document, nodeName: string): Node | null {
  return (
    doc
      .getRoot()
      .listNodes()
      .find((n) => n.getName() === nodeName) || null
  );
}

async function processModel(manifest: Manifest): Promise<void> {
  // const filePath = process.argv[process.argv.length - 1];
  // console.log(filePath);

  const io = new NodeIO();
  const outputDoc = new Document();

  const docs: Record<string, Document> = {};

  let joints: Joints | null = null;
  let mainModelName: string = '';

  for (const modelName in manifest) {
    const { path, nodes } = manifest[modelName];
    const doc = io.read(path);
    docs[modelName] = doc;

    const skin = doc.getRoot().listSkins()[0];
    console.log(skin.listJoints());

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

  for (const modelName in manifest) {
    const { nodes } = manifest[modelName];
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

  process.exit(0);
}

const manifest: Manifest = {
  M1: {
    path: './assets/M1/M1.gltf',
    nodes: [BodyNode.Torso, BodyNode.Legs],
  },
  M2: {
    path: './assets/M2/M2.gltf',
    nodes: [BodyNode.ArmL, BodyNode.ArmR],
  },
};

processModel(manifest);
