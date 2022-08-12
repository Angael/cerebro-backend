import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DbService } from '../providers/db.service';
import { IItem, SpaceOptimized } from '../models/IItem';
import { IFrontItem } from '../models/for-frontend/IFrontItem';
import { joinItemQueries } from './helpers/joinItemQueries';
import { makeItemQueries } from './helpers/makeItemQueries';
import { S3Service } from '../providers/s3.service';
import firebase from 'firebase-admin';
import { forEach, forEachLimit, map } from 'modern-async';
import { DB_TABLE } from '../utils/consts';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async getAll(): Promise<IFrontItem[]> {
    const db = this.dbService.getDb();

    const items: IItem[] = await db.select().from(DB_TABLE.item);

    const { images, thumbnails, videos } = await makeItemQueries(db, items);

    return joinItemQueries(items, images, videos, thumbnails, process.env);
  }

  async getItem(id: number): Promise<IFrontItem> {
    const db = this.dbService.getDb();

    const items: IItem[] = await db.select().from(DB_TABLE.item).where({ id });

    const { images, thumbnails, videos } = await makeItemQueries(db, items);

    const joined = joinItemQueries(items, images, videos, thumbnails, process.env);

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

    return db.select().from(DB_TABLE.account);
  }

  async updateItemProcessed(itemId: IItem['id'], processed: SpaceOptimized): Promise<any> {
    const db = this.dbService.getDb();

    return db.transaction(async (trx) => {
      const item_id = await db(DB_TABLE.item)
        .transacting(trx)
        .where({ id: itemId })
        .update({ processed } as IItem);
    });
  }

  async deleteItem(itemId: IItem['id'], userId: firebase.auth.DecodedIdToken['uid']) {
    const db = this.dbService.getDb();
    const row = (await db.select('account_uid').from(DB_TABLE.item).where({ id: itemId }))[0];

    if (row) {
      const { account_uid } = row;

      if (account_uid === userId) {
        // We can delete the file
        const { thumbnails, images, videos } = await makeItemQueries(db, [{ id: itemId }]);

        const s3PathsToDelete: string[] = [];
        await forEach(thumbnails, async (thumbnail) => {
          s3PathsToDelete.push(thumbnail.path);
          await db(DB_TABLE.thumbnail).where({ id: thumbnail.id }).del();
        });
        await forEach(images, async (image) => {
          s3PathsToDelete.push(image.path);
          await db(DB_TABLE.image).where({ id: image.id }).del();
        });
        await forEach(videos, async (video) => {
          s3PathsToDelete.push(video.path);
          await db(DB_TABLE.video).where({ id: video.id }).del();
        });

        await db(DB_TABLE.item).where({ id: itemId }).del();

        // Better for AWS costs, but could lead to orphaned files in S3
        await this.s3Service.deleteFiles(s3PathsToDelete);
      } else {
        throw new UnauthorizedException();
      }
    } else {
      throw new NotFoundException();
    }
  }
  // getDriveItems() {
  //   const db = this.dbService.getDb();
  //
  //   return db.select('uid', 'email', 'created_at', 'name').from(DB_TABLE.account);
  // }
}
