import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import imghash from 'imghash';

import { DbService } from '../../providers/db.service';
import { FileType, IS3_image } from '../../models/IItem';

@Injectable()
export class UploadService {
  constructor(private readonly dbService: DbService) {}

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

  async analyzeImg(file: Express.Multer.File): Promise<{
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
      try {
        hash = await imghash.hash(file.path);
      } catch (e) {}

      return {
        width: frameWidth,
        height: frameHeight,
        isAnimated,
        hash,
      };
    });
  }

  async handleImage(file: Express.Multer.File): Promise<void> {
    return;
  }

  async handleFile(file: Express.Multer.File): Promise<void> {
    const fileType = this.getFileType(file);
    if (fileType === FileType.s3_image) {
      await this.analyzeImg(file);
    } else if (fileType === FileType.s3_video) {
    }
    return;
  }
}
