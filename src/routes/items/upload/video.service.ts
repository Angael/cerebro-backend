import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { prisma } from '../../../db/db.js';
import { ItemType, Processed } from '@prisma/client';
import { analyzeVideo, VideoStats } from '@vanih/dunes-node';
import { HttpError } from '../../../utils/errors/HttpError.js';

async function insertIntoDb(
  s3Key: string,
  videoData: VideoStats,
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
): Promise<any> {
  await prisma.item.create({
    data: {
      userUid: author.uid,
      type: ItemType.VIDEO,
      private: false,
      processed: Processed.NO,
      Video: {
        create: {
          path: s3Key,
          size: file.size,
          width: videoData.width,
          height: videoData.height,
          durationMs: videoData.duration,
          bitrateKb: videoData.bitrate,
        },
      },
    },
  });
}

export async function uploadVideo(file: Express.Multer.File, author: firebase.auth.DecodedIdToken) {
  const videoData = await analyzeVideo(file.path);

  const key = makeS3Path(author.uid, 'source', replaceFileWithHash(file.originalname));

  await S3SimpleUpload({
    key,
    filePath: file.path,
  });

  try {
    await insertIntoDb(key, videoData, file, author);
  } catch (e) {
    logger.error('Failed to insert video into DB. Error: %o', e.message);
    S3Delete(file.path);
    throw new HttpError(500);
  }
}
