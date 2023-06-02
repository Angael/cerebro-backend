import sharp, { OutputInfo, Sharp } from 'sharp';
import async, { AsyncResultCallback } from 'async';
import { nanoid } from 'nanoid';
import logger from '../../../utils/log.js';
import { IGeneratedThumbnail, IThumbnailMeasure } from '../../../models/IThumbnail.js';
import { calculateThumbnailDimensions } from '../../../utils/calculateThumbnailDimensions.js';
import { OPTIMIZATION_DIR, THUMBNAILS_DIR } from '../../../utils/consts.js';
import { join } from 'path';
import fs from 'fs-extra';

type resizeArgs = {
  pipeline: Sharp;
  width: number;
  height: number;
};

async function measure(sharpPipeline): Promise<IThumbnailMeasure[]> {
  return sharpPipeline.metadata().then((metadata) => {
    let frameHeight = metadata.pageHeight || metadata.height;
    let frameWidth = metadata.width;

    // Swap width and height if orientation is portrait
    if ([6, 8, 5, 7].includes(metadata.orientation)) {
      const temp = frameHeight;
      frameHeight = frameWidth;
      frameWidth = temp;
    }

    return calculateThumbnailDimensions(frameWidth, frameHeight);
  });
}

async function resizeFileAndSave({
  pipeline,
  width,
  height,
}: resizeArgs): Promise<{ info: OutputInfo; path: string }> {
  const outPath = join(THUMBNAILS_DIR, nanoid() + '.webp');
  return pipeline
    .rotate()
    .resize(width, height)
    .webp()
    .toFile(outPath)
    .then((info) => ({ info, path: outPath }));
}

export async function generateThumbnails(filePath: string): Promise<IGeneratedThumbnail[]> {
  try {
    const animatedPipeline = sharp(filePath, { animated: false });

    const dimensions = await measure(animatedPipeline);

    // TODO: Make into modern-async, async fails at typechecking
    return await async.map(
      dimensions,
      (dimensions, callback: AsyncResultCallback<IGeneratedThumbnail>) => {
        resizeFileAndSave({
          pipeline: animatedPipeline,
          width: dimensions.width,
          height: dimensions.height,
        })
          .then(({ info, path }) => {
            callback(null, { diskPath: path, dimensions, size: info.size, animated: false });
          })
          .catch((error) => {
            // TODO: Need to unlink files that crashed!
            callback(error);
          });
      },
    );
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
}

type OptimizedSrc = {
  diskPath: string;
  height: number;
  width: number;
  size: number;
  animated: boolean;
};

export async function generateOptimizedSrc(filePath: string): Promise<OptimizedSrc> {
  try {
    let pipeline = sharp(filePath, { animated: true });

    const { width, height } = await pipeline.metadata().then((metadata) => {
      const frameHeight = metadata.pageHeight || metadata.height;
      const frameWidth = metadata.width;

      if (!frameHeight || !frameWidth) throw new Error('Could not get dimensions');

      return { height: frameHeight, width: frameWidth };
    });

    const MAX_SIZE = 1440;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      pipeline = pipeline.resize({
        fit: 'contain',
        ...(width > height ? { width: MAX_SIZE } : { height: MAX_SIZE }),
      });
    }

    const outPath = join(OPTIMIZATION_DIR, nanoid() + '.webp');
    await pipeline.rotate().webp().toFile(outPath);
    const metadata = await sharp(outPath).metadata();
    const size = await fs.stat(outPath).then((stat) => stat.size);

    return {
      diskPath: outPath,
      height: (metadata.pageHeight || metadata.height) ?? 0,
      width: metadata.width ?? 0,
      size,
      animated: metadata.pages ? metadata.pages > 1 : false,
    };
  } catch (e) {
    logger.error(e);
    throw new Error(e);
  }
}
