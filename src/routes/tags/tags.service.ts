import { Tag } from '@prisma/client';
import { prisma } from '../../db/db.js';
import { mapSeries } from 'modern-async';
import { itemTagsCache, tagCache } from '../../cache/caches.js';

async function upsertTag(tagName: string): Promise<Tag> {
  const cachedTag = tagCache.get(tagName);
  if (cachedTag) {
    return cachedTag;
  }

  const tag = await prisma.tag.upsert({
    where: { name: tagName },
    update: {},
    create: { name: tagName },
  });

  tagCache.set(tagName, tag);

  return tag;
}

export async function upsertTags(tagNames: string[]): Promise<Tag[]> {
  const tags: Tag[] = await mapSeries(tagNames, upsertTag);

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
