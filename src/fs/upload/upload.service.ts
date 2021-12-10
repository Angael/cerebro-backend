import { Injectable } from '@nestjs/common';
import { DbService } from '../../providers/db.service';

@Injectable()
export class UploadService {
  constructor(private readonly dbService: DbService) {}

  async getItemsList(): Promise<any> {
    const db = this.dbService.getDb();

    return db.select('uid', 'email', 'created_at', 'name').from('account');
  }
}
