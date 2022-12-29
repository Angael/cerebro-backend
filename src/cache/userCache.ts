import NodeCache from 'node-cache';

export const userLimitsCache = new NodeCache({
  stdTTL: 60, // 1 min
});

export const userTypeCache = new NodeCache({
  stdTTL: 600, // 10 min
});
