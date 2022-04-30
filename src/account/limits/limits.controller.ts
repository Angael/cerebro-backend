import { Controller, Get, UseGuards } from '@nestjs/common';
import { TokenGuard } from '../../auth/guards/token.guard';
import { User } from '../../auth/decorators/user.decorator';
import firebase from 'firebase-admin';
import { LimitsService } from './limits.service';

@Controller('account/limits')
export class LimitsController {
  constructor(private limitsService: LimitsService) {}

  @UseGuards(TokenGuard)
  @Get()
  async limits(@User() user: firebase.auth.DecodedIdToken) {
    return this.limitsService.getLimitsForUser(user);
  }
}
