import sharp from 'sharp';
// import imghash from 'imghash';
import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { prisma } from '../../../db/db.js';
import { ItemType, Processed } from '@prisma/client';
import { HttpError } from '../../../utils/errors/HttpError.js';
import { uploadPayload } from './upload.type.js';

type Analysis = {
  width: number;
  height: number;
  animated: boolean;
};

async function insertIntoDb(
  s3Key: string,
  itemData: Analysis,
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
  tags: string[],
) {
  return await prisma.item.create({
    data: {
      userUid: author.uid,
      type: ItemType.IMAGE,
      private: false,
      processed: Processed.NO,
      Image: {
        create: {
          path: s3Key,
          size: file.size,
          width: itemData.width,
          height: itemData.height,
          animated: itemData.animated,
        },
      },
      tags: {
        create: tags.map((name) => ({
          tag: { create: { name } },
        })),
      },
    },
  });
}

async function analyze(file: Express.Multer.File): Promise<Analysis> {
  const pipeline = sharp(file.path);

  return pipeline.metadata().then(async (metadata) => {
    const frameHeight = metadata.pageHeight ?? metadata.height ?? 0;
    const frameWidth = metadata.width ?? 0;
    const isAnimated = metadata.pages ? metadata.pages > 1 : false;

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

export async function uploadImage({ file, user, tags }: uploadPayload) {
  const imageData = await analyze(file);

  const key = makeS3Path(user.uid, 'source', replaceFileWithHash(file.originalname));

  await S3SimpleUpload({
    key,
    filePath: file.path,
  });

  try {
    return await insertIntoDb(key, imageData, file, user, tags);
  } catch (e) {
    logger.error('Failed to insert image into DB, %O', e);
    S3Delete(file.path);
    throw new HttpError(500);
  }
}
