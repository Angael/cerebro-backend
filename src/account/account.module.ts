import { Module } from '@nestjs/common';
import { RegisterModule } from './register/register.module';
import { LimitsModule } from './limits/limits.module';

@Module({
  imports: [RegisterModule, LimitsModule]
})
export class AccountModule {}
