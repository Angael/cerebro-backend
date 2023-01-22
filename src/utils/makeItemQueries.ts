import { Item } from '@prisma/client';
import { prisma } from '../db/db.js';

export const makeItemQueries = async (items: Pick<Item, 'id'>[]) => {
  const itemsIds = items.map((item) => item.id);

  // const thumbnails: IThumbnailRow[] = await db
  //   .select('id', 'item_id', 'type', 'path')
  //   .from(DB_TABLE.thumbnail)
  //   .whereIn('item_id', itemsIds);

  const thumbnails = await prisma.thumbnail.findMany({
    // select: {
    //   id: true,
    //   itemId: true,
    //   type: true,
    //   path: true,
    // },
    where: {
      itemId: { in: itemsIds },
    },
  });

  const images = await prisma.image.findMany({
    where: {
      itemId: { in: itemsIds },
    },
  });
  const videos = await prisma.video.findMany({
    where: {
      itemId: { in: itemsIds },
    },
  });

  return { thumbnails, images, videos };
};
