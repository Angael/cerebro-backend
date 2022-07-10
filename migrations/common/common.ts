import { Knex } from 'knex';

export const addCommon = (knex: Knex, table: Knex.CreateTableBuilder) => {
  table.increments('id');
  table.datetime('created_at').defaultTo(knex.fn.now());
  table.datetime('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
};

export const addVideoData = (knex: Knex, table: Knex.CreateTableBuilder) => {
  table.integer('duration').unsigned();
  table.integer('bitrate').unsigned();
  table.integer('width').unsigned();
  table.integer('height').unsigned();
};
