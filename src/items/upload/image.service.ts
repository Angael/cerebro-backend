import { Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import imghash from 'imghash';
import fs from 'fs-extra';
import firebase from 'firebase-admin';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { DbService } from '../../providers/db.service';
import { S3Service } from '../../providers/s3.service';
import { FileType, IFile, IItem, IImage, ItemCategory } from '../../models/IItem';

@Injectable()
export class ImageService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async saveToS3(file: Express.Multer.File, author: firebase.auth.DecodedIdToken): Promise<any> {
    const s3 = this.s3Service.getS3();

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `u/${author.uid}/source/${file.originalname}`,
      Body: fs.createReadStream(file.path),
      ACL: 'public-read',
    };

    return new Promise((res, rej) =>
      s3.upload(params, (s3Err, data) => {
        if (s3Err) {
          this.logger.error(`Failed to upload to s3`, file.originalname);
          rej(s3Err);
        } else {
          this.logger.verbose(`Uploaded to s3`, data.Key);
          res(data.Key);
        }
      }),
    );
  }

  async insertIntoDb(
    item: { key: string; width: number; height: number; hash: string; isAnimated: boolean },
    file: Express.Multer.File,
    author: firebase.auth.DecodedIdToken,
  ): Promise<any> {
    const db = this.dbService.getDb();

    return db.transaction(async (trx) => {
      const item_id = await db('item')
        .transacting(trx)
        .insert({
          account_uid: author.uid,
          category: ItemCategory.file,
          private: false,
          processed: false,
        } as IItem);

      const file_id = await db('file')
        .transacting(trx)
        .insert({
          item_id: item_id[0],
          filename: file.originalname,
          path: item.key,
          type: FileType.image,
          size: file.size,
        } as IFile);

      await db('s3_image')
        .transacting(trx)
        .insert({
          file_id: file_id[0],
          width: item.width,
          height: item.height,
          hash: item.hash,
          isAnimated: item.isAnimated,
        } as IImage);
    });
    // return db.select('uid', 'email', 'created_at', 'name').from('account');
  }

  async analyze(file: Express.Multer.File): Promise<{
    width: number;
    height: number;
    hash: string;
    isAnimated: boolean;
  }> {
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
    const { width, height, hash, isAnimated } = await this.analyze(file);

    const key = await this.saveToS3(file, author);

    await this.insertIntoDb({ key, width, height, hash, isAnimated }, file, author);
  }
}
