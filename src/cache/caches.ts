import { Tag } from '@prisma/client';
import { Cache } from './typedCache.js';

export const tagCache = new Cache<Tag>({
  stdTTL: 600,
});
