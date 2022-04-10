import { Module } from '@nestjs/common';
import { ListService } from './list.service';
import { ListController } from './list.controller';
import { DbService } from '../../providers/db.service';

@Module({
  controllers: [ListController],
  providers: [ListService, DbService],
})
export class ListModule {}
