import { Module } from '@nestjs/common';
import { ThumbnailsController } from './thumbnails.controller';
import { ThumbnailsService } from './thumbnails.service';
import { S3Service } from '../../providers/s3.service';
import { DbService } from '../../providers/db.service';

@Module({
  controllers: [ThumbnailsController],
  providers: [ThumbnailsService, S3Service, DbService],
})
export class ThumbnailsModule {}
