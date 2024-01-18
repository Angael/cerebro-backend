import { Tag } from '@prisma/client';

export type MyFile =
  | Express.Multer.File
  | {
      path: string;
      originalname: string;
      filename: string;
      size: number;
      mimetype: string;
    };

export type uploadPayload = {
  file: MyFile;
  userId: string;
  tags: Tag[];
};
