import { exec } from 'child_process';
import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { IVideoData } from '../../../models/IItem.js';
import { FFPROBE_PATH } from '../../../utils/consts.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { prisma } from '../../../db/db.js';
import { ItemType, Processed } from '@prisma/client';

async function insertIntoDb(
  s3Key: string,
  videoData: IVideoData,
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
          duration: videoData.duration,
          bitrate: videoData.bitrate,
        },
      },
    },
  });
}

async function analyze(path: string): Promise<IVideoData> {
  return new Promise((resolve, _reject) => {
    exec(`${FFPROBE_PATH} -hide_banner -i "${path}"`, {}, (_error, _stdout, stderr) => {
      // regexpy na to wszystko
      const durationMatch = stderr.match(/Duration: ([\d:.]+)/);
      const durationString = durationMatch && durationMatch[1];
      // "00:00:15.01"

      const durationInSec = durationString!
        .split(':')
        .reverse()
        .reduce((acc, v, i) => acc + Number(v) * Math.pow(60, i), 0);

      const bitrateMatch = stderr.match(/bitrate: (\d+) ([\w/]+)/);
      const bitrateNum = Number(bitrateMatch && bitrateMatch[1]);
      // const bitrateUnit = bitrateMatch && bitrateMatch[2]; "kb/s" seems always kb

      // rozdzialka:
      const resMatch = stderr.match(/, (\d+)x(\d+)[\s,]/);
      const w = resMatch && Number(resMatch[1]);
      const h = resMatch && Number(resMatch[2]);

      resolve({
        width: w,
        height: h,
        duration: durationInSec,
        bitrate: bitrateNum * 1000,
      });
    });
  });
}

export async function uploadVideo(file: Express.Multer.File, author: firebase.auth.DecodedIdToken) {
  const videoData = await analyze(file.path);

  const key = makeS3Path(author.uid, 'source', replaceFileWithHash(file.originalname));

  await S3SimpleUpload({
    key,
    filePath: file.path,
  });

  try {
    await insertIntoDb(key, videoData, file, author);
  } catch (e) {
    logger.error('Failed to insert video into DB');
    S3Delete(file.path);
  }
}
