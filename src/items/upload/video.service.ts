import { Inject, Injectable } from '@nestjs/common';

import { DbService } from '../../providers/db.service';
import firebase from 'firebase-admin';
import { getVidInfo } from './ffmpeg-helpers/getVidInfo';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { S3Service } from '../../providers/s3.service';
import { DB_TABLE } from '../../utils/consts';
import { IItem, ItemType, IVideo, IVideoData, SpaceOptimized } from '../../models/IItem';
import { makeS3Path, replaceFileWithHash } from '../../utils/makeS3Path';
import { ThumbnailSize } from '../../models/IThumbnail';

@Injectable()
export class VideoService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async saveToS3(file: Express.Multer.File, key: string): Promise<void> {
    return this.s3Service.simpleUploadFile({
      key,
      filePath: file.path,
    });
  }

  async insertIntoDb(
    s3Key: string,
    videoData: IVideoData,
    file: Express.Multer.File,
    author: firebase.auth.DecodedIdToken,
  ): Promise<any> {
    const db = this.dbService.getDb();

    return db.transaction(async (trx) => {
      const item: IItem = {
        account_uid: author.uid,
        type: ItemType.video,
        private: false,
        processed: SpaceOptimized.no,
      };
      const item_id = await db(DB_TABLE.item).transacting(trx).insert(item);

      const video: IVideo = {
        item_id: item_id[0],
        filename: file.originalname,
        path: s3Key,
        size: file.size,
        ...videoData,
      };

      await db(DB_TABLE.video).transacting(trx).insert(video);
    });
  }

  async analyze(file: Express.Multer.File): Promise<IVideoData> {
    return getVidInfo(file.path);
  }

  async handleUpload(file: Express.Multer.File, author: firebase.auth.DecodedIdToken) {
    const videoData = await this.analyze(file);

    const key = makeS3Path(
      author.uid,
      ThumbnailSize.source,
      replaceFileWithHash(file.originalname),
    );

    await this.saveToS3(file, key);

    try {
      await this.insertIntoDb(key, videoData, file, author);
    } catch (e) {
      this.logger.error('Failed to insert video into DB');
      this.s3Service.deleteFile(file.path);
    }
  }
}
