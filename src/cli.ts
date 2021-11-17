import { strict as assert } from 'assert';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { ModelManifest } from './gltf/ModelManifest';
import { ModelMerger } from './gltf/ModelMerger';
import { uploadModel } from './gltf/uploadModel';
import { countCache, generateRandomName, generateTokenId, saveHashes } from './gltf/utils';
import {
  createTokenAttributes,
  createTokenMetadata
} from './nft/createTokenMetadata';
import { uploadTokenMetadata } from './nft/updateTokenMetadata';
import { BodyNode } from './shared/BodyNode';
import { generateRandomSuit, SuitLibrary } from './suits/SuitLibrary';

async function runMint(_tokenId?: string, _suitName?: string): Promise<void> {
  const suitName = _suitName || (await generateRandomName());
  const tokenId = _tokenId || (await generateTokenId(suitName));
  console.log(suitName, tokenId);
  const suit = generateRandomSuit(suitName, SuitLibrary);
  const merger = new ModelMerger(tokenId, suit.toManifests());
  merger.repositionJoints();
  await merger.mergeAndWrite();
  const { thumbnailUrl, url, gltfHash } = await uploadModel(tokenId);

  const metadata = createTokenMetadata({
    externalUrl: `http://heavysuit.com/version/${tokenId}`,
    suit,
    thumbnailUrl,
    url,
  });

  const metaHash = await uploadTokenMetadata(metadata, tokenId);
  await saveHashes(tokenId, metaHash, gltfHash);
}

async function runMergeModels(assetName: string): Promise<void> {
  const manifests: ModelManifest[] = [
    {
      assetId: 'M8',
      nodes: [BodyNode.ArmR, BodyNode.ArmL],
    },
    {
      assetId: 'M3',
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
    .command('mass [count]', 'Mint multiple suits', (yargs) => {
      return yargs.positional('count', {
        type: 'number',
      });
    })
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
    case 'count': {
      const count = await countCache();
      console.log(count);
      break;
    }
    case 'name': {
      for (let i = 0; i < 20; i++) {
        const name = await generateRandomName();
        console.log(name);
      }
      break;
    }
    case 'mass': {
      assert(args.count);
      for (let i = 0; i < args.count; i++) {
        await runMint();
      }
      break;
    }
    case 'mint': {
      runMint(args.tokenId, args.suitName);
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
