import { Knex } from 'knex';
import {
  FileType,
  IFile,
  IItem,
  IS3_image,
  ItemCategory,
} from '../src/models/IItem';
import { v4 as uuidv4 } from 'uuid';

const getUid = (num) =>
  Array.from({ length: 30 }).reduce(
    (acc, v, i) => `${acc}${num}`,
    '',
  ) as string;

export async function seed(knex: Knex): Promise<void> {
  console.log('[items seed]');

  const items: IItem[] = [
    {
      account_uid: getUid(1),
      category: ItemCategory.file,
      private: false,
      processed: false,
    },
    {
      account_uid: getUid(2),
      category: ItemCategory.file,
      private: false,
      processed: false,
    },
    {
      account_uid: getUid(3),
      category: ItemCategory.text,
      private: false,
      processed: false,
    },
  ];

  // 1
  const item_id = (await knex.insert(items).into('item')) as number[];
  console.log({ item_id });
  const file_id = (await knex
    .insert({
      item_id: item_id[0],
      filename: 'obrazek.png',
      path: `u/${getUid(1)}/${uuidv4()}`,
      type: FileType.s3_image,
      size: 4 * 1024 * 1024,
    } as IFile)
    .into('file')) as number;

  await knex
    .insert({
      file_id: file_id[0],
      width: 640,
      height: 400,
    } as IS3_image)
    .into('s3_image');

  // //2
  // const item_id = await knex
  //   .insert<IItem>(items[1])
  //   .returning('id')
  //   .into('item');
  //
  // //3
  // const item_id = await knex
  //   .insert<IItem>(items[2])
  //   .returning('id')
  //   .into('item');
}
