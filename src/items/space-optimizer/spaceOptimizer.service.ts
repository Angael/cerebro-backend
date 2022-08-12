import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs-extra';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Scheduler } from 'modern-async';

import { DbService } from '../../providers/db.service';
import { DB_TABLE, DOWNLOADS_DIR, THUMBNAILS_DIR } from '../../utils/consts';
import { S3Service } from '../../providers/s3.service';
import { IItem, ItemType, SpaceOptimized } from '../../models/IItem';
import { UploadThumbnailService } from './upload/uploadThumbnail.service';
import { ItemsService } from '../items.service';
import { ImageSpaceOptimizerService } from './image/imageSpaceOptimizer.service';

@Injectable()
export class SpaceOptimizerService {
  public readonly scheduler: Scheduler;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly s3Service: S3Service,
    private readonly dbService: DbService,
    private readonly itemsService: ItemsService,
    private readonly uploadThumbnails: UploadThumbnailService,
    private readonly imageSpaceOptimizer: ImageSpaceOptimizerService,
  ) {
    fs.mkdir(DOWNLOADS_DIR, { recursive: true });
    fs.mkdir(THUMBNAILS_DIR, { recursive: true });

    this.scheduler = new Scheduler(
      async () => {
        // this.logger.verbose('Scheduler running...');
        return this.optimizeItem()
          .then((didGenerateThumbnails) => {
            // some item was optimized!
          })
          .catch((error) => {
            this.logger.error('item optimize fail', error);
            // error happened, anyway...
          });
      },
      4000,
      {
        concurrency: 1,
        maxPending: 1,
        startImmediate: true,
      },
    );
    this.logger.info('Scheduler starting...');
    this.scheduler.start();
  }

  async findItemToOptimize(): Promise<IItem | undefined> {
    const db = this.dbService.getDb();
    return (
      (
        await db
          .select()
          .from(DB_TABLE.item)
          // .join(DB_TABLE.file, 'item.id', 'file.item_id')
          .where('processed', SpaceOptimized.no as IItem['processed'])
          .limit(1)
      )[0]
    );
  }

  async optimizeItem(): Promise<boolean> {
    const item = await this.findItemToOptimize();
    if (!item) {
      return false;
    }
    console.log({ item });

    try {
      await this.itemsService.updateItemProcessed(item.id, SpaceOptimized.started);
      if (item.type === ItemType.image) {
        await this.imageSpaceOptimizer.optimize(item);
      } else {
        // TODO: Not supported type, should skip it
        throw new Error('Tried to optimize unsupported filetype');
      }

      await this.itemsService.updateItemProcessed(item.id, SpaceOptimized.yes_v1);
    } catch (e) {
      await this.itemsService.updateItemProcessed(item.id, SpaceOptimized.failed);
      throw e;
    }
  }
}
