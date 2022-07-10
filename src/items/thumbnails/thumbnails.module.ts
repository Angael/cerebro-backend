import { Module } from '@nestjs/common';
import { ThumbnailsController } from './thumbnails.controller';
import { ThumbnailsService } from './thumbnails.service';
import { SharpThumbnailService } from './sharp/sharpThumbnail.service';
import { UploadThumbnailService } from './upload/uploadThumbnail.service';
import { ItemsService } from '../items.service';
import { FfmpegCompressorService } from './ffmpeg/ffmpegCompressor.service';

@Module({
  controllers: [ThumbnailsController],
  providers: [
    ThumbnailsService,
    ItemsService,
    SharpThumbnailService,
    UploadThumbnailService,
    FfmpegCompressorService,
  ],
})
export class ThumbnailsModule {}
