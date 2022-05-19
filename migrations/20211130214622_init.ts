import { Knex } from 'knex';
import {
  columns_common,
  columns_fileBasics,
  columns_item,
  columns_originalFilename,
  columns_widthHeight,
  UID_LEN,
} from './common/common';
import { DB_TABLE } from '../src/utils/consts';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable(DB_TABLE.account, (table) => {
      table.string('uid', UID_LEN).primary();
      table.string('email', 320).notNullable().unique();
      table.string('name', 64).nullable();
      table.string('type', 64).notNullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable(DB_TABLE.file, (table) => {
      columns_item(knex, table);
      columns_fileBasics(knex, table);
      columns_originalFilename(knex, table);
    })
    .createTable(DB_TABLE.thumbnail, (table) => {
      // TODO IMPORTANT tutaj resource_id to taki hack pomysl ze nie referencuje zadnej tabelki
      //  a tak naprawde tylko node to laczy z itemami.
      table.integer('resource_id').unsigned().notNullable();
      table.foreign('resource_id').references('item.id');

      columns_common(knex, table);
      columns_fileBasics(knex, table);
      columns_widthHeight(knex, table);

      table.string('type', 32).notNullable(); // xs, sm, md, animated
    })
    .createTable(DB_TABLE.video, (table) => {
      columns_item(knex, table);
      columns_fileBasics(knex, table);
      columns_originalFilename(knex, table);
      columns_widthHeight(knex, table);

      table.integer('duration').unsigned();
      table.integer('bitrate').unsigned();
      table.boolean('processed').defaultTo(false);
    })
    .createTable(DB_TABLE.image, (table) => {
      columns_item(knex, table);
      columns_fileBasics(knex, table);
      columns_originalFilename(knex, table);
      columns_widthHeight(knex, table);

      table.boolean('isAnimated');
      table.string('hash', 32);
      table.boolean('processed').defaultTo(false);
    })
    .createTable(DB_TABLE.seen_time, (table) => {
      columns_common(knex, table);

      table.string('account_uid', UID_LEN);
      table.foreign('account_uid').references('account.uid');

      table.integer('item_id').unsigned();
      table.foreign('item_id').references('item.id');

      table.integer('count').unsigned().defaultTo(0);

      table.unique(['account_uid', 'item_id']);
    })
    .createTable(DB_TABLE.wall, (table) => {
      columns_common(knex, table);
      table.string('name', 128).unique();
      table.string('author_uid', UID_LEN);
      table.foreign('author_uid').references('account.uid');
    })
    .createTable(DB_TABLE.wall_image, (table) => {
      columns_common(knex, table);
      table.integer('wall_id').unsigned();
      table.foreign('wall_id').references(DB_TABLE.wall + '.id');

      table.integer('image_id').unsigned();
      table.foreign('image_id').references(DB_TABLE.image + '.id');

      table.unique(['wall_id', 'image_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists(DB_TABLE.video)
    .dropTableIfExists(DB_TABLE.image)
    .dropTableIfExists(DB_TABLE.file)
    .dropTableIfExists(DB_TABLE.thumbnail)
    .dropTableIfExists(DB_TABLE.wall_image)
    .dropTableIfExists(DB_TABLE.wall)
    .dropTableIfExists(DB_TABLE.seen_time)
    .dropTableIfExists(DB_TABLE.account);
}
