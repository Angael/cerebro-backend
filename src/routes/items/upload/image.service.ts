import sharp from 'sharp';
// import imghash from 'imghash';
import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { IImageData } from '../../../models/IItem.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { prisma } from '../../../db/db.js';
import { ItemType, Processed } from '@prisma/client';

async function insertIntoDb(
  s3Key: string,
  itemData: IImageData,
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
): Promise<void> {
  await prisma.item.create({
    data: {
      userUid: author.uid,
      type: ItemType.IMAGE,
      private: false,
      processed: Processed.NO,
      Image: {
        create: {
          // filename: file.originalname,
          path: s3Key,
          size: file.size,
          width: itemData.width,
          height: itemData.height,
          animated: itemData.animated,
        },
      },
    },
  });
}

async function analyze(file: Express.Multer.File): Promise<IImageData> {
  const pipeline = sharp(file.path);

  return pipeline.metadata().then(async (metadata) => {
    const frameHeight = metadata.pageHeight ?? metadata.height ?? 0;
    const frameWidth = metadata.width ?? 0;
    const isAnimated = metadata.pages > 1 ?? false;

    // let hash = '';
    // if (!isAnimated) {
    //   hash = (await imghash
    //     .hash(file.path)
    //     .then((hash) => hash)
    //     .catch((err) => '')) as string;
    // }

    return {
      width: frameWidth,
      height: frameHeight,
      animated: isAnimated,
    };
  });
}

export async function uploadImage(
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
): Promise<void> {
  const imageData = await analyze(file);

  const key = makeS3Path(author.uid, 'source', replaceFileWithHash(file.originalname));

  await S3SimpleUpload({
    key,
    filePath: file.path,
  });

  try {
    await insertIntoDb(key, imageData, file, author);
  } catch (e) {
    logger.error('Failed to insert image into DB, %O', e);
    S3Delete(file.path);
  }
}
