import { BaseProcessorOptions } from './BaseProcessor.types.js';
import { Scheduler } from 'modern-async';
import * as fastq from 'fastq';
import type { queueAsPromised } from 'fastq';

export class BaseProcessor<T extends { id: string | number }> {
  queue: queueAsPromised<T>;
  scheduler: Scheduler;

  processItem: BaseProcessorOptions<T>['processItem'];
  setItemStarted: BaseProcessorOptions<T>['setItemStarted'];
  setItemProcessed: BaseProcessorOptions<T>['setItemProcessed'];
  canProcessItem: BaseProcessorOptions<T>['canProcessItem'];
  onItemError: BaseProcessorOptions<T>['onItemError'];

  constructor(params: BaseProcessorOptions<T>) {
    this.processItem = params.processItem;
    this.setItemStarted = params.setItemStarted;
    this.setItemProcessed = params.setItemProcessed;
    this.canProcessItem = params.canProcessItem;
    this.onItemError = params.onItemError;

    this.queue = fastq.promise(this.asyncWorker, params.concurrency);

    this.scheduler = new Scheduler(
      async () => {
        if (this.queue.length() > 0) {
          return;
        }

        const items = await params.getItems();
        const itemsInQueue = this.queue.getQueue();

        items.forEach((item) => {
          // only add items that are not already in the queue
          if (!itemsInQueue.some((_item) => _item.id === item.id)) {
            this.queue.push(item);
          }
        });
      },
      params.checkInterval,
      {
        concurrency: 1,
        maxPending: 0,
      },
    );
  }

  asyncWorker = async (item: T) => {
    try {
      if (await this.canProcessItem(item)) {
        await this.setItemStarted(item);
        await this.processItem(item);
        await this.setItemProcessed(item);
      } else {
        throw new Error('Item cannot be processed');
      }
    } catch (err) {
      await this.onItemError(item, err);
    }
  };

  start() {
    this.scheduler.start();
  }
}
