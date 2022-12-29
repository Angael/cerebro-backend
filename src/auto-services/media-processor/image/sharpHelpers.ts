import sharp, { OutputInfo, Sharp } from 'sharp';
import async, { AsyncResultCallback } from 'async';
import { nanoid } from 'nanoid';
import logger from '../../../utils/log.js';
import { IGeneratedThumbnail, IThumbnailMeasure } from '../../../models/IThumbnail.js';
import { calculateThumbnailDimensions } from '../../../utils/calculateThumbnailDimensions.js';
import { THUMBNAILS_DIR } from '../../../utils/consts.js';

type resizeArgs = {
  pipeline: Sharp;
  width: number;
  height: number;
};

async function measure(sharpPipeline): Promise<IThumbnailMeasure[]> {
  return sharpPipeline.metadata().then((metadata) => {
    const frameHeight = metadata.pageHeight || metadata.height;
    const frameWidth = metadata.width;
    // const isAnimated = metadata.pages > 1;

    return calculateThumbnailDimensions(frameWidth, frameHeight);
  });
}

async function resizeFileAndSave({
  pipeline,
  width,
  height,
}: resizeArgs): Promise<{ info: OutputInfo; path: string }> {
  const outPath = THUMBNAILS_DIR + '/' + nanoid() + '.webp';
  return pipeline
    .resize(width, height)
    .webp({ pageHeight: height })
    .toFile(outPath)
    .then((info) => ({ info, path: outPath }));
}

export async function generateThumbnails(filePath: string): Promise<IGeneratedThumbnail[]> {
  try {
    const animatedPipeline = sharp(filePath, { animated: false });

    const dimensions = await measure(animatedPipeline);

    // TODO: Make into modern-async
    return await async.map(
      dimensions,
      (dimensions, callback: AsyncResultCallback<IGeneratedThumbnail>) => {
        resizeFileAndSave({
          pipeline: animatedPipeline,
          width: dimensions.width,
          height: dimensions.height,
        })
          .then(({ info, path }) => {
            callback(null, { diskPath: path, dimensions, size: info.size, isAnimated: false });
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
