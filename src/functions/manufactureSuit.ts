import { ethers } from 'ethers';
import * as functions from 'firebase-functions';
import { cors } from '../cors';
import { firebase } from '../firebase';
import { hsBucket } from '../GCP';
import { hs } from '../HeavySuit';
import { createTokenMetadata } from '../nft/createTokenMetadata';
import { Valiant } from '../suits/M1-Valiant';
import { logger } from '../utils/logger';

const db = firebase.firestore();

export async function uploadMetadata(
  mechaName: string,
  tokenId: string,
): Promise<void> {
  const metadata = await createTokenMetadata({
    name: mechaName,
    tokenId,
    suit: Valiant,
    thumbnailUrl: '',
    url: '',
  });
  logger.info('Uploading metadata', { tokenId, metadata });

  const blob = hsBucket.file(`versions/${tokenId}.json`);
  const blobStream = blob.createWriteStream();

  const promise = new Promise((resolve, reject) => {
    blobStream.on('error', (error) => {
      logger.error(error);
      reject(error);
    });
    blobStream.on('finish', () => resolve(true));
    blobStream.end(Buffer.from(JSON.stringify(metadata)));
  });

  await promise;
}

export const manufactureSuit = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .https.onRequest(async (request, response) => {
    cors(request, response, async () => {
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
        response.status(403);
        response.send('Your address is not allowed to mint');
        return;
      }

      if (deposits.lt(fee)) {
        response.status(402);
        response.send('Insufficient deposits');
        return;
      }

      if (!name) {
        response.status(400);
        response.send('Missing name');
        return;
      }

      const mintTx = await hs.manufacture(address);
      logger.info('Submitting transaction', { tx: mintTx });
      await mintTx.wait();

      const tokenBalance = await hs.balanceOf(address);
      const tokenId = await hs.tokenOfOwnerByIndex(
        address,
        tokenBalance.sub(1),
      );

      response.json({ tokenId: tokenId.toNumber() });
    });
  });
