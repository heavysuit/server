import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { ModelManifest } from './gltf/ModelManifest';
import { ModelMerger } from './gltf/ModelMerger';
import { uploadModel } from './gltf/uploadModel';
import {
  cacheTokenId,
  countCache,
  createBatchScreenshots,
  generateRandomName,
  generateTokenId,
  listCache,
  saveHashes,
  uploadBatchScreenshots
} from './gltf/utils';
import {
  createTokenAttributes,
  createTokenMetadata
} from './nft/createTokenMetadata';
import { uploadTokenMetadata } from './nft/updateTokenMetadata';
import { BodyNode } from './shared/BodyNode';
import { SpadeC2 } from './suits/M6-Spade';
import { generateRandomSuit, SuitLibrary } from './suits/SuitLibrary';
import { logger } from './utils/logger';

logger.level = 'debug';

async function runMint(_tokenId?: string, _suitName?: string): Promise<void> {
  const suitName = _suitName || (await generateRandomName());
  const tokenId = _tokenId || (await generateTokenId());
  console.log(suitName, tokenId);

  const suit = generateRandomSuit(suitName, [SpadeC2]);
  const manifest = suit.toManifests();
  const merger = new ModelMerger(tokenId, manifest);
  merger.repositionJoints();
  await merger.mergeAndWrite();
  const { thumbnailUrl, url, gltfHash } = await uploadModel(tokenId);
  await cacheTokenId(tokenId, suitName);

  const metadata = createTokenMetadata({
    externalUrl: `http://heavysuit.com/version/${tokenId}`,
    description: `The Spade C2 was manufactured in limited quantities at the Offspring Company's secret research facility around the turn of the 23rd century. Significantly larger than the typical Heavy Suit, the Spade has a massive right arm known as the "Powerfist" that can deal a powerful blow.`,
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
      assetId: 'M1',
      nodes: [BodyNode.ArmR, BodyNode.ArmL],
    },
    {
      assetId: 'M2',
      nodes: [BodyNode.Head, BodyNode.Torso],
    },
    {
      assetId: 'M5',
      nodes: [BodyNode.Legs],
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
    .command('thumbs [assetName]', 'merge multiple mecha assets', (yargs) => {
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
    case 'thumbs': {
      if (args.assetName === 'upload') {
        await uploadBatchScreenshots();
        break;
      }

      const ids = await listCache();
      await createBatchScreenshots(args.assetName ? [args.assetName] : ids);
      break;
    }
    case 'mint': {
      await runMint(args.tokenId, args.suitName);
      break;
    }
    case 'upload': {
      if (args.assetName) {
        await uploadModel(args.assetName);
      } else {
        const files = await fs.promises.readdir(
          path.join(__dirname, '../assets'),
        );
        files.sort();
        console.log(files);
        for (const assetName of files) {
          if (!assetName.startsWith('M')) {
            await uploadModel(assetName);
          }
        }
      }

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
