import { hsBucket } from '../GCP';
import { TokenMetadata } from '../shared/TokenMetadata';
import { logger } from '../utils/logger';

export async function uploadTokenMetadata(
  metadata: TokenMetadata,
  version: string,
): Promise<void> {
  logger.info('Uploading metadata', { metadata });

  const blob = hsBucket.file(`versions/${version}.json`);
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