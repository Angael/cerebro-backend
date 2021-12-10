import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await Promise.all([
        knex.schema.table('users', (table) => {
          table.datetime('dt').alter().notNullable();
          table.bigInteger('iq');
          table.dropColumn('updated_at');
        }),
        knex.schema.createTable('books', (table) => {
          table.increments('id');
          table.string('title');
          table.string('author');
          table.json('meta');
        }),
        knex.schema.createTable('files', (table) => {
          table.increments('id');
          table.integer('user_id').unsigned();
          table.foreign('user_id').references('users.id');
          table.string('path');
          table.string('size');
          table.json('created_at');
        }),
      ]);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await Promise.all([
        knex.schema.table('users', (table) => {
          table.datetime('dt').alter().nullable();
          table.dropColumn('iq');
          table.timestamp('updated_at').defaultTo(knex.fn.now());
        }),
        knex.schema.dropTable('books'),
        knex.schema.dropTable('files'),
      ]);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
