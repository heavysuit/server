import { strict as assert } from 'assert';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { uploadMetadata } from './functions/manufactureSuit';
import { mergeModels } from './gltf/mergeModels';
import { BodyNode, ModelManifest } from './gltf/ModelManifest';
import { uploadModel } from './gltf/uploadModel';
import { createTokenAttributes } from './nft/createTokenMetadata';
import { generateRandomSuit, SuitLibrary } from './suits/SuitLibrary';

async function runMergeModels(assetName: string): Promise<void> {
  const manifests: ModelManifest[] = [
    {
      assetId: 'M1',
      nodes: [BodyNode.Torso, BodyNode.ArmR],
    },
    {
      assetId: 'M2',
      nodes: [BodyNode.ArmL],
    },
    {
      assetId: 'M3',
      nodes: [BodyNode.Legs],
    },
  ];

  await mergeModels(assetName, manifests);
}

export async function run(): Promise<void> {
  const args = await yargs(hideBin(process.argv))
    .command(
      'upload [assetName]',
      'upload a model to Google Storage',
      (yargs) => {
        return yargs.positional('assetName', {
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
    .command('merge [assetName]', 'merge multiple mecha assets', (yargs) => {
      return yargs.positional('assetName', {
        type: 'string',
      });
    })
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
      assert(args.assetName);
      await uploadModel(args.assetName);
      break;
    }
    case 'merge': {
      assert(args.assetName);
      await runMergeModels(args.assetName);
      break;
    }
    case 'suit': {
      const suit = generateRandomSuit(SuitLibrary);
      const attributes = createTokenAttributes(suit);
      console.log(attributes);
      console.log(suit.toManifests());
      break;
    }
  }
}

run().then(() => process.exit(0));
