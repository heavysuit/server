import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { mergeModels } from './gltf/mergeModels';
import { BodyNode, ModelManifest } from './gltf/ModelManifest';
import { uploadModel } from './gltf/uploadModel';

async function runMergeModels(): Promise<void> {
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
}

export async function run(): Promise<void> {
  const args = await yargs(hideBin(process.argv))
    .command(
      'upload [modelName] [gltf]',
      'upload a model to Google Storage',
      (yargs) => {
        return yargs
          .positional('modelName', {
            describe: 'Save model as this name in the bucket',
            type: 'string',
          })
          .positional('gltf', {
            describe: 'local path to GLTF',
            type: 'string',
          });
      },
    )
    .parse();

  const command = args._[0];

  switch (command) {
    case 'upload': {
      if (!args.modelName || !args.gltf) {
        console.log('Missing required positional options');
        process.exit(-1);
      }
      await uploadModel(args.modelName, args.gltf);
      break;
    }
    case 'merge': {
      await runMergeModels();
      break;
    }
  }
}

run().then(() => process.exit(0));
