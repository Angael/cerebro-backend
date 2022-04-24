import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DbService } from '../providers/db.service';
import { IFile, IItem, IImage, IVideo } from '../models/IItem';
import { s3PathToUrl } from '../utils/s3PathToUrl';
import { IFrontItem } from '../models/for-frontend/IFrontItem';
import { joinItemQueries } from './helpers/joinItemQueries';
import { makeItemQueries } from './helpers/makeItemQueries';
import { IThumbnailRow } from '../models/IThumbnail';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
  ) {}

  async getAll(): Promise<IFrontItem[]> {
    const db = this.dbService.getDb();

    const items: IItem[] = await db
      .select('id', 'category', 'created_at', 'processed')
      .from('item');

    const { images, thumbnails, videos, files } = await makeItemQueries(db, items);

    return joinItemQueries(items, files, images, videos, thumbnails, process.env);
  }

  async getItem(id: number): Promise<IFrontItem> {
    const db = this.dbService.getDb();

    const items: IItem[] = await db
      .select('id', 'category', 'created_at', 'processed')
      .from('item')
      .where({ id });

    const { images, thumbnails, videos, files } = await makeItemQueries(db, items);

    const joined = joinItemQueries(items, files, images, videos, thumbnails, process.env);

    if (joined.length === 1) {
      return joined[0];
    } else if (joined.length > 1) {
      this.logger.error('Got multiple items for id.', { id });
      throw new Error('Found multiple items');
    } else {
      throw new NotFoundException('Item not found');
    }
  }

  getUserItems() {
    const db = this.dbService.getDb();

    return db.select('uid', 'email', 'created_at', 'name').from('account');
  }

  async markItemProcessed(itemId: IItem['id']): Promise<any> {
    const db = this.dbService.getDb();

    return db.transaction(async (trx) => {
      const item_id = await db('item')
        .transacting(trx)
        .where({ id: itemId })
        .update({
          processed: true,
        } as IItem);
    });
  }
  // getDriveItems() {
  //   const db = this.dbService.getDb();
  //
  //   return db.select('uid', 'email', 'created_at', 'name').from('account');
  // }
}
