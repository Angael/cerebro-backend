import { Global, Module } from '@nestjs/common';
import { DbService } from '../providers/db.service';

// TODO Remove if wont be used
@Global()
@Module({
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
