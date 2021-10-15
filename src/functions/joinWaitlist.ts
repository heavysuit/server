import * as functions from 'firebase-functions';
import { firebase } from '../firebase';

const db = firebase.firestore();

export const joinWaitlist = functions.https.onRequest(
  async (request, response) => {
    const { address } = request.body as {
      address: string;
    };

    const collection = db.collection('wallets');
    const doc = await collection.doc(address).get();
    if (doc.exists) {
      throw new Error('Your wallet is already on the waitlist');
    }

    await db.collection('wallets').doc(address).set({
      whitelisted: false,
    });

    response.json({ success: true });
  },
);
