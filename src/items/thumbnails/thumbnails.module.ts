import { Module } from '@nestjs/common';
import { ThumbnailsController } from './thumbnails.controller';
import { ThumbnailsService } from './thumbnails.service';
import { S3Service } from '../../providers/s3.service';
import { DbService } from '../../providers/db.service';
import { SharpThumbnailService } from './sharpThumbnail.service';
import { UploadThumbnailService } from './uploadThumbnail.service';
import { ItemsService } from '../items.service';

@Module({
  controllers: [ThumbnailsController],
  providers: [
    ThumbnailsService,
    S3Service,
    DbService,
    ItemsService,
    SharpThumbnailService,
    UploadThumbnailService,
  ],
})
export class ThumbnailsModule {}
