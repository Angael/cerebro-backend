import { mapSeries } from 'modern-async';

import { S3Delete, S3SimpleUpload } from '../../aws/s3-helpers.js';
import { db } from '../../db/db.js';
import logger from '../../utils/log.js';
import { IThumbnailBeforeUpload, IThumbnailPayload } from '../../models/IThumbnail.js';
import { DB_TABLE } from '../../utils/consts.js';

async function s3Upload(thumbnailPayload: IThumbnailBeforeUpload) {
  return S3SimpleUpload({
    key: thumbnailPayload.thumbnail.path,
    filePath: thumbnailPayload.diskPath,
  });
}

async function dbInsert(thumbnail: IThumbnailPayload) {
  return db.transaction(async (trx) => {
    await db(DB_TABLE.thumbnail).transacting(trx).insert(thumbnail);
  });
}

export async function uploadThumbnails(thumbnails: IThumbnailBeforeUpload[]) {
  return await mapSeries(thumbnails, async (t) => {
    await s3Upload(t);
    try {
      await dbInsert(t.thumbnail);
    } catch (e) {
      logger.error(
        'Error inserting thumbnail into db. Delete s3 thumb for itemId %i',
        t.thumbnail.item_id,
      );
      await S3Delete(t.thumbnail.path);
    }
    return t.diskPath;
  });
}
