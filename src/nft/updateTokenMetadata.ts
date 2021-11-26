import fs from 'fs';
import path from 'path';
import { hsBucket } from '../GCP';
import { getLocalPath } from '../gltf/AssetLibrary';
import { generateHash } from '../gltf/utils';
import { TokenMetadata } from '../shared/TokenMetadata';
import { BATCH } from '../utils/globals';
import { logger } from '../utils/logger';

export async function uploadTokenMetadata(
  metadata: TokenMetadata,
  version: string,
): Promise<string> {
  logger.debug('Uploading metadata', { metadata });
  const content = Buffer.from(JSON.stringify(metadata));
  const metaHash = generateHash(content);

  const localPath = getLocalPath(version);
  await fs.promises.writeFile(
    path.join(path.dirname(localPath), 'metadata.json'),
    content,
  );
  await fs.promises.writeFile(
    path.join(path.dirname(localPath), `../metadata/${version}.json`),
    content,
  );

  const blob = hsBucket.file(`${BATCH}/${version}.json`);
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
