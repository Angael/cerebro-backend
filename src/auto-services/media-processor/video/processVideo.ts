import { mapSeries } from 'modern-async';
import { S3Download } from '../../../aws/s3-helpers.js';
import { IGeneratedThumbnail, IThumbnailBeforeUpload } from '../../../models/IThumbnail.js';
import { getNameFromS3Path, makeS3Path } from '../../../utils/makeS3Path.js';
import { changeExtension } from '../../../utils/changeExtension.js';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import { prisma } from '../../../db/db.js';
import { uploadThumbnails } from '../uploadThumbnails.js';
import { Item, Video } from '@prisma/client';
import { calculateThumbnailDimensions } from '../../../utils/calculateThumbnailDimensions.js';
import { createThumbnail } from '@vanih/dunes-node';
import { join } from 'path';
import { THUMBNAILS_DIR } from '../../../utils/consts.js';
import { nanoid } from 'nanoid';
import logger from '../../../utils/log.js';
import fs from 'fs-extra';

function fetchDetails(item: Item) {
  return prisma.video.findFirst({ where: { itemId: item.id } });
}

async function generateThumbnails(video: Video, path: string): Promise<IGeneratedThumbnail[]> {
  const dimensions = calculateThumbnailDimensions(video.width, video.height);

  const dimensionsWithPath = dimensions.map((dimension) => ({
    dimension,
    outPath: join(THUMBNAILS_DIR, nanoid() + '.webp'),
  }));

  try {
    return mapSeries(dimensionsWithPath, async ({ dimension, outPath }) => {
      const { width, height, type } = dimension;

      await createThumbnail(path, outPath, {
        height,
        width,
      });

      const { size } = await fs.stat(outPath);

      const generatedThumbnail: IGeneratedThumbnail = {
        dimensions: type,
        size,
        animated: false,
        diskPath: outPath,
      };

      return generatedThumbnail;
    });
  } catch (e) {
    betterUnlink(dimensionsWithPath.map((t) => t.outPath));
    logger.error('Failed to generate thumbnails for video %o', video);
    throw new Error('Failed to generate thumbnails');
  }
}

export async function processVideo(item: Item) {
  const videoRow = await fetchDetails(item);
  const download = await S3Download(videoRow.path);

  try {
    const generatedThumbs = await generateThumbnails(videoRow, download);

    let thumbnails: IThumbnailBeforeUpload[] = generatedThumbs.map((t) => ({
      thumbnail: {
        itemId: item.id,
        type: t.dimensions.type,
        width: t.dimensions.width,
        height: t.dimensions.height,
        path: makeS3Path(
          item.userUid,
          t.dimensions.type,
          changeExtension(getNameFromS3Path(videoRow.path), 'webp'),
        ),
        size: t.size,
      },
      diskPath: t.diskPath,
    }));

    try {
      await uploadThumbnails(thumbnails);
    } catch (e) {
      //
    } finally {
      betterUnlink(thumbnails.map((t) => t.diskPath));
    }
  } catch (e) {
    //
  } finally {
    betterUnlink(download);
  }
}
