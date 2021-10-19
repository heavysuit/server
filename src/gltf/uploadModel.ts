import { NodeIO } from '@gltf-transform/core';
import fs from 'fs';
import path from 'path';
import { hsBucket } from '../GCP';
import { logger } from '../utils/logger';
import { createScreenshot } from './createScreenshot';
import {
  getBufferBucketPath,
  getGLTFBucketPath,
  getTextureBucketPath,
  getThumbnailBucketPath,
  shouldUploadToBucket,
  uploadResourceFile
} from './utils';

export const binDir = 'bin';
export const textureDir = 'textures';

export async function uploadModel(
  modelName: string,
  localPath: string,
): Promise<void> {
  const io = new NodeIO();
  const doc = io.read(localPath);

  // Reformat the file and buffers to match @gltf-transform's expectations
  io.write(localPath, doc);

  for (const t of doc.getRoot().listTextures()) {
    const uri = t.getURI();
    if (!shouldUploadToBucket(uri)) {
      logger.info(`Ignoring: ${uri}`);
      continue;
    }

    const imagePath = path.join(path.dirname(localPath), uri);
    const bucketPath = getTextureBucketPath(uri);

    const file = await uploadResourceFile(imagePath, bucketPath);
    logger.info(`${file.publicUrl()}\n`);

    t.setURI(file.publicUrl());
  }

  for (const b of doc.getRoot().listBuffers()) {
    const uri = b.getURI();
    if (!shouldUploadToBucket(uri)) {
      logger.info(`Ignoring: ${uri}`);
      continue;
    }

    const bufferPath = path.join(path.dirname(localPath), uri);
    const bucketPath = getBufferBucketPath(uri);

    const file = await uploadResourceFile(bufferPath, bucketPath);
    logger.info(`${file.publicUrl()}\n`);

    b.setURI(file.publicUrl());
  }

  const { json } = io.writeJSON(doc);
  const tmpDir = fs.mkdtempSync('/tmp/');
  const gltfPath = `${tmpDir}/${modelName}.gltf`;

  const fd = fs.openSync(gltfPath, 'w');
  fs.writeFileSync(fd, JSON.stringify(json, null, 2));
  fs.close(fd);

  const destination = getGLTFBucketPath(modelName);
  logger.info(`Uploading GLTF to: ${destination}`);
  const [file] = await hsBucket.upload(gltfPath, {
    destination: hsBucket.file(destination),
  });

  const screenshotPath = `${tmpDir}/screenshot.png`;
  await createScreenshot(file.publicUrl(), screenshotPath);
  const thumbnail = hsBucket.file(getThumbnailBucketPath(modelName));
  logger.info(`Uploading thumbnail to: ${thumbnail.publicUrl()}`);
  await hsBucket.upload(screenshotPath, {
    destination: thumbnail,
  });
}