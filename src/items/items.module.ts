import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { UploadService } from './upload/upload.service';
import { VideoService } from './upload/video.service';
import { ImageService } from './upload/image.service';
import { S3Service } from '../providers/s3.service';
import { ThumbnailsModule } from './thumbnails/thumbnails.module';
import { DbService } from '../providers/db.service';

@Module({
  imports: [ThumbnailsModule],
  controllers: [ItemsController],
  providers: [ItemsService, DbService, UploadService, VideoService, ImageService, S3Service],
})
export class ItemsModule {}
