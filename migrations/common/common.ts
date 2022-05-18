import { Knex } from 'knex';

export const UID_LEN = 36;
export const PATH_LEN = 256;

export const columns_common = (knex: Knex, table: Knex.CreateTableBuilder) => {
  table.increments('id');
  table.datetime('created_at').defaultTo(knex.fn.now());
  table.datetime('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
};

export const columns_item = (knex: Knex, table: Knex.CreateTableBuilder) => {
  columns_common(knex, table);
  table.string('account_uid', UID_LEN).notNullable();
  table.foreign('account_uid').references('account.uid');
  table.boolean('private').defaultTo(false);
};

export const columns_fileBasics = (knex: Knex, table: Knex.CreateTableBuilder) => {
  table.string('s3path', PATH_LEN).unique().notNullable(); // path -> s3path
  table.bigInteger('filesize').unsigned(); // size -> filesize
};

export const columns_originalFilename = (knex: Knex, table: Knex.CreateTableBuilder) => {
  table.string('originalFilename', 256).notNullable(); // filename -> originalFilename
};

export const columns_widthHeight = (knex: Knex, table: Knex.CreateTableBuilder) => {
  table.integer('width').unsigned();
  table.integer('height').unsigned();
};
