import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import imghash from 'imghash';

import { DbService } from '../../providers/db.service';
import { FileType, IS3_image } from '../../models/IItem';
import { ImageService } from './image.service';
import firebase from 'firebase-admin';
import { VideoService } from './video.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly dbService: DbService,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
  ) {}

  async getItemsList(): Promise<any> {
    const db = this.dbService.getDb();

    return db.select('uid', 'email', 'created_at', 'name').from('account');
  }

  getFileType(file: Express.Multer.File): FileType {
    const { mimetype } = file;

    console.log('mimetype', mimetype);
    if (
      ['image/png', 'image/gif', 'image/webp', 'image/jpeg'].includes(mimetype)
    ) {
      return FileType.s3_image;
    } else if (['video/mp4'].includes(mimetype)) {
      return FileType.s3_video;
    } else {
      return FileType.other;
    }
  }

  async handleFile(
    file: Express.Multer.File,
    user: firebase.auth.DecodedIdToken,
  ): Promise<void> {
    const fileType = this.getFileType(file);
    if (fileType === FileType.s3_image) {
      await this.imageService.handleUpload(file, user);
    } else if (fileType === FileType.s3_video) {
      console.error('TODO: Videos are not yet supported!!!');
    }
    return;
  }
}
