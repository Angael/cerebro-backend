import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';
import { Item, Video } from '@prisma/client';

export const findUncompressedVideoItem = async (): Promise<[Item, Video] | []> => {
  const uncompressedItems: Item[] =
    await prisma.$queryRaw`select * FROM Item I WHERE optimized = 'NO' AND type = 'VIDEO' ORDER BY rand() LIMIT 1;`;

  if (uncompressedItems.length !== 1) {
    return [];
  }
  const item = uncompressedItems[0];
  logger.debug('compressing video itemId %i', item.id);

  const originalVid = await prisma.video.findFirstOrThrow({
    where: { itemId: item.id },
  });

  return [item, originalVid];
};
