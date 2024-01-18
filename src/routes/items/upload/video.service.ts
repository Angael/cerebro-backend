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
  userId: string,
  tags: Tag[],
) {
  return prisma.item.create({
    data: {
      userUid: userId,
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

export async function uploadVideo({ file, userId, tags }: uploadPayload) {
  const videoData = await analyzeVideo(file.path);

  const key = makeS3Path(userId, 'source', replaceFileWithHash(file.originalname));

  await S3SimpleUpload({
    key,
    filePath: file.path,
  });

  try {
    return await insertIntoDb(key, videoData, file, userId, tags);
  } catch (e) {
    logger.error('Failed to insert video into DB. Error: %o', e.message);
    S3Delete(file.path);
    throw new HttpError(500);
  }
}
