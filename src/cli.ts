import { strict as assert } from 'assert';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { ModelManifest } from './gltf/ModelManifest';
import { ModelMerger } from './gltf/ModelMerger';
import { uploadModel } from './gltf/uploadModel';
import {
  createTokenAttributes,
  createTokenMetadata
} from './nft/createTokenMetadata';
import { uploadTokenMetadata } from './nft/updateTokenMetadata';
import { BodyNode } from './shared/BodyNode';
import { Valiant } from './suits/M1-Valiant';
import { Haganenoken } from './suits/M2-Haganenoken';
import { Inferno } from './suits/M4-Inferno';
import { Centurion } from './suits/M5-Centurion';
import { generateRandomSuit } from './suits/SuitLibrary';

const SUITS = [Valiant, Haganenoken, Centurion, Inferno];

async function runMergeModels(assetName: string): Promise<void> {
  const manifests: ModelManifest[] = [
    {
      assetId: 'M5',
      nodes: [BodyNode.ArmR, BodyNode.ArmL],
    },
    {
      assetId: 'M1',
      nodes: [BodyNode.Legs, BodyNode.Torso],
    },
  ];

  const merger = new ModelMerger(assetName, manifests);
  merger.repositionJoints();
  await merger.mergeAndWrite();
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
      const suit = generateRandomSuit(args.suitName, SUITS);
      const merger = new ModelMerger(args.tokenId, suit.toManifests());
      merger.repositionJoints();
      await merger.mergeAndWrite();
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
      const suit = generateRandomSuit('Testing', SUITS);
      const attributes = createTokenAttributes(suit);
      console.log(attributes);
      console.log(suit.toManifests());
      break;
    }
  }
}

run().then(() => process.exit(0));
