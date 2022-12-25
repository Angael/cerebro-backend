import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import fs from 'fs-extra';

import { DbService } from '../../providers/db.service';
import { ItemType } from '../../models/IItem';
import { ImageService } from './image.service';
import firebase from 'firebase-admin';
import { VideoService } from './video.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UPLOADS_DIR } from '../../utils/consts';
import { betterUnlink } from '../../utils/betterUnlink';

@Injectable()
export class UploadService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
  ) {
    fs.mkdir(UPLOADS_DIR, { recursive: true });
  }

  getFileType(file: Express.Multer.File): ItemType {
    const { mimetype } = file;

    if (['image/png', 'image/gif', 'image/webp', 'image/jpeg'].includes(mimetype)) {
      return ItemType.image;
    } else if (['video/mp4'].includes(mimetype)) {
      return ItemType.video;
    } else {
      return ItemType.file;
    }
  }

  async handleFile(file: Express.Multer.File, user: firebase.auth.DecodedIdToken): Promise<void> {
    try {
      const itemType = this.getFileType(file);
      if (itemType === ItemType.image) {
        await this.imageService.handleUpload(file, user);
      } else if (itemType === ItemType.video) {
        await this.videoService.handleUpload(file, user);
      }
    } catch (e) {
      this.logger.error(e);
      betterUnlink(file.path);
      throw new BadRequestException('Unsupported filetype');
    }

    betterUnlink(file.path);
    return;
  }
}
