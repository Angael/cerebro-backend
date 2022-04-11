import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DbService } from '../providers/db.service';
import { IFile, IItem, IImage, IVideo } from '../models/IItem';
import { s3PathToUrl } from '../utils/s3PathToUrl';
import { IFrontItem } from '../models/for-frontend/IFrontItem';

@Injectable()
export class ItemsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
  ) {}

  async getAll(): IFrontItem[] {
    const db = this.dbService.getDb();

    const items: Partial<IItem>[] = await db.select('id', 'category', 'created_at').from('item');
    const itemsIds = items.map((item) => item.id);
    const files: Partial<IFile>[] = await db
      .select('id', 'item_id', 'filename', 'path', 'size')
      .from('file')
      .whereIn('item_id', itemsIds);

    const fileIds = files.map((f) => f.id);
    const images: Partial<IImage>[] = await db
      .select('id', 'file_id', 'isAnimated', 'width', 'height', 'hash')
      .from('s3_image')
      .whereIn('file_id', fileIds);

    const videos: Partial<IVideo>[] = await db
      .select('id', 'file_id', 'duration', 'bitrate', 'width', 'height')
      .from('s3_video')
      .whereIn('file_id', fileIds);

    console.log({ items, itemsIds, files });
    const enrichedFiles = files.map((f) => {
      const imgInfo = images.find((image) => image.file_id === f.id) ?? {};
      const vidInfo = videos.find((vid) => vid.file_id === f.id) ?? {};

      return { ...f, ...vidInfo, ...imgInfo, url: s3PathToUrl(process.env, f.path) };
    });

    return enrichedFiles;
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
