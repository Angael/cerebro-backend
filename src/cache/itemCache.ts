import NodeCache from 'node-cache';

export const itemCache = new NodeCache({
  stdTTL: 5,
});
