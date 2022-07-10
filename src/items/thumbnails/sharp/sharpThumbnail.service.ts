import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import sharp, { OutputInfo, Sharp } from 'sharp';
import { getDimensions } from '../getWHWithSameAspectRatio';
import async, { AsyncResultCallback } from 'async';

import { IFile } from '../../../models/IItem';
import { THUMBNAILS_DIR } from '../../../utils/consts';
import { nanoid } from 'nanoid';
import { IGeneratedThumbnail, IThumbnailMeasure } from '../../../models/IThumbnail';

type resizeArgs = {
  pipeline: Sharp;
  width: number;
  height: number;
};

@Injectable()
export class SharpThumbnailService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {}

  async measure(sharpPipeline): Promise<IThumbnailMeasure[]> {
    return sharpPipeline.metadata().then((metadata) => {
      const frameHeight = metadata.pageHeight || metadata.height;
      const frameWidth = metadata.width;
      // const isAnimated = metadata.pages > 1;

      return getDimensions(frameWidth, frameHeight);
    });
  }

  resizeFileAndSave({
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

  async run(file: IFile, filePath: string): Promise<IGeneratedThumbnail[]> {
    try {
      const animatedPipeline = sharp(filePath, { animated: false });

      const dimensions = await this.measure(animatedPipeline);

      // TODO: Make into modern-async
      return await async.map(
        dimensions,
        (dimensions, callback: AsyncResultCallback<IGeneratedThumbnail>) => {
          this.resizeFileAndSave({
            pipeline: animatedPipeline,
            width: dimensions.width,
            height: dimensions.height,
          })
            .then(({ info, path }) => {
              callback(null, { diskPath: path, dimensions, size: info.size, isAnimated: false });
            })
            .catch((error) => {
              callback(error);
            });
        },
      );
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }
  }
}
