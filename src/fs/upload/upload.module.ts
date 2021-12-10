import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { DbService } from '../../providers/db.service';

@Module({
  imports: [],
  controllers: [UploadController],
  providers: [UploadService, DbService],
})
export class UploadModule {}
