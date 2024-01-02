import { Item, Tag } from '@prisma/client';
import { FrontItem, QueryItems } from '@vanih/cerebro-contracts';
import { prisma } from '../../db/db.js';
import { S3DeleteMany } from '../../aws/s3-helpers.js';
import { HttpError } from '../../utils/errors/HttpError.js';
import logger from '../../utils/log.js';
import { getFrontItem } from '../../utils/getFrontItem.js';

export async function getAllItems(
  limit: number,
  page: number,
  tagIds: number[],
  userUid?: string,
): Promise<QueryItems> {
  const tagsWhere = tagIds.length
    ? {
        tags: { some: { tagId: { in: tagIds } } },
      }
    : {};

  const where = {
    OR: [
      { private: false, ...tagsWhere },
      { userUid, ...tagsWhere },
    ],
  };

  const _items = await prisma.item.findMany({
    where,
    take: limit,
    skip: page * limit,
    include: {
      Image: true,
      Video: true,
      thumbnails: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const count = await prisma.item.count({
    where,
  });

  const items = _items
    .map((item) => {
      try {
        return getFrontItem(item, userUid);
      } catch (e) {
        return null as any;
      }
    })
    .filter(Boolean);

  return { items, count };
}

export async function getItem(id: number, userUid?: string): Promise<FrontItem> {
  const item = await prisma.item.findFirst({
    include: {
      Image: true,
      Video: true,
      thumbnails: true,
    },
    where: { id },
  });

  if (item) {
    return getFrontItem(item, userUid);
  } else {
    throw new HttpError(404);
  }
}

export async function deleteItem(itemId: Item['id'], userId: string) {
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

export async function addTagsToItems(itemIds: Item['id'][], tags: Tag[]): Promise<void> {
  const tagIds = tags.map((t) => t.id);

  // find already added tags
  const existingTags = await prisma.tagsOnItems.findMany({
    where: { itemId: { in: itemIds }, tagId: { in: tagIds } },
    select: { itemId: true, tagId: true },
  });

  await prisma.tagsOnItems.createMany({
    data: itemIds
      .map((itemId) =>
        tagIds.map((tagId) => ({
          tagId,
          itemId,
        })),
      )
      .flat()
      .filter((TOI) => !existingTags.find((t) => t.itemId === TOI.itemId && t.tagId === TOI.tagId)),
  });
}

export async function areItemsOwnedByUser(itemIds: Item['id'][], userId: string): Promise<boolean> {
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds } },
    select: { userUid: true },
  });

  return items.every((item) => item.userUid === userId);
}
