import { hsBucket } from '../GCP';
import { generateHash } from '../gltf/utils';
import { TokenMetadata } from '../shared/TokenMetadata';
import { logger } from '../utils/logger';

export async function uploadTokenMetadata(
  metadata: TokenMetadata,
  version: string,
): Promise<string> {
  logger.info('Uploading metadata', { metadata });
  const content = Buffer.from(JSON.stringify(metadata));
  const metaHash = generateHash(content);

  const blob = hsBucket.file(`production/${version}.json`);
  const blobStream = blob.createWriteStream();

  const promise = new Promise((resolve, reject) => {
    blobStream.on('error', (error) => {
      logger.error(error);
      reject(error);
    });
    blobStream.on('finish', () => resolve(true));
    blobStream.end(content);
  });

  await promise;

  logger.info('Metadata', { url: blob.publicUrl() });
  return metaHash;
}
