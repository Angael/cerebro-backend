import { Module } from '@nestjs/common';
import { SpaceOptimizerController } from './spaceOptimizer.controller';
import { SpaceOptimizerService } from './spaceOptimizer.service';
import { SharpThumbnailService } from './sharp/sharpThumbnail.service';
import { UploadThumbnailService } from './upload/uploadThumbnail.service';
import { ItemsService } from '../items.service';
import { FfmpegCompressorService } from './ffmpeg/ffmpegCompressor.service';

@Module({
  controllers: [SpaceOptimizerController],
  providers: [
    SpaceOptimizerService,
    ItemsService,
    SharpThumbnailService,
    UploadThumbnailService,
    FfmpegCompressorService,
  ],
})
export class SpaceOptimizerModule {}
