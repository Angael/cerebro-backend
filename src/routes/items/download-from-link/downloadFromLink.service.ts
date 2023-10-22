import { nanoid } from 'nanoid';
import { downloadVideo } from 'easy-yt-dlp';
import { YT_DLP_PATH } from '../../../utils/env.js';
import { DOWNLOADS_DIR, MAX_UPLOAD_SIZE } from '../../../utils/consts.js';
import { MyFile } from '../upload/upload.type.js';
import { parse } from 'path';
import fs from 'fs-extra';
import { HttpError } from '../../../utils/errors/HttpError.js';
import { doesUserHaveSpaceLeftForFile } from '../../limits/limits-service.js';
import logger from '../../../utils/log.js';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import { DecodedIdToken } from 'firebase-admin/auth';
import mime from 'mime-types';

export const downloadFromLinkService = async (
  link: string,
  user: DecodedIdToken,
): Promise<MyFile> => {
  const filenameNoExtension = nanoid();
  let { createdFilePath } = await downloadVideo({
    ytDlpPath: YT_DLP_PATH,
    link,
    filename: filenameNoExtension,
    outputDir: DOWNLOADS_DIR,
    maxFileSize: MAX_UPLOAD_SIZE,
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

    const hasEnoughSpace = await doesUserHaveSpaceLeftForFile(user!, file);

    if (!hasEnoughSpace) {
      throw new HttpError(413);
    }

    return file;
  } catch (e) {
    logger.error(e);
    throw e;
  } finally {
    if (createdFilePath) {
      await betterUnlink(createdFilePath);
    }
  }
};
