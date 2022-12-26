import { exec } from 'child_process';
import firebase from 'firebase-admin';
import logger from '../../../utils/log.js';
import { S3Delete, S3SimpleUpload } from '../../../aws/s3-helpers.js';
import { IItem, ItemType, IVideo, IVideoData, SpaceOptimized } from '../../../models/IItem.js';
import { DB_TABLE, FFPROBE_PATH } from '../../../utils/consts.js';
import { makeS3Path, replaceFileWithHash } from '../../../utils/makeS3Path.js';
import { ThumbnailSize } from '../../../models/IThumbnail.js';
import { db } from '../../../db/db.js';

async function saveToS3(file: Express.Multer.File, key: string): Promise<void> {
  return S3SimpleUpload({
    key,
    filePath: file.path,
  });
}

async function insertIntoDb(
  s3Key: string,
  videoData: IVideoData,
  file: Express.Multer.File,
  author: firebase.auth.DecodedIdToken,
): Promise<any> {
  return db.transaction(async (trx) => {
    const item: IItem = {
      account_uid: author.uid,
      type: ItemType.video,
      private: false,
      processed: SpaceOptimized.no,
    };
    const item_id = await db(DB_TABLE.item).transacting(trx).insert(item);

    const video: IVideo = {
      item_id: item_id[0],
      filename: file.originalname,
      path: s3Key,
      size: file.size,
      ...videoData,
    };

    await db(DB_TABLE.video).transacting(trx).insert(video);
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

  const key = makeS3Path(author.uid, ThumbnailSize.source, replaceFileWithHash(file.originalname));

  await saveToS3(file, key);

  try {
    await insertIntoDb(key, videoData, file, author);
  } catch (e) {
    logger.error('Failed to insert video into DB');
    S3Delete(file.path);
  }
}
