import { mergeModels } from '../gltf/mergeModels';
import { BodyNode, ModelManifest } from '../gltf/ModelManifest';

export async function runMergeModels(): Promise<void> {
  // const filePath = process.argv[process.argv.length - 1];
  // console.log(filePath);

  const manifests: ModelManifest[] = [
    {
      modelName: 'M1',
      localPath: './assets/M1/M1.gltf',
      nodes: [BodyNode.Torso, BodyNode.Legs],
    },
    {
      modelName: 'M2',
      localPath: './assets/M2/M2.gltf',
      nodes: [BodyNode.ArmL, BodyNode.ArmR],
    },
  ];

  await mergeModels(manifests);

  process.exit(0);
}

runMergeModels();
