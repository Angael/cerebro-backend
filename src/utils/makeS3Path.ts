import { extname } from 'path';
import { nanoid } from 'nanoid';
import { ThumbnailType } from '@prisma/client';

export const replaceFileWithHash = (filename: string, hash?: string) => {
  if (hash) {
    return hash + extname(filename);
  } else {
    return nanoid() + extname(filename);
  }
};

export const makeS3Path = (
  userId: string,
  type: ThumbnailType | 'source' | 'optimized',
  filename: string,
) => `u/${userId}/${type}/${filename}`;

export const getNameFromS3Path = (s3Path: string) => {
  const index = s3Path.lastIndexOf('/');
  if (index < 0) {
    throw new Error('Bad s3 path');
  }
  return s3Path.substring(index + 1, s3Path.length);
};
