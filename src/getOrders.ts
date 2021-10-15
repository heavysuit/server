import { ethers } from 'ethers';
import * as functions from 'firebase-functions';
import { hs } from './HeavySuit';

export const getOrders = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .https.onRequest(async (request, response) => {
    const events = await hs.queryFilter(hs.filters.OrderPlaced());
    const args = events.map((e) => {
      const [pilot, weiAmount] = e.args;
      return { pilot, ethAmount: ethers.utils.formatEther(weiAmount) };
    });

    response.json({ events: args });
  });
