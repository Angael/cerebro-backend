import { Item } from '@prisma/client';
import { prisma } from '../db/db.js';
import { BaseProcessor } from './base-processor/BaseProcessor.js';
import { sleep } from 'modern-async';

export const RootScheduler = new BaseProcessor<Item>({
  async getItems() {
    const items: Item[] = await prisma.item.findMany({
      where: {
        OR: [
          { processed: { notIn: ['V1', 'STARTED'] } },
          { optimized: { notIn: ['V1', 'STARTED'] } },
        ],
      },
      take: 10,
    });
    console.log(
      'got items',
      items.map((item) => item.id),
    );

    return items;
  },
  checkInterval: 4000,
  concurrency: 1,
  processItem: async (item) => {
    console.log('processing item', item.id);
    await sleep(1000);
  },
  setItemStarted: async (item) => {
    console.log('started', item.id);
  },
  setItemProcessed: async (item) => {
    console.log('ended', item.id);
  },
  canProcessItem: async (item) => {
    return item.optimized === 'NO';
  },
  onItemError: async (item, err) => {
    console.log('error', item.id, err);
  },
});
