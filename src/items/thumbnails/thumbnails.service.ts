import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs-extra';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import { DbService } from '../../providers/db.service';
import { DOWNLOADS_DIR } from '../../utils/consts';
import { S3Service } from '../../providers/s3.service';
import { download } from './downloadFile';
import { IFile, IItem } from '../../models/IItem';
import { s3PathToUrl } from '../../utils/s3PathToUrl';

@Injectable()
export class ThumbnailsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly s3Service: S3Service,
    private readonly dbService: DbService,
  ) {
    console.log('making DOWNLOADS_DIR folder');
    fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  }

  async getItemForThumbnails(): Promise<(IItem & IFile) | undefined> {
    const db = this.dbService.getDb();
    try {
      const unprocessedFileItem = (
        await db
          .select()
          .from('item')
          .join('file', 'item.id', 'file.item_id')
          .where('processed', 0)
          .limit(1)
      )[0];
      console.log({ unprocessedFileItem });
      return unprocessedFileItem;
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }
  }

  async downloadFile(file: IFile): Promise<string> {
    const extension = path.extname(file.filename);
    if (!extension) {
      throw new Error('file has no extension');
    }

    try {
      // download file
      const downloadedPath = DOWNLOADS_DIR + '/' + uuidv4() + extension;
      await download(s3PathToUrl(process.env, file.path), downloadedPath);
      console.log({ downloadedPath });
      return downloadedPath;
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }
  }

  async generateThumbnail() {
    const fileItem = await this.getItemForThumbnails();
    if (!fileItem) {
      return;
    }

    const savedPath = await this.downloadFile(fileItem);
    return savedPath;
  }
}
