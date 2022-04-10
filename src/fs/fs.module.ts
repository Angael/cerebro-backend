import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { ListModule } from './list/list.module';

@Module({
  imports: [UploadModule, ListModule],
})
export class FsModule {}
