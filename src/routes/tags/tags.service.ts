import { Tag } from '@prisma/client';
import { prisma } from '../../db/db.js';
import { itemTagsCache } from '../../cache/caches.js';

export async function getAllTags(): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    take: 100,
  });

  return tags;
}

export async function getItemTags(itemId: number): Promise<Tag[]> {
  const cachedTags = itemTagsCache.get(itemId);
  if (cachedTags) {
    return cachedTags;
  }

  const tags = await prisma.tag.findMany({
    where: { items: { some: { itemId } } },
  });

  itemTagsCache.set(itemId, tags);

  return tags;
}
