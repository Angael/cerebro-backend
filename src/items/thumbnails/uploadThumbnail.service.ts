import { Inject, Injectable } from '@nestjs/common';

import { DbService } from '../../providers/db.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { mapSeries } from 'modern-async';
import { S3Service } from '../../providers/s3.service';
import { IThumbnailBeforeUpload, IThumbnailPayload } from '../../models/IThumbnail';
import { DB_TABLE } from '../../utils/consts';

@Injectable()
export class UploadThumbnailService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async s3Upload(thumbnailPayload: IThumbnailBeforeUpload) {
    return this.s3Service.simpleUploadFile({
      key: thumbnailPayload.thumbnail.path,
      filePath: thumbnailPayload.diskPath,
    });
  }

  async dbInsert(thumbnail: IThumbnailPayload) {
    const db = this.dbService.getDb();

    return db.transaction(async (trx) => {
      const thumbnail_id = await db(DB_TABLE.thumbnail).transacting(trx).insert(thumbnail);
    });
  }

  async uploadThumbnails(thumbnails: IThumbnailBeforeUpload[]) {
    const result = await mapSeries(thumbnails, async (t) => {
      await this.s3Upload(t);
      try {
        await this.dbInsert(t.thumbnail);
      } catch (e) {
        // TODO: remove from s3
      }
      return t.diskPath;
    });

    return result;
  }
}
