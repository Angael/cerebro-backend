import { Tag } from '@prisma/client';
import { prisma } from '../../db/db.js';
import { mapSeries } from 'modern-async';
import { tagCache } from '../../cache/caches.js';

async function upsertTag(tagName: string): Promise<Tag> {
  let cachedTag = tagCache.get(tagName);
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
  return await prisma.tag.findMany({
    where: { items: { some: { itemId } } },
  });
}
