import { ethers } from 'ethers';
import * as functions from 'firebase-functions';
import { hs } from './HeavySuit';
import { logger } from './utils/logger';

export const manufactureSuit = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .https.onRequest(async (request, response) => {
    const { address } = request.body;
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

    const mintTx = await hs.manufacture(address);
    await mintTx.wait();

    const tokenBalance = await hs.balanceOf(address);
    const tokenId = await hs.tokenOfOwnerByIndex(address, tokenBalance.sub(1));

    response.json({ tokenId: tokenId.toNumber() });
  });
