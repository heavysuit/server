import { Storage } from '@google-cloud/storage';
import { ethers } from 'ethers';
import * as functions from 'firebase-functions';
import { createMetadata } from '../createMetadata';
import { firebase } from '../firebase';
import { hs } from '../HeavySuit';
import { logger } from '../utils/logger';

const db = firebase.firestore();
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

    const doc = await db.collection('wallets').doc(address).get();
    const walletInfo = doc.data();
    if (!walletInfo?.whitelisted) {
      throw new Error('Your address is not allowed to mint');
    }

    if (deposits.lt(fee)) {
      throw new Error('Insufficient deposits');
    }

    if (!name) {
      throw new Error('Missing name');
    }

    const mintTx = await hs.manufacture(address);
    logger.info('Submitting transaction', { tx: mintTx });
    await mintTx.wait();

    const tokenBalance = await hs.balanceOf(address);
    const tokenId = await hs.tokenOfOwnerByIndex(address, tokenBalance.sub(1));

    const metadata = await createMetadata(name, tokenId.toString());
    logger.info('Uploading metadata', { tokenId, metadata });

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
