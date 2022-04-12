import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DbService } from '../providers/db.service';
import { IFile, IItem, IImage, IVideo, IThumbnail } from '../models/IItem';
import { s3PathToUrl } from '../utils/s3PathToUrl';
import { IFrontItem } from '../models/for-frontend/IFrontItem';
import { joinItemQueries } from './helpers';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
  ) {}

  async getAll(): Promise<IFrontItem[]> {
    const db = this.dbService.getDb();

    const items: IItem[] = await db.select('id', 'category', 'created_at').from('item');
    const itemsIds = items.map((item) => item.id);

    const thumbnails: IThumbnail[] = await db
      .select('id', 'item_id', 'type', 'path', 'isAnimated')
      .from('thumbnail')
      .whereIn('item_id', itemsIds);

    const files: IFile[] = await db
      .select('id', 'item_id', 'filename', 'path', 'size')
      .from('file')
      .whereIn('item_id', itemsIds);

    const fileIds = files.map((f) => f.id);
    const images: IImage[] = await db
      .select('id', 'file_id', 'isAnimated', 'width', 'height', 'hash')
      .from('s3_image')
      .whereIn('file_id', fileIds);

    const videos: IVideo[] = await db
      .select('id', 'file_id', 'duration', 'bitrate', 'width', 'height')
      .from('s3_video')
      .whereIn('file_id', fileIds);

    return joinItemQueries(items, files, images, videos, thumbnails, process.env);
  }

  getUserItems() {
    const db = this.dbService.getDb();

    return db.select('uid', 'email', 'created_at', 'name').from('account');
  }

  // getDriveItems() {
  //   const db = this.dbService.getDb();
  //
  //   return db.select('uid', 'email', 'created_at', 'name').from('account');
  // }
}
