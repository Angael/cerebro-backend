import { Inject, Injectable, Scope } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// Singleton, not needed though because global module makes this service be a singleton
let db: Knex;

@Injectable()
export class DbService {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {
    if (!db) {
      this.logger.verbose(`knex starting`);
      db = knex({
        client: 'mysql2',
        connection: {
          host: process.env.DB_HOST,
          port: 3306,
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
        },
      });
      this.logger.verbose(`Knex loaded`);
    }
  }

  getDb(): Knex {
    return db;
  }
}
