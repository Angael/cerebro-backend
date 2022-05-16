import { Inject, Injectable } from '@nestjs/common';
import firebase from 'firebase-admin';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { DbService } from '../../providers/db.service';
import { ILimits } from '../../models/for-frontend/ILimits';
import { limitsConfig } from '../../config/limits';
import { DB_TABLE } from '../../utils/consts';

@Injectable()
export class LimitsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly dbService: DbService,
  ) {}

  async getLimitsForUser(user: firebase.auth.DecodedIdToken): Promise<ILimits> {
    const db = this.dbService.getDb();

    // SELECT account.type, SUM(file.size) + SUM(thumbnail.size) AS 'used_size' FROM `account` JOIN `item` ON `uid`= `account_uid` JOIN `file` ON `item`.`id`=`file`.`item_id` JOIN `thumbnail` ON `item`.`id`=`thumbnail`.`item_id`;
    const { type, files_size, thumbs_size } = (
      await db
        .select('account.type')
        .sum({ files_size: 'file.size', thumbs_size: 'thumbnail.size' })
        .from(DB_TABLE.account)
        .join(DB_TABLE.item, 'uid', 'account_uid')
        .join(DB_TABLE.file, 'item.id', 'file.item_id')
        .join(DB_TABLE.thumbnail, 'item.id', 'thumbnail.item_id')
        .where({ uid: user.uid })
    )[0];

    return {
      type,
      bytes: {
        used: files_size + thumbs_size,
        max: limitsConfig[type],
      },
    };
  }
}
