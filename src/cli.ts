import { strict as assert } from 'assert';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { uploadMetadata } from './functions/manufactureSuit';
import { AssetID, AssetLibrary } from './gltf/AssetLibrary';
import { mergeModels } from './gltf/mergeModels';
import { BodyNode, ModelManifest } from './gltf/ModelManifest';
import { uploadModel } from './gltf/uploadModel';
import { createTokenAttributes } from './nft/createTokenMetadata';
import { generateRandomSuit, SuitLibrary } from './suits/SuitLibrary';

async function runMergeModels(): Promise<void> {
  const manifests: ModelManifest[] = [
    {
      assetId: 'M1',
      nodes: [BodyNode.Torso, BodyNode.Legs],
    },
    {
      assetId: 'M2',
      nodes: [BodyNode.ArmL, BodyNode.ArmR],
    },
  ];

  await mergeModels(manifests);
}

export async function run(): Promise<void> {
  const args = await yargs(hideBin(process.argv))
    .command(
      'upload [assetId] [filename]',
      'upload a model to Google Storage',
      (yargs) => {
        return yargs
          .positional('assetId', {
            describe: 'ID of GLTF model',
            type: 'string',
          })
          .positional('filename', {
            describe: 'Save model as this name in the bucket',
            type: 'string',
          });
      },
    )
    .command(
      'meta [tokenId] [mechaName]',
      'upload metadata to Google Storage',
      (yargs) => {
        return yargs
          .positional('tokenId', {
            type: 'string',
          })
          .positional('mechaName', {
            type: 'string',
          });
      },
    )
    .command('suit', 'Generate random suit')
    .parse();

  const command = args._[0];

  switch (command) {
    case 'meta': {
      assert(args.mechaName && args.tokenId);
      await uploadMetadata(args.mechaName, args.tokenId);
      break;
    }
    case 'upload': {
      if (!args.filename || !args.assetId) {
        console.log('Missing required positional options');
        process.exit(-1);
      }
      if (!(args.assetId in AssetLibrary)) {
        console.log('Invalid asset ID');
        process.exit(-1);
      }
      await uploadModel(args.assetId as AssetID, args.filename);
      break;
    }
    case 'merge': {
      await runMergeModels();
      break;
    }
    case 'suit': {
      const suit = generateRandomSuit(SuitLibrary);
      const attributes = createTokenAttributes(suit);
      console.log(attributes);
      break;
    }
  }
}

run().then(() => process.exit(0));
