import { Knex } from 'knex';
import { IFile, IImage, IVideo } from '../src/models/IItem';
import { DB_TABLE } from '../src/utils/consts';

const getUid = (num) =>
  Array.from({ length: 30 }).reduce((acc, v, i) => `${acc}${num}`, '') as string;

export async function seed(knex: Knex): Promise<void> {
  console.log('[items seed]');

  const image: IImage = {
    account_uid: getUid(1),
    private: false,
    processed: true,
    width: 240,
    height: 240,
    isAnimated: false,
    hash: '',
    filesize: 4 * 1024 * 1024,
    originalFilename: 'a.jpg',
    s3path: 'u/asd/source/1',
  };

  const video: IVideo = {
    account_uid: getUid(1),
    private: false,
    processed: true,
    width: 240,
    height: 240,
    duration: 121,
    bitrate: 1000000,
    filesize: 4 * 1024 * 1024,
    originalFilename: 'a.jpg',
    s3path: 'u/asd/source/2',
  };

  const file: IFile = {
    account_uid: getUid(1),
    private: false,
    filesize: 4 * 1024 * 1024,
    originalFilename: 'a.jpg',
    s3path: 'u/asd/source/3',
  };

  await knex.insert(image).into(DB_TABLE.image);
  await knex.insert(video).into(DB_TABLE.video);
  await knex.insert(file).into(DB_TABLE.file);
}
