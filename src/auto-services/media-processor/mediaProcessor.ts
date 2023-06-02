import logger from '../../utils/log.js';
import { BaseProcessor } from '../base-processor/BaseProcessor.js';
import { Item, ItemType, Processed } from '@prisma/client';
import { prisma } from '../../db/db.js';
import { processImage } from './image/processImage.js';
import { processVideo } from './video/processVideo.js';

const mediaProcessor = new BaseProcessor<Item>({
  concurrency: 1,
  processItem: async (item: Item) => {
    if (item.type === ItemType.IMAGE) {
      await processImage(item);
    } else if (item.type === ItemType.VIDEO) {
      await processVideo(item);
    } else {
      throw new Error('Tried to optimize unsupported unknown filetype');
    }
  },
  checkInterval: 5000,

  getItems: () => {
    return prisma.item.findMany({
      take: 10,
      where: { processed: Processed.NO },
    });
  },

  canProcessItem: async (item) => {
    const itemRow = await prisma.item.findFirst({
      where: { id: item.id },
    });

    return itemRow?.processed === Processed.NO;
  },

  setItemStarted: async (item) => {
    await prisma.item.update({
      where: { id: item.id },
      data: { processed: Processed.STARTED },
    });
  },

  setItemProcessed: async (item) => {
    logger.verbose('Processed item %i', item.id);
    await prisma.item.update({
      where: { id: item.id },
      data: { processed: Processed.V1 },
    });
  },

  onItemError: async (item, error) => {
    logger.error('Error processing item %i, %o', item.id, error);
    await prisma.item.update({
      where: { id: item.id },
      data: { processed: Processed.FAIL },
    });
  },
});

export default mediaProcessor;
