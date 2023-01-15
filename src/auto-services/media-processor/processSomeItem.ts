import { prisma } from '../../db/db.js';
import { updateItemProcessed } from '../../routes/items/fileFns.js';
import { processImage } from './image/processImage.js';
import { processVideo } from './video/processVideo.js';
import { Item, ItemType, Processed } from '@prisma/client';

async function findNotProcessedItem() {
  const item: Item | null = await prisma.item.findFirst({
    where: { processed: Processed.NO },
  });

  return item;
}

export async function processSomeItem(): Promise<Item['id'] | null> {
  const item = await findNotProcessedItem();
  if (!item) {
    return null;
  }

  try {
    await updateItemProcessed(item.id, Processed.STARTED);
    if (item.type === ItemType.IMAGE) {
      await processImage(item);
    } else if (item.type === ItemType.VIDEO) {
      await processVideo(item);
    } else {
      throw new Error('Tried to optimize unsupported unknown filetype');
    }

    await updateItemProcessed(item.id, Processed.V1);
    return item.id;
  } catch (e) {
    await updateItemProcessed(item.id, Processed.FAIL);
    throw e;
  }
}
