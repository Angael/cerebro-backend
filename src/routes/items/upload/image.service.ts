import sharp from 'sharp';
import imghash from 'imghash';
import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { IImage, IImageData, IItem, ItemType, SpaceOptimized } from '../../../models/IItem.js';
import { DB_TABLE } from '../../../utils/consts.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { ThumbnailSize } from '../../../models/IThumbnail.js';
import { db } from '../../../db/db.js';

async function saveToS3(file: Express.Multer.File, key: string): Promise<any> {
  return S3SimpleUpload({
    key,
    filePath: file.path,
  });
}

async function insertIntoDb(
  s3Key: string,
  itemData: IImageData,
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
): Promise<void> {
  return db.transaction(async (trx) => {
    const item: IItem = {
      account_uid: author.uid,
      type: ItemType.image,
      private: false,
      processed: SpaceOptimized.no,
    };

    const item_id = await db(DB_TABLE.item).transacting(trx).insert(item);

    const image: IImage = {
      item_id: item_id[0],
      filename: file.originalname,
      path: s3Key,
      size: file.size,
      ...itemData,
    };

    await db(DB_TABLE.image).transacting(trx).insert(image);
  });
}

async function analyze(file: Express.Multer.File): Promise<IImageData> {
  const pipeline = sharp(file.path);

  return pipeline.metadata().then(async (metadata) => {
    const frameHeight = metadata.pageHeight ?? metadata.height ?? 0;
    const frameWidth = metadata.width ?? 0;
    const isAnimated = metadata.pages > 1 ?? false;

    let hash = '';
    if (!isAnimated) {
      hash = (await imghash
        .hash(file.path)
        .then((hash) => hash)
        .catch((err) => '')) as string;
    }

    return {
      width: frameWidth,
      height: frameHeight,
      isAnimated,
      hash,
    };
  });
}

export async function uploadImage(
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
): Promise<void> {
  const imageData = await analyze(file);

  const key = makeS3Path(author.uid, ThumbnailSize.source, replaceFileWithHash(file.originalname));

  await saveToS3(file, key);

  try {
    await insertIntoDb(key, imageData, file, author);
  } catch (e) {
    logger.error('Failed to insert image into DB');
    S3Delete(file.path);
  }
}
