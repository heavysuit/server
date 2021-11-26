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
  cacheTokenId,
  countParts,
  createBatchScreenshots,
  downloadData,
  generateRandomName,
  generateTokenId,
  listCache,
  randomizeTextures,
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
import { TEXTURES } from './utils/globals';
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
    t++;
  }

  const manifest = suit.toManifests();
  const merger = new ModelMerger(tokenId, manifest);
  merger.repositionJoints();
  await merger.mergeAndWrite();
  const { thumbnailUrl, url, gltfHash } = await uploadModel(tokenId);
  await cacheTokenId(tokenId, suitName);

  const metadata = createTokenMetadata({
    externalUrl: `http://heavysuit.com/version/${tokenId}`,
    suit,
    thumbnailUrl,
    url,
  });
  const metaHash = await uploadTokenMetadata(metadata, tokenId);
  await saveHashes(tokenId, metaHash, gltfHash);
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
    .parse();

  const command = args._[0];

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
      const targets = {
        jc1: 41,
        jc2: 36,
        jc3: 1,
        jc4: 0,
        jc5: 0,
        jc6: 0,
        gdr1: 41,
        gdr2: 35,
        gdr3: 0,
        gdr4: 43,
        gdr5: 0,
        unit00: 0,
        unit01: 0,
        unit02: 0,
        'unit00-2': 0,
      };
      for (const [t, c] of Object.entries(targets)) {
        for (let i = 0; i < c; i++) {
          await runMint(undefined, undefined, [t as TextureName]);
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
    case 'data': {
      await downloadData();
      break;
    }
    case 'cleanup': {
      await removeStaleMetadata();
      break;
    }
  }
}

run().then(() => process.exit(0));
