import { NodeIO } from '@gltf-transform/core';
import path from 'path';
import { hsBucket } from '../GCP';
import { getTextureBucketPath, shouldUploadToBucket } from './utils';

export const binDir = 'bin';
export const textureDir = 'textures';

export async function saveModel(
  modelName: string,
  localPath: string,
): Promise<void> {
  const io = new NodeIO();
  const doc = io.read(localPath);

  for (const t of doc.getRoot().listTextures()) {
    const uri = t.getURI();
    if (!shouldUploadToBucket(uri)) {
      console.log('Ignoring:', uri);
      continue;
    }

    const imagePath = path.join(path.dirname(localPath), uri);
    const bucketPath = getTextureBucketPath(modelName, uri);
    console.log(modelName, imagePath, bucketPath);

    const destination = hsBucket.file(bucketPath);
    await hsBucket.upload(imagePath, { destination });

    const url = destination.publicUrl();
    console.log(url);
  }
}
