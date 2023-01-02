/*
  Warnings:

  - Added the required column `type` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Item` ADD COLUMN `type` ENUM('IMAGE', 'VIDEO') NOT NULL;
