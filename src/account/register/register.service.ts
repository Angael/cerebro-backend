import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { DbService } from '../../providers/db.service';
import { AccountType, IAccount } from '../../models/IAccount';
import { DB_TABLE } from '../../utils/consts';

@Injectable()
export class RegisterService {
  constructor(private readonly dbService: DbService) {}

  async create(registerDto: RegisterDto) {
    const { uid, email } = registerDto;

    const db = this.dbService.getDb();

    const account: IAccount = {
      uid,
      email,
      type: AccountType.free,
    };

    try {
      await db.insert(account).into(DB_TABLE.account);
      return;
    } catch {
      throw new Error('Failed to add this account');
    }
  }
}
