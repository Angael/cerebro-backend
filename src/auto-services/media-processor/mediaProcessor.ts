import logger from '../../utils/log.js';
import { processSomeItem } from './processSomeItem.js';
import { BaseProcessor } from '../base-processor/BaseProcessor.js';
import { Item, Processed } from '@prisma/client';
import { prisma } from '../../db/db.js';

const mediaProcessor = new BaseProcessor<Item>({
  concurrency: 1,
  processItem: processSomeItem,
  checkInterval: 5000,

  getItems() {
    return prisma.item.findMany({
      take: 10,
      where: { processed: Processed.NO },
    });
  },

  async canProcessItem(item) {
    const itemRow = await prisma.item.findFirst({
      where: { id: item.id },
    });

    return itemRow?.processed === Processed.NO;
  },

  async setItemStarted(item) {
    await prisma.item.update({
      where: { id: item.id },
      data: { processed: Processed.STARTED },
    });
  },

  async setItemProcessed(item) {
    logger.verbose('Processed item %i', item.id);
    await prisma.item.update({
      where: { id: item.id },
      data: { processed: Processed.V1 },
    });
  },

  async onItemError(item, error) {
    logger.error('Error processing item %i, %o', item.id, error);
    await prisma.item.update({
      where: { id: item.id },
      data: { processed: Processed.FAIL },
    });
  },
});

export default mediaProcessor;
