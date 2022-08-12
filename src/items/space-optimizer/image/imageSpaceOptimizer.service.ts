import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import { IFile, IImage, IItem, SpaceOptimized } from '../../../models/IItem';
import { DB_TABLE, DOWNLOADS_DIR } from '../../../utils/consts';
import { IThumbnailBeforeUpload } from '../../../models/IThumbnail';
import { getNameFromS3Path, makeS3Path } from '../../../utils/makeS3Path';
import { changeExtension } from '../../../utils/changeExtension';
import { forEachSeries } from 'modern-async';
import { betterUnlink } from '../../../utils/betterUnlink';
import { SharpThumbnailService } from '../sharp/sharpThumbnail.service';
import { ItemsService } from '../../items.service';
import { UploadThumbnailService } from '../upload/uploadThumbnail.service';
import { DbService } from '../../../providers/db.service';
import { download } from '../downloadFile';
import { s3PathToUrl } from '../../../utils/s3PathToUrl';

@Injectable()
export class ImageSpaceOptimizerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly sharpThumbnailService: SharpThumbnailService,
    private readonly itemsService: ItemsService,
    private readonly uploadThumbnails: UploadThumbnailService,
    private readonly db: DbService,
  ) {}

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

  async fetchDetails(item: IItem): Promise<IImage> {
    const db = this.db.getDb();
    return (await db.select().from(DB_TABLE.image).where({ item_id: item.id }).limit(1))[0];
  }

  async optimize(item: IItem) {
    await this.itemsService.updateItemProcessed(item.id, SpaceOptimized.started);

    const imageRow = await this.fetchDetails(item);
    const savedPath = await this.downloadFile(imageRow);

    try {
      const generatedThumbs = await this.sharpThumbnailService.run(savedPath);

      let thumbnails: IThumbnailBeforeUpload[] = generatedThumbs.map((t) => ({
        thumbnail: {
          ...t.dimensions,
          item_id: item.id,
          isAnimated: t.isAnimated, // TODO: Lie? It can I think result in animated thumbnail
          path: makeS3Path(
            item.account_uid,
            t.dimensions.type,
            changeExtension(getNameFromS3Path(imageRow.path), 'webp'),
          ),
          filename: imageRow.filename,
          size: t.size,
        },
        diskPath: t.diskPath,
      }));

      try {
        const result = await this.uploadThumbnails.uploadThumbnails(thumbnails);
      } catch (e) {
        forEachSeries(thumbnails, (t) => betterUnlink(t.diskPath));
      }
    } catch (e) {}
    betterUnlink(savedPath);
  }
}
