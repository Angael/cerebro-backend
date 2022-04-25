import { Module } from '@nestjs/common';
import { ThumbnailsController } from './thumbnails.controller';
import { ThumbnailsService } from './thumbnails.service';
import { SharpThumbnailService } from './sharpThumbnail.service';
import { UploadThumbnailService } from './uploadThumbnail.service';
import { ItemsService } from '../items.service';

@Module({
  controllers: [ThumbnailsController],
  providers: [ThumbnailsService, ItemsService, SharpThumbnailService, UploadThumbnailService],
})
export class ThumbnailsModule {}
