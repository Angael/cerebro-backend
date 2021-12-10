import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { DbService } from '../../providers/db.service';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService, DbService],
})
export class RegisterModule {}
