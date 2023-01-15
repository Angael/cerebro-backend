import { mapSeries } from 'modern-async';

import { S3Delete, S3SimpleUpload } from '../../aws/s3-helpers.js';
import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';
import { IThumbnailBeforeUpload } from '../../models/IThumbnail.js';
import { Thumbnail } from '@prisma/client';

async function dbInsert(thumbnail: Thumbnail) {
  await prisma.thumbnail.create({
    data: {
      type: thumbnail.type,
      path: thumbnail.path,
      size: thumbnail.size,
      width: thumbnail.width,
      height: thumbnail.height,
      Item: {
        connect: {
          id: thumbnail.itemId,
        },
      },
    },
  });
}

export async function uploadThumbnails(thumbnails: IThumbnailBeforeUpload[]) {
  return await mapSeries(thumbnails, async (t) => {
    await S3SimpleUpload({
      key: t.thumbnail.path,
      filePath: t.diskPath,
    });
    try {
      await dbInsert(t.thumbnail);
    } catch (e) {
      logger.error(
        'Error inserting thumbnail into db. Delete s3 thumb for itemId %i',
        t.thumbnail.itemId,
      );
      await S3Delete(t.thumbnail.path);
      throw e;
    }
    return t.diskPath;
  });
}
