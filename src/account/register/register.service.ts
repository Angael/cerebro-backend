import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { DbService } from '../../providers/db.service';
import { AccountType, IAccount } from '../../models/IAccount';

@Injectable()
export class RegisterService {
  constructor(private readonly dbService: DbService) {}

  async create(registerDto: RegisterDto) {
    const { uid, email } = registerDto;

    const db = this.dbService.getDb();

    const account: IAccount = {
      uid,
      email,
      type: AccountType.standard,
    };

    try {
      await db.insert(account).into('account');
      return;
    } catch {
      throw new Error('Failed to add this account');
    }
  }

  // findAll() {
  //   return `This action returns all register`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} register`;
  // }
  //
  // update(id: number, updateRegisterDto: UpdateRegisterDto) {
  //   return `This action updates a #${id} register`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} register`;
  // }
}
