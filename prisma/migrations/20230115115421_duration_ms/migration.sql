/*
  Warnings:

  - You are about to drop the column `duration` on the `Video` table. All the data in the column will be lost.
  - Added the required column `durationMs` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Video` DROP COLUMN `duration`,
    ADD COLUMN `durationMs` INTEGER UNSIGNED NOT NULL;
