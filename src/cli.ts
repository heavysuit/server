import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { timeDelta } from './gltf/createScreenshot';
import { ModelManifest } from './gltf/ModelManifest';
import { ModelMerger } from './gltf/ModelMerger';
import { PaintName, TextureName } from './gltf/PaintName';
import { uploadModel } from './gltf/uploadModel';
import {
  countParts,
  createBatchScreenshots,
  downloadData,
  generateRandomName,
  generateTokenId,
  listCache,
  randomizeTextures,
  removeStaleAssets,
  removeStaleMetadata,
  saveHashes,
  seenMetadata,
  uploadBatchScreenshots,
} from './gltf/utils';
import {
  createTokenAttributes,
  createTokenMetadata,
} from './nft/createTokenMetadata';
import { uploadTokenMetadata } from './nft/updateTokenMetadata';
import { BodyNode } from './shared/BodyNode';
import { generateRandomSuit, SuitLibrary } from './suits/SuitLibrary';
import { GEN_TARGETS, TEXTURES } from './utils/globals';
import { logger } from './utils/logger';

logger.level = 'info';

async function runMint(
  _tokenId?: string,
  _suitName?: string,
  textures: TextureName[] = TEXTURES,
  paintName?: string,
): Promise<void> {
  const suitName = _suitName || (await generateRandomName());
  const tokenId = _tokenId || (await generateTokenId());
  if (!paintName) {
    paintName = textures.length > 1 ? 'Rainbow Mix' : PaintName[textures[0]];
  }
  logger.info('🤖 Mint', { suitName, tokenId, paintName });
  assert(paintName, textures[0]);

  await randomizeTextures(textures);

  const genT0 = performance.now();
  let t = 1;
  let suit = generateRandomSuit(suitName, SuitLibrary);
  suit.paint = paintName;
  while (true) {
    const metadata = createTokenMetadata({
      externalUrl: '',
      suit,
      thumbnailUrl: '',
      url: '',
    });
    if (!seenMetadata(metadata)) {
      const genT1 = performance.now();
      logger.info(`Generation took ${timeDelta(genT0, genT1)}`);
      if (t > 1) {
        logger.warn(`Took ${t} tries`);
      }
      break;
    }
    suit = generateRandomSuit(suitName, SuitLibrary);
    suit.paint = paintName;
    t++;
  }

  const manifest = suit.toManifests();
  const merger = new ModelMerger(tokenId, manifest);
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
  await saveHashes(suitName, tokenId, metaHash, gltfHash, paintName);
  console.log('');
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
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    })
    .option('video', {
      type: 'boolean',
      description: 'Create videos',
    })
    .parse();

  const command = args._[0];

  if (args.verbose) {
    logger.level = 'debug';
  }

  switch (command) {
    case 'count': {
      await countParts();
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
      await countParts();
      const start = performance.now();
      for (let i = 0; i < args.count; i++) {
        await runMint();
      }
      const delta = timeDelta(start, performance.now());
      console.log(args.count, 'in', delta, 's');
      break;
    }
    case 'mass2': {
      await countParts();
      for (const [t, c] of Object.entries(GEN_TARGETS)) {
        for (let i = 0; i < c; i++) {
          try {
            await runMint(undefined, undefined, [t as TextureName]);
          } catch (error) {
            logger.error(error);
          }
        }
      }
      break;
    }
    case 'thumbs': {
      if (args.assetName === 'upload') {
        await uploadBatchScreenshots();
        break;
      }

      const ids = await listCache();
      await createBatchScreenshots(
        args.assetName ? [args.assetName] : ids,
        args.video,
      );
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
    case 'data': {
      await downloadData();
      break;
    }
    case 'cleanup': {
      await removeStaleMetadata();
      await removeStaleAssets();
      break;
    }
  }
}

run().then(() => process.exit(0));
