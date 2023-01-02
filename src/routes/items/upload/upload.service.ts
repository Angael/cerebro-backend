import firebase from 'firebase-admin';
import { betterUnlink } from '../../../utils/betterUnlink.js';
import logger from '../../../utils/log.js';
import { uploadImage } from './image.service.js';
import { uploadVideo } from './video.service.js';
import { ItemType } from '@prisma/client';
import { HttpError } from '../../../utils/errors/HttpError.js';

function getFileType(file: Express.Multer.File): ItemType {
  const { mimetype } = file;

  if (['image/png', 'image/gif', 'image/webp', 'image/jpeg'].includes(mimetype)) {
    return ItemType.IMAGE;
  } else if (['video/mp4', 'video/webm'].includes(mimetype)) {
    return ItemType.VIDEO;
  } else {
    throw new HttpError(415);
    // return ItemType.file;
  }
}

export async function uploadFileForUser(
  file: Express.Multer.File,
  user: firebase.auth.DecodedIdToken,
): Promise<void> {
  try {
    const itemType = getFileType(file);
    if (itemType === ItemType.IMAGE) {
      await uploadImage(file, user);
    } else if (itemType === ItemType.VIDEO) {
      await uploadVideo(file, user);
    }
  } catch (e) {
    logger.error(e);
    throw new Error('Unsupported filetype');
  } finally {
    betterUnlink(file.path);
  }

  return;
}
