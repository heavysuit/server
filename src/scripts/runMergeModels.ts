import { Manifest, mergeModels } from '../gltf/mergeModels';
import { BodyNode } from '../gltf/utils';

export function runMergeModels(): void {
  // const filePath = process.argv[process.argv.length - 1];
  // console.log(filePath);

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

  mergeModels(manifest);

  process.exit(0);
}

runMergeModels();
