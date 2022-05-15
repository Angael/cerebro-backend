import { Inject, Injectable } from '@nestjs/common';

import { DbService } from '../../providers/db.service';
import firebase from 'firebase-admin';
import { getVidInfo } from './ffmpeg-helpers/getVidInfo';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { S3Service } from '../../providers/s3.service';
import fs from 'fs-extra';

@Injectable()
export class VideoService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly s3Service: S3Service,
  ) {}

  async saveToS3(file: Express.Multer.File, author: firebase.auth.DecodedIdToken) {
    try {
      const key = `u/${author.uid}/source/${file.originalname}`;
      const upload = await this.s3Service.simpleUploadFile({
        key,
        filePath: file.path,
      });
      this.logger.verbose(`Uploaded to s3`, key);
    } catch (e) {
      this.logger.error(`Failed to upload to s3`, {
        authorUid: author.uid,
        fileName: file.originalname,
      });
    }
  }

  async insertIntoDb() {}

  async analyze() {}

  async handleUpload(file: Express.Multer.File, author: firebase.auth.DecodedIdToken) {
    const { width, height, duration, bitrate } = await getVidInfo(file.path);

    const key = await this.saveToS3(file, author);

    // await this.insertIntoDb({ key, width, height, hash, isAnimated }, file, author);
  }
}
