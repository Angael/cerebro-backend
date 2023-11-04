import { Tag } from '@prisma/client';
import { Cache } from './typedCache.js';

export const tagCache = new Cache<Tag>({ stdTTL: 600 });

export const itemTagsCache = new Cache<Tag[]>({ stdTTL: 60 });

export const linkStatsCache = new Cache<{ views: number; downloads: number }>({
  stdTTL: 3600 / 4, // 15 minutes
});
