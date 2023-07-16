import NodeCache from 'node-cache';

export const userTypeCache = new NodeCache({
  stdTTL: 30,
});

export const usedSpaceCache = new NodeCache({
  stdTTL: 30,
});
