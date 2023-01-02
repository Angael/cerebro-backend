/*
  Warnings:

  - Added the required column `height` to the `Thumbnail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Thumbnail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Thumbnail` ADD COLUMN `height` INTEGER NOT NULL,
    ADD COLUMN `width` INTEGER NOT NULL;
