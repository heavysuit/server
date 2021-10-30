import { strict as assert } from 'assert';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { mergeModels } from './gltf/mergeModels';
import { ModelManifest } from './gltf/ModelManifest';
import { uploadModel } from './gltf/uploadModel';
import {
  createTokenAttributes,
  createTokenMetadata
} from './nft/createTokenMetadata';
import { uploadTokenMetadata } from './nft/updateTokenMetadata';
import { BodyNode } from './shared/BodyNode';
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
    .command('merge [assetName]', 'merge multiple mecha assets', (yargs) => {
      return yargs.positional('assetName', {
        type: 'string',
      });
    })
    .command('suit', 'Generate random suit')
    .command('mint [tokenId] [suitName]', 'Mint a new suit', (yargs) => {
      return yargs
        .positional('tokenId', {
          type: 'string',
        })
        .positional('suitName', {
          type: 'string',
        });
    })
    .parse();

  const command = args._[0];

  switch (command) {
    case 'mint': {
      assert(args.suitName && args.tokenId);
      const suit = generateRandomSuit(args.suitName, SuitLibrary);
      await mergeModels(args.tokenId, suit.toManifests());
      const { thumbnailUrl, url } = await uploadModel(args.tokenId);

      const metadata = createTokenMetadata({
        externalUrl: `http://heavysuit.com/suit/${args.tokenId}`,
        suit,
        thumbnailUrl,
        url,
      });

      await uploadTokenMetadata(metadata, args.tokenId);
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
      const suit = generateRandomSuit('Testing', SuitLibrary);
      const attributes = createTokenAttributes(suit);
      console.log(attributes);
      console.log(suit.toManifests());
      break;
    }
  }
}

run().then(() => process.exit(0));
