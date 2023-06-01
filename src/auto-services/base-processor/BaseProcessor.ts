import { BaseProcessorOptions } from './BaseProcessor.types.js';
import { Scheduler } from 'modern-async';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';

export class BaseProcessor<T extends { id: string | number }> {
  queue: queueAsPromised<T>;
  scheduler: Scheduler;

  constructor(options: BaseProcessorOptions<T>) {
    const {
      checkInterval,
      concurrency,
      processItem,
      getItems,
      canProcessItem,
      setItemStarted,
      setItemProcessed,
      onItemError,
    } = options;

    async function asyncWorker(item: T) {
      try {
        if (await canProcessItem(item)) {
          await setItemStarted(item);
          await processItem(item);
          await setItemProcessed(item);
        } else {
          throw new Error('Item cannot be processed');
        }
      } catch (err) {
        await onItemError(item, err);
      }
    }

    this.queue = fastq.promise(asyncWorker, concurrency);

    this.scheduler = new Scheduler(
      async () => {
        if (this.queue.length() > 0) {
          return;
        }

        const items = await getItems();
        const itemsInQueue = this.queue.getQueue();

        items.forEach((item) => {
          // only add items that are not already in the queue
          if (!itemsInQueue.some((_item) => _item.id === item.id)) {
            this.queue.push(item);
          }
        });
      },
      checkInterval,
      {
        concurrency: 1,
        maxPending: 0,
      },
    );
  }

  start() {
    this.scheduler.start();
  }
}
