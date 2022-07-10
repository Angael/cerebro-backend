import { Knex } from 'knex';
import { DB_TABLE } from '../src/utils/consts';

export async function seed(knex: Knex): Promise<void> {
  console.log('[clear all seed]');

  // Deletes ALL existing entries
  await knex(DB_TABLE.wall_item).del();
  await knex(DB_TABLE.thumbnail).del();
  await knex(DB_TABLE.image).del();
  await knex(DB_TABLE.video).del();
  await knex(DB_TABLE.video_optimized).del();
  await knex(DB_TABLE.file).del();
  await knex(DB_TABLE.item).del();
  await knex(DB_TABLE.wall).del();
  await knex(DB_TABLE.account).del();
}
