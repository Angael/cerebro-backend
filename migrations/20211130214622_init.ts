import { Knex } from 'knex';
import { addCommon, addVideoData } from './common/common';
import { DB_TABLE } from '../src/utils/consts';

const UID_LEN = 36;
const PATH_LEN = 256;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable(DB_TABLE.account, (table) => {
      table.string('uid', UID_LEN).primary();
      table.string('email', 320).notNullable().unique();
      table.string('name', 64).nullable();
      table.string('type', 64).notNullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable(DB_TABLE.item, (table) => {
      addCommon(knex, table);
      table.string('account_uid', UID_LEN).notNullable();
      table.foreign('account_uid').references(DB_TABLE.account + '.uid');

      table.string('category', 32).notNullable();
      table.boolean('private').defaultTo(false);
      table.boolean('processed').defaultTo(false); // Should be enum, started | ended | waiting
    })
    .createTable(DB_TABLE.file, (table) => {
      table.increments('id');
      table.integer('item_id').unsigned().unique().notNullable();
      table.foreign('item_id').references(DB_TABLE.item + '.id');

      table.string('filename', 256).notNullable();
      table.string('path', PATH_LEN).unique().notNullable();
      table.string('type', 32).notNullable(); //s3_video | s3_image | url_image | text | link
      table.bigInteger('size').unsigned();
    })
    .createTable(DB_TABLE.thumbnail, (table) => {
      addCommon(knex, table);
      table.integer('item_id').unsigned().notNullable();
      table.foreign('item_id').references(DB_TABLE.item + '.id');

      table.string('type', 32).notNullable(); // xs, sm, md, animated
      table.string('path', PATH_LEN).unique().notNullable();
      table.integer('size').unsigned();
      table.integer('width').unsigned();
      table.integer('height').unsigned();
      table.boolean('isAnimated');
    })
    .createTable(DB_TABLE.video, (table) => {
      table.increments('id');
      // TODO: Maybe not unique? Dash video will have multiple entries multiple WxH etc.
      table.integer('file_id').unsigned().unique().notNullable();
      table.foreign('file_id').references(DB_TABLE.file + '.id');

      addVideoData(knex, table);
    })
    .createTable(DB_TABLE.video_optimized, (table) => {
      table.increments('id');
      table.integer('video_id').unsigned().unique().notNullable();
      table.foreign('video_id').references(DB_TABLE.video + '.id');

      table.string('path', PATH_LEN).unique().notNullable();
      table.integer('size').unsigned();
      table.string('purpose', 16).notNullable(); // VideoPurpose
      addVideoData(knex, table);
    })
    .createTable(DB_TABLE.image, (table) => {
      table.increments('id');
      table.integer('file_id').unsigned().unique().notNullable();
      table.foreign('file_id').references(DB_TABLE.file + '.id');
      table.integer('width').unsigned();
      table.integer('height').unsigned();
      table.boolean('isAnimated');
      table.string('hash', 32);
    })
    .createTable(DB_TABLE.seen_time, (table) => {
      addCommon(knex, table);

      table.string('account_uid', UID_LEN);
      table.foreign('account_uid').references(DB_TABLE.account + '.uid');

      table.integer('item_id').unsigned();
      table.foreign('item_id').references(DB_TABLE.item + '.id');

      table.integer('count').unsigned().defaultTo(0);

      table.unique(['account_uid', 'item_id']);
    })
    .createTable(DB_TABLE.wall, (table) => {
      addCommon(knex, table);
      table.string('name', 128).unique();
      table.string('author_uid', UID_LEN);
      table.foreign('author_uid').references(DB_TABLE.account + '.uid');
    })
    .createTable(DB_TABLE.wall_item, (table) => {
      addCommon(knex, table);
      table.integer('wall_id').unsigned();
      table.foreign('wall_id').references(DB_TABLE.wall + '.id');

      table.integer('item_id').unsigned();
      table.foreign('item_id').references(DB_TABLE.item + '.id');

      table.unique(['wall_id', 'item_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists(DB_TABLE.video)
    .dropTableIfExists(DB_TABLE.image)
    .dropTableIfExists(DB_TABLE.file)
    .dropTableIfExists(DB_TABLE.thumbnail)
    .dropTableIfExists(DB_TABLE.wall_item)
    .dropTableIfExists(DB_TABLE.wall)
    .dropTableIfExists(DB_TABLE.seen_time)
    .dropTableIfExists(DB_TABLE.item)
    .dropTableIfExists(DB_TABLE.account);
}
