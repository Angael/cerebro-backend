import { prisma } from '../../db/db.js';
import logger from '../../utils/log.js';
import { Item, Video } from '@prisma/client';

export const findUncompressedVideoItem = async (): Promise<[Item, Video] | []> => {
  const uncompressedItems: Item[] =
    await prisma.$queryRaw`select * from Item WHERE type = 'VIDEO' AND NOT EXISTS(SELECT V.id FROM Video V WHERE mediaType = 'COMPRESSED' AND V.id = Item.id) ORDER BY rand() LIMIT 1;`;

  if (uncompressedItems.length !== 1) {
    logger.debug('everything is compressed');
    return [];
  }
  const item = uncompressedItems[0];
  logger.debug('item %o', item);

  const originalVid = await prisma.video.findFirstOrThrow({
    where: { itemId: item.id },
  });

  return [item, originalVid];
};
