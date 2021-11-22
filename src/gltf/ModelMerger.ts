import { Document, NodeIO } from '@gltf-transform/core';
import { dedup, prune, reorder } from '@gltf-transform/functions';
import { strict as assert } from 'assert';
import fs from 'fs';
import { MeshoptEncoder } from 'meshoptimizer';
import path from 'path';
import { BodyNode } from '../shared/BodyNode';
import { JointNode } from '../shared/JointNode';
import { PAINT_DIR } from '../utils/globals';
import { AssetLibraryID, AssetName, getLocalPath } from './AssetLibrary';
import { ModelManifest } from './ModelManifest';
import { copyTransform, getNode, pruneNodes, renameChildren } from './utils';

export class ModelMerger {
  parts: {
    [K in BodyNode]?: Document;
  };
  assetName: AssetName;

  _docs: { [K in AssetLibraryID]?: Document };
  _io: NodeIO;

  constructor(assetName: AssetName, manifests: ModelManifest[]) {
    this._io = new NodeIO();
    this._docs = {};
    this.parts = {};
    this.assetName = assetName;

    const seen: Set<string> = new Set();
    for (const { assetId } of manifests) {
      assert(!seen.has(assetId), 'Duplicated asset in manifest');
      seen.add(assetId);
    }

    for (const node of [
      BodyNode.Torso,
      BodyNode.Legs,
      BodyNode.Head,
      BodyNode.ArmL,
      BodyNode.ArmR,
    ]) {
      const results = manifests.filter((m) => m.nodes.includes(node));
      assert(
        results.length <= 1,
        `Duplicated nodes defined in manifest: ${node}`,
      );
      const manifest = results[0];
      if (!manifest) {
        continue;
      }

      console.log(node, manifest.assetId);

      this.parts[node] = this.read(manifest);
    }
  }

  read(manifest: ModelManifest): Document {
    const { assetId, nodes } = manifest;
    let doc = this._docs[assetId];
    if (doc) {
      return doc;
    } else {
      doc = this._io.read(getLocalPath(assetId));

      for (const node of nodes) {
        const n = getNode(doc, node);
        assert(n, `${assetId} is missing ${node}`);
      }

      // Remove Mesh nodes that are not marked as required from this model
      pruneNodes(doc, assetId, nodes);

      this._docs[assetId] = doc;
      return doc;
    }
  }

  repositionJoints() {
    const armLeftDoc = this.parts[BodyNode.ArmL];
    const armRightDoc = this.parts[BodyNode.ArmR];
    const headDoc = this.parts[BodyNode.Head];
    const legDoc = this.parts[BodyNode.Legs];
    const torsoDoc = this.parts[BodyNode.Torso];
    const docs: Document[] = Object.values(this._docs).filter(Boolean) as any[];
    assert(legDoc && torsoDoc && armLeftDoc && armRightDoc);

    let from = getNode(legDoc, JointNode.Hip);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.Hip);
      assert(from && to);
      copyTransform(from, to);
    });

    from = getNode(legDoc, JointNode.Spine);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.Spine);
      assert(from && to);
      copyTransform(from, to);
    });

    from = getNode(torsoDoc, JointNode.Neck);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.Neck);
      assert(from && to);
      copyTransform(from, to);
    });

    if (headDoc) {
      from = getNode(torsoDoc, JointNode.Neck);
      docs.forEach((doc) => {
        const to = getNode(doc, JointNode.Neck);
        assert(from && to);
        copyTransform(from, to);
      });
    }

    from = getNode(torsoDoc, JointNode.ShoulderL);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.ShoulderL);
      assert(from && to);
      copyTransform(from, to);
    });

    from = getNode(torsoDoc, JointNode.ShoulderR);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.ShoulderR);
      assert(from && to);
      copyTransform(from, to);
    });

    from = getNode(torsoDoc, JointNode.UpperArmL);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.UpperArmL);
      assert(from && to);
      copyTransform(from, to);
    });

    from = getNode(torsoDoc, JointNode.UpperArmR);
    docs.forEach((doc) => {
      const to = getNode(doc, JointNode.UpperArmR);
      assert(from && to);
      copyTransform(from, to);
    });
  }

  merge(): Document {
    const doc = new Document();

    for (const k in this._docs) {
      const d = this._docs[k as AssetLibraryID];
      assert(d);
      renameChildren(d, k);
      doc.merge(d);
    }

    const scenes = doc.getRoot().listScenes();
    const scene = scenes[0];
    for (let i = 1; i < scenes.length; i++) {
      const s = scenes[i];
      for (const n of s.listChildren()) {
        s.removeChild(n);
        scene.addChild(n);
      }
      s.dispose();
    }

    const animations = doc.getRoot().listAnimations();
    for (const animation of animations) {
      animation.dispose();
    }

    // // Optional: Merge binary resources to a single buffer.
    const buffer = doc.getRoot().listBuffers()[0];
    doc
      .getRoot()
      .listAccessors()
      .forEach((a) => a.setBuffer(buffer));
    doc
      .getRoot()
      .listBuffers()
      .forEach((b, index) => (index > 0 ? b.dispose() : null));
    doc.getRoot().listBuffers()[0].setURI(`${this.assetName}.bin`);

    return doc;
  }

  async mergeAndWrite(): Promise<string> {
    const doc = this.merge();

    await doc.transform(dedup(), prune(), reorder({ encoder: MeshoptEncoder }));

    const outputPath = getLocalPath(this.assetName);
    await fs.promises.mkdir(path.join(path.dirname(outputPath), PAINT_DIR), {
      recursive: true,
    });
    this._io.write(outputPath, doc);

    return outputPath;
  }
}
