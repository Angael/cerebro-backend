import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { DbService } from '../../providers/db.service';
import { VideoService } from './video.service';
import { ImageService } from './image.service';
import { S3Service } from '../../providers/s3.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, VideoService, ImageService, DbService, S3Service],
})
export class UploadModule {}
