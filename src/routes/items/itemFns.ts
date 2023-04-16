import { Item } from '@prisma/client';
import { FrontItem } from '@vanih/cerebro-contracts';
import { prisma } from '../../db/db.js';
import firebase from 'firebase-admin';
import { S3DeleteMany } from '../../aws/s3-helpers.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import logger from '../../utils/log.js';
import { getFrontItem } from '../../utils/getFrontItem.js';
import { itemCache } from '../../cache/itemCache.js';

export async function getAllItems(limit: number, page: number): Promise<FrontItem[]> {
  const items = await prisma.item.findMany({
    take: limit,
    skip: page * limit,
    include: {
      Image: true,
      Video: true,
      thumbnails: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return items
    .map((item) => {
      try {
        return getFrontItem(item, null);
      } catch (e) {
        return null as any;
      }
    })
    .filter(Boolean);
}

export async function getAllItemsCount(): Promise<number> {
  if (itemCache.has('count')) {
    return itemCache.get('count') as number;
  } else {
    const count = await prisma.item.count();
    itemCache.set('count', count);
    return count;
  }
}

export async function getItem(id: number): Promise<FrontItem> {
  const item = await prisma.item.findFirst({
    include: {
      Image: true,
      Video: true,
      thumbnails: true,
    },
    where: { id },
  });

  if (item) {
    return getFrontItem(item, null);
  } else {
    throw new HttpError(404);
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
      const s3PathsToDelete: string[] = [];
      try {
        const thumbnails = await prisma.thumbnail.findMany({ where: { itemId } });
        thumbnails.forEach((t) => s3PathsToDelete.push(t.path));
        await prisma.thumbnail.deleteMany({ where: { itemId } });

        const images = await prisma.image.findMany({ where: { itemId } });
        images.forEach((image) => s3PathsToDelete.push(image.path));
        await prisma.image.deleteMany({ where: { itemId } });

        const videos = await prisma.video.findMany({ where: { itemId } });
        videos.forEach((video) => s3PathsToDelete.push(video.path));
        await prisma.video.deleteMany({ where: { itemId } });

        await prisma.item.delete({ where: { id: itemId } });

        // Better for AWS costs (could lead to orphaned files in S3?)
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
