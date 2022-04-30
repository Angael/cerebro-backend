import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import firebase from '../../firebase/firebase-params';
import { TokenGuard } from './token.guard';
import { DbService } from '../../providers/db.service';
import { AccountType } from '../../models/IAccount';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private dbService: DbService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest()?.user as firebase.auth.DecodedIdToken;
    if (!user) {
      return false;
    }

    const result = await this.dbService.getDb().select().from('account').where({ uid: user.uid });
    const firstRow = result[0];

    console.log({ firstRow });
    const type = firstRow.type; //result.type;

    return type !== AccountType.free;
  }
}
