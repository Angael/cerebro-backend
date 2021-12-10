import { Knex } from 'knex';

const UID_LEN = 36;

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('account', (table) => {
      table.string('uid', UID_LEN).primary();
      table.string('email', 320).notNullable().unique();
      table.string('name', 64).nullable();
      table.string('type', 64).notNullable();
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('item', (table) => {
      table.increments('id');
      table.string('account_uid', UID_LEN).notNullable();
      table.foreign('account_uid').references('account.uid');

      table.string('category', 32).notNullable();
      table.boolean('private').defaultTo(false);
      table.boolean('processed').defaultTo(false);
      table.datetime('created_at').defaultTo(knex.fn.now());
    })
    .createTable('file', (table) => {
      table.increments('id');
      table.integer('item_id').unsigned().unique().notNullable();
      table.foreign('item_id').references('item.id');

      table.string('filename', 256).notNullable();
      table.string('path', 1024).unique().notNullable();
      table.string('type', 32).notNullable(); //s3_video | s3_image | url_image | text | link
      table.bigInteger('size').unsigned();
    })
    .createTable('thumbnail', (table) => {
      table.increments('id');
      table.integer('item_id').unsigned().notNullable();
      table.foreign('item_id').references('item.id');

      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('type', 32).notNullable(); // xs, sm, md, animated
      table.string('path', 1024).unique().notNullable();
      table.integer('size').unsigned();
      table.integer('width').unsigned();
      table.integer('height').unsigned();
    })
    .createTable('s3_video', (table) => {
      table.increments('id');
      // TODO: Maybe not unique? Dash video will have multiple entries multiple WxH etc.
      table.integer('file_id').unsigned().unique().notNullable();
      table.foreign('file_id').references('file.id');

      table.integer('duration').unsigned();
      table.integer('bitrate').unsigned();
      table.integer('width').unsigned();
      table.integer('height').unsigned();
    })
    .createTable('s3_image', (table) => {
      table.increments('id');
      table.integer('file_id').unsigned().unique().notNullable();
      table.foreign('file_id').references('file.id');
      table.integer('width').unsigned();
      table.integer('height').unsigned();
    })
    .createTable('seen_time', (table) => {
      table.string('account_uid', UID_LEN);
      table.foreign('account_uid').references('account.uid');

      table.integer('item_id').unsigned();
      table.foreign('item_id').references('item.id');

      table.integer('count').unsigned().defaultTo(0);
      table
        .datetime('updated_at')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.primary(['account_uid', 'item_id']);
    })
    .createTable('wall', (table) => {
      table.increments('id');
      table.string('name', 128).unique();
      table.string('author_uid', UID_LEN);
      table.foreign('author_uid').references('account.uid');

      table.datetime('created_at').defaultTo(knex.fn.now());
      table
        .datetime('updated_at')
        .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('wall_item', (table) => {
      table.integer('wall_id').unsigned();
      table.foreign('wall_id').references('wall.id');

      table.integer('item_id').unsigned();
      table.foreign('item_id').references('item.id');

      table.primary(['wall_id', 'item_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('account')
    .dropTable('item')
    .dropTable('file')
    .dropTable('thumbnail')
    .dropTable('s3_video')
    .dropTable('s3_image')
    .dropTable('seen_time')
    .dropTable('wall')
    .dropTable('wall_item'); //TODO make dropps for tables
}
