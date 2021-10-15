import { logger } from 'ethers';
import * as functions from 'firebase-functions';
import { firebase } from '../firebase';

const db = firebase.firestore();

export const joinWaitlist = functions.https.onRequest(
  async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Credentials', 'true');
    response.set('Access-Control-Allow-Headers', 'Content-Type');

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
  },
);
