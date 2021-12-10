import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  console.log('[clear all seed]');

  // Deletes ALL existing entries
  await knex('wall_item').del();
  await knex('thumbnail').del();
  await knex('s3_image').del();
  await knex('s3_video').del();
  await knex('file').del();
  await knex('item').del();
  await knex('wall').del();
  await knex('account').del();
}
