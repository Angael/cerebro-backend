import { nanoid } from 'nanoid';
import { downloadVideo, getVideoStats } from 'easy-yt-dlp';
import { YT_DLP_PATH } from '../../../utils/env.js';
import { DOWNLOADS_DIR, MAX_UPLOAD_SIZE } from '../../../utils/consts.js';
import { MyFile } from '../upload/upload.type.js';
import { parse } from 'path';
import fs from 'fs-extra';
import { HttpError } from '../../../utils/errors/HttpError.js';
import { doesUserHaveSpaceLeftForFile } from '../../limits/limits-service.js';
import logger from '../../../utils/log.js';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import mime from 'mime-types';
import { linkStatsCache } from '../../../cache/caches.js';

export const downloadFromLinkService = async (
  link: string,
  userId: string,
  format?: string,
): Promise<MyFile> => {
  const filenameNoExtension = nanoid();
  let { createdFilePath } = await downloadVideo({
    ytDlpPath: YT_DLP_PATH,
    link,
    filename: filenameNoExtension,
    outputDir: DOWNLOADS_DIR,
    // maxFileSize: Math.round(MAX_UPLOAD_SIZE / 1000) + 'K',
    format,
  });

  try {
    const filename = parse(createdFilePath).base;
    const file: MyFile = {
      path: createdFilePath,
      size: (await fs.stat(createdFilePath)).size,
      originalname: filename,
      mimetype: mime.lookup(createdFilePath),
      filename,
    };

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new HttpError(413);
    }

    const hasEnoughSpace = await doesUserHaveSpaceLeftForFile(userId, file);

    if (!hasEnoughSpace) {
      throw new HttpError(413);
    }

    return file;
  } catch (e) {
    if (createdFilePath) {
      await betterUnlink(createdFilePath);
    }
    logger.error(e);
    throw e;
  }
};

// Move to contracts?
// @ts-ignore
type ReturnedVideoStats = {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  uploadDate: string;
};

export const getStatsFromLink = async (link: string) => {
  if (linkStatsCache.has(link)) {
    return linkStatsCache.get(link);
  } else {
    const stats = (await getVideoStats(YT_DLP_PATH, link)) as any;
    if (stats) {
      linkStatsCache.set(link, stats);
    }
    return stats;
  }
};
