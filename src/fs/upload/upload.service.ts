import { Injectable } from '@nestjs/common';
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

    if (['image/jpeg'].includes(mimetype)) {
      return FileType.s3_image;
    } else if (['video/mp4'].includes(mimetype)) {
      return FileType.s3_video;
    } else {
      return FileType.other;
    }
  }

  // async analyzeImage(file: Express.Multer.File): Promise<{
  //   width;
  //   height;
  // }> {
  //   return {
  //     width,
  //     height,
  //   };
  // }
  //
  // async analyzeVideo(
  //   file: Express.Multer.File,
  // ): Promise<{ width; height; duration; bit_rate }> {
  //   return {
  //     width,
  //     height,
  //     duration,
  //     bit_rate,
  //   };
  // }
}
