import { logger } from 'ethers';
import * as functions from 'firebase-functions';
import { cors } from '../cors';
import { firebase } from '../firebase';

const db = firebase.firestore();

export const joinWaitlist = functions.https.onRequest(
  async (request, response) => {
    cors(request, response, async () => {
      const { address } = request.body as {
        address: string;
      };

      logger.info('Waitlist', { address });

      if (!address) {
        response.status(501);
        response.send('Missing address');
        return;
      }

      const collection = db.collection('wallets');
      const doc = await collection.doc(address).get();

      if (doc.exists) {
        response.send({ success: false });
        return;
      }

      await db.collection('wallets').doc(address).set({
        whitelisted: false,
      });

      response.json({ success: true });
    });
  },
);
