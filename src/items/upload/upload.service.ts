import { Inject, Injectable } from '@nestjs/common';
import fs from 'fs-extra';

import { DbService } from '../../providers/db.service';
import { FileType } from '../../models/IItem';
import { ImageService } from './image.service';
import firebase from 'firebase-admin';
import { VideoService } from './video.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MAX_UPLOAD_SIZE, UPLOADS_DIR } from '../../utils/consts';
import { betterUnlink } from '../../utils/betterUnlink';

@Injectable()
export class UploadService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
  ) {
    console.log('making UPLOADS_DIR folder');
    fs.mkdir(UPLOADS_DIR, { recursive: true });
  }

  getFileType(file: Express.Multer.File): FileType {
    const { mimetype } = file;

    if (['image/png', 'image/gif', 'image/webp', 'image/jpeg'].includes(mimetype)) {
      return FileType.image;
    } else if (['video/mp4'].includes(mimetype)) {
      return FileType.video;
    } else {
      return FileType.other;
    }
  }

  async handleFile(file: Express.Multer.File, user: firebase.auth.DecodedIdToken): Promise<void> {
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error('file too big');
    }

    try {
      const fileType = this.getFileType(file);
      if (fileType === FileType.image) {
        await this.imageService.handleUpload(file, user);
      } else if (fileType === FileType.video) {
        await this.videoService.handleUpload(file, user);
      }
    } catch (e) {
      this.logger.error(e);
      throw new Error(e);
    }

    betterUnlink(file.path);

    return;
  }
}
