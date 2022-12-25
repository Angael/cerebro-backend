import { Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import imghash from 'imghash';
import firebase from 'firebase-admin';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DbService } from '../../providers/db.service';
import { S3Service } from '../../providers/s3.service';
import { IImage, IImageData, IItem, ItemType, SpaceOptimized } from '../../models/IItem';
import { makeS3Path, replaceFileWithHash } from '../../utils/makeS3Path';
import { ThumbnailSize } from '../../models/IThumbnail';
import { DB_TABLE } from '../../utils/consts';

@Injectable()
export class ImageService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async saveToS3(file: Express.Multer.File, key: string): Promise<any> {
    return this.s3Service.simpleUploadFile({
      key,
      filePath: file.path,
    });
  }

  async insertIntoDb(
    s3Key: string,
    itemData: IImageData,
    file: Express.Multer.File,
    author: firebase.auth.DecodedIdToken,
  ): Promise<void> {
    const db = this.dbService.getDb();

    return db.transaction(async (trx) => {
      const item: IItem = {
        account_uid: author.uid,
        type: ItemType.image,
        private: false,
        processed: SpaceOptimized.no,
      };

      const item_id = await db(DB_TABLE.item).transacting(trx).insert(item);

      const image: IImage = {
        item_id: item_id[0],
        filename: file.originalname,
        path: s3Key,
        size: file.size,
        ...itemData,
      };

      await db(DB_TABLE.image).transacting(trx).insert(image);
    });
  }

  async analyze(file: Express.Multer.File): Promise<IImageData> {
    const pipeline = sharp(file.path);

    return pipeline.metadata().then(async (metadata) => {
      const frameHeight = metadata.pageHeight ?? metadata.height ?? 0;
      const frameWidth = metadata.width ?? 0;
      const isAnimated = metadata.pages > 1 ?? false;

      let hash = '';
      if (!isAnimated) {
        hash = (await imghash
          .hash(file.path)
          .then((hash) => hash)
          .catch((err) => '')) as string;
      }

      return {
        width: frameWidth,
        height: frameHeight,
        isAnimated,
        hash,
      };
    });
  }

  async handleUpload(
    file: Express.Multer.File,
    author: firebase.auth.DecodedIdToken,
  ): Promise<void> {
    const imageData = await this.analyze(file);

    const key = makeS3Path(
      author.uid,
      ThumbnailSize.source,
      replaceFileWithHash(file.originalname),
    );

    await this.saveToS3(file, key);

    try {
      await this.insertIntoDb(key, imageData, file, author);
    } catch (e) {
      this.logger.error('Failed to insert image into DB');
      this.s3Service.deleteFile(file.path);
    }
  }
}
