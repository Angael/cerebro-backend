import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { UploadService } from './upload/upload.service';
import { VideoService } from './upload/video.service';
import { ImageService } from './upload/image.service';
import { SpaceOptimizerModule } from './space-optimizer/spaceOptimizer.module';

@Module({
  imports: [SpaceOptimizerModule],
  controllers: [ItemsController],
  providers: [ItemsService, UploadService, VideoService, ImageService],
})
export class ItemsModule {}
