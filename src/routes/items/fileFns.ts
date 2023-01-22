import { prisma } from '../../db/db.js';
import { Item } from '@prisma/client';
import { makeItemQueries } from '../../utils/makeItemQueries.js';
import { joinItemQueries } from '../../utils/joinItemQueries.js';
import { IFrontItem } from '../../models/for-frontend/IFrontItem.js';
import firebase from 'firebase-admin';
import { S3DeleteMany } from '../../aws/s3-helpers.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import logger from '../../utils/log.js';

export async function getAllItems(): Promise<IFrontItem[]> {
  const items: Item[] = await prisma.item.findMany({});

  const { images, thumbnails, videos } = await makeItemQueries(items);

  return joinItemQueries(items, images, videos, thumbnails);
}

export async function getItem(id: number): Promise<IFrontItem> {
  const item = await prisma.item.findFirst({ where: { id } });

  const { images, thumbnails, videos } = await makeItemQueries([item]);

  const joined = joinItemQueries([item], images, videos, thumbnails);

  // TODO: Possibly overkill error handling? Prisma should protect
  if (joined.length === 1) {
    return joined[0];
  } else {
    if (joined.length === 0) {
      throw new HttpError(404);
    }
    throw new Error('Found ' + joined.length + ' items');
  }
}

export async function updateItemProcessed(
  itemId: Item['id'],
  processed: Item['processed'],
): Promise<void> {
  await prisma.item.update({
    data: {
      processed,
    },
    where: {
      id: itemId,
    },
  });

  return;
}

export async function deleteItem(itemId: Item['id'], userId: firebase.auth.DecodedIdToken['uid']) {
  // const row = (await db.select('account_uid').from(DB_TABLE.item).where({ id: itemId }))[0];
  const row = await prisma.item.findFirst({
    where: { userUid: userId },
  });

  if (row) {
    const { userUid } = row;

    if (userUid === userId) {
      // TODO: Optimization: delete where
      const { thumbnails, images, videos } = await makeItemQueries([{ id: itemId }]);

      const s3PathsToDelete: string[] = [];
      try {
        thumbnails.forEach((thumbnail) => s3PathsToDelete.push(thumbnail.path));
        await prisma.thumbnail.deleteMany({ where: { itemId } });

        images.forEach((image) => s3PathsToDelete.push(image.path));
        await prisma.image.deleteMany({ where: { itemId } });

        videos.forEach((video) => s3PathsToDelete.push(video.path));
        await prisma.video.deleteMany({ where: { itemId } });

        await prisma.item.delete({ where: { id: itemId } });

        // Better for AWS costs, but could lead to orphaned files in S3
        await S3DeleteMany(s3PathsToDelete);
      } catch (e) {
        logger.error('failed to delete everything for itemId %s, %O', itemId, e);
      }
    } else {
      throw new HttpError(403);
    }
  } else {
    throw new HttpError(404);
  }
}
