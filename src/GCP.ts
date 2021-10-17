import { Storage } from '@google-cloud/storage';

export const storage = new Storage();
export const hsBucket = storage.bucket('hs-metadata');
