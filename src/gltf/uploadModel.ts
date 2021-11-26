import { NodeIO } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';
import { hsBucket } from '../GCP';
import { logger } from '../utils/logger';
import { AssetName, getLocalPath } from './AssetLibrary';
import { createScreenshot } from './createScreenshot';
import {
  generateHash,
  getBufferBucketPath,
  getGLTFBucketPath,
  getTextureBucketPath,
  getThumbnailBucketPath,
  shouldUploadToBucket,
  uploadResourceFile,
  uploadScreenshot,
} from './utils';

export async function uploadModel(assetName: AssetName): Promise<{
  url: string;
  thumbnailUrl: string;
  gltfHash: string;
}> {
  const io = new NodeIO();
  const localPath = getLocalPath(assetName);
  const doc = io.read(localPath);

  // Reformat the file and buffers to match @gltf-transform's expectations
  io.write(localPath, doc);

  if (true) {
    // manual toggle if textures fully uploaded
    const promises = doc
      .getRoot()
      .listTextures()
      .map(async (t) => {
        const uri = t.getURI();
        if (!shouldUploadToBucket(uri)) {
          logger.debug(`Ignoring: ${uri}`);
          return;
        }

        const imagePath = path.join(path.dirname(localPath), uri);
        const bucketPath = getTextureBucketPath(uri);

        const file = await uploadResourceFile(imagePath, bucketPath);
        logger.debug(`${file.publicUrl()}\n`);

        t.setURI(file.publicUrl());
      });
    await Promise.all(promises);
  }

  for (const b of doc.getRoot().listBuffers()) {
    const uri = b.getURI();
    if (!shouldUploadToBucket(uri)) {
      logger.debug(`Ignoring: ${uri}`);
      continue;
    }

    const bufferPath = path.join(path.dirname(localPath), uri);
    const bucketPath = getBufferBucketPath(uri);

    const file = await uploadResourceFile(bufferPath, bucketPath);
    logger.debug(`${file.publicUrl()}\n`);

    b.setURI(file.publicUrl());
  }

  const { json } = io.writeJSON(doc);
  const tmpDir = await fs.promises.mkdtemp('/tmp/');
  const gltfPath = `${tmpDir}/${assetName}.gltf`;

  const gltfContent = JSON.stringify(json, null, 2);
  await fs.promises.writeFile(gltfPath, gltfContent);

  const destination = getGLTFBucketPath(assetName);
  logger.debug(`Uploading GLTF to: ${destination}`);
  const [file] = await hsBucket.upload(gltfPath, {
    destination: hsBucket.file(destination),
  });

  const screenshotPath = path.join(path.dirname(localPath), 'screenshot.png');
  await createScreenshot(file.publicUrl(), screenshotPath);
  const thumbnail = await uploadScreenshot(
    screenshotPath,
    getThumbnailBucketPath(assetName),
  );

  return {
    url: file.publicUrl(),
    thumbnailUrl: thumbnail.publicUrl(),
    gltfHash: generateHash(Buffer.from(gltfContent)),
  };
}
