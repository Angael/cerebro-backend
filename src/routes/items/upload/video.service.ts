import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { prisma } from '../../../db/db.js';
import { ItemType, Processed, Tag } from '@prisma/client';
import { analyzeVideo, VideoStats } from '@vanih/dunes-node';
import { HttpError } from '../../../utils/errors/HttpError.js';
import { MyFile, uploadPayload } from './upload.type.js';

async function insertIntoDb(
  s3Key: string,
  videoData: VideoStats,
  file: MyFile,
  author: firebase.auth.DecodedIdToken,
  tags: Tag[],
) {
  return await prisma.item.create({
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
          durationMs: videoData.durationMs,
          bitrateKb: videoData.bitrateKb,
        },
      },
      tags: {
        createMany: {
          data: tags.map((tag) => ({ tagId: tag.id })),
        },
      },
    },
  });
}

export async function uploadVideo({ file, user, tags }: uploadPayload) {
  console.log('uploading video', file, user, tags);
  // TODO: files doesnt exist? BUG?
  const videoData = await analyzeVideo(file.path);

  const key = makeS3Path(user.uid, 'source', replaceFileWithHash(file.originalname));

  console.log('S3SimpleUpload');

  await S3SimpleUpload({
    key,
    filePath: file.path,
  });
  console.log('uploaded');

  try {
    return await insertIntoDb(key, videoData, file, user, tags);
  } catch (e) {
    logger.error('Failed to insert video into DB. Error: %o', e.message);
    S3Delete(file.path);
    throw new HttpError(500);
  }
}
