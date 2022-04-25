import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs-extra';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { Scheduler, forEachSeries } from 'modern-async';

import { DbService } from '../../providers/db.service';
import { DOWNLOADS_DIR, THUMBNAILS_DIR } from '../../utils/consts';
import { S3Service } from '../../providers/s3.service';
import { download } from './downloadFile';
import { FileType, IFile, IItem } from '../../models/IItem';
import { s3PathToUrl } from '../../utils/s3PathToUrl';
import { SharpThumbnailService } from './sharpThumbnail.service';
import { getNameFromS3Path, makeS3Path } from '../../utils/makeS3Path';
import { UploadThumbnailService } from './uploadThumbnail.service';
import { ItemsService } from '../items.service';
import { IThumbnailBeforeUpload } from '../../models/IThumbnail';
import { changeExtension } from '../../utils/changeExtension';
import { betterUnlink } from '../../utils/betterUnlink';

@Injectable()
export class ThumbnailsService {
  public readonly scheduler: Scheduler;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly s3Service: S3Service,
    private readonly dbService: DbService,
    private readonly itemsService: ItemsService,
    private readonly sharpThumbnailService: SharpThumbnailService,
    private readonly uploadThumbnails: UploadThumbnailService,
  ) {
    console.log('making DOWNLOADS_DIR folder');
    fs.mkdir(DOWNLOADS_DIR, { recursive: true });
    fs.mkdir(THUMBNAILS_DIR, { recursive: true });

    this.scheduler = new Scheduler(
      async () => {
        // this.logger.verbose('Scheduler running...');
        return this.generateThumbnails().then((didGenerateThumbnails) => {});
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
      const downloadedPath = DOWNLOADS_DIR + '/' + uuidv4() + extension;
      await download(s3PathToUrl(process.env, file.path), downloadedPath);
      return downloadedPath;
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }
  }

  async generateThumbnails(): Promise<boolean> {
    const fileItem = await this.getItemForThumbnails();
    if (!fileItem) {
      return false;
    }

    const savedPath = await this.downloadFile(fileItem);

    // TODO: Try catch
    let thumbnails: IThumbnailBeforeUpload[];
    if (fileItem.type === FileType.image) {
      const generatedThumbs = await this.sharpThumbnailService.run(fileItem, savedPath);

      thumbnails = generatedThumbs.map((t) => ({
        thumbnail: {
          ...t.dimensions,
          item_id: fileItem.item_id,
          isAnimated: t.isAnimated, // TODO: Lie? It can I think result in animated thumbnail
          path: makeS3Path(
            fileItem.account_uid,
            t.dimensions.type,
            changeExtension(getNameFromS3Path(fileItem.path), 'webp'),
          ),
          size: t.size,
        },
        diskPath: t.diskPath,
      }));
    }
    const result = await this.uploadThumbnails.uploadThumbnails(thumbnails);

    await this.itemsService.markItemProcessed(fileItem.item_id);

    forEachSeries(thumbnails, (t) => betterUnlink(t.diskPath));

    return true;
  }
}
