import { Storage } from '@google-cloud/storage';
import { ethers } from 'ethers';
import * as functions from 'firebase-functions';
import { createMetadata } from './createMetadata';
import { hs } from './HeavySuit';
import { logger } from './utils/logger';

const storage = new Storage();

export const manufactureSuit = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .https.onRequest(async (request, response) => {
    const { address, name } = request.body as {
      address: string;
      name: string;
    };
    const fee = await hs.orderFee();
    const deposits = await hs.depositOf(address);
    logger.info(address, {
      address,
      fee: ethers.utils.formatEther(fee),
      deposits: ethers.utils.formatEther(deposits),
    });

    if (deposits.lt(fee)) {
      throw new Error('Insufficient deposits');
    }

    if (!name) {
      throw new Error('Missing name');
    }

    const mintTx = await hs.manufacture(address);
    await mintTx.wait();

    const tokenBalance = await hs.balanceOf(address);
    const tokenId = await hs.tokenOfOwnerByIndex(address, tokenBalance.sub(1));

    const metadata = await createMetadata(name, tokenId.toString());

    const bucketName = 'hs-metadata';
    const bucket = storage.bucket(bucketName);

    const blob = bucket.file(`versions/${tokenId}.json`);
    const blobStream = blob.createWriteStream();

    const promise = new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', () => resolve(true));
      blobStream.end(Buffer.from(JSON.stringify(metadata)));
    });

    await promise;

    response.json({ tokenId: tokenId.toNumber() });
  });
