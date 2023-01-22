/*
  Warnings:

  - You are about to drop the column `bitrate` on the `Video` table. All the data in the column will be lost.
  - You are about to alter the column `size` on the `Video` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - You are about to alter the column `width` on the `Video` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedSmallInt`.
  - You are about to alter the column `height` on the `Video` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedSmallInt`.
  - You are about to alter the column `duration` on the `Video` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.
  - Added the required column `bitrateKb` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Video` DROP COLUMN `bitrate`,
    ADD COLUMN `bitrateKb` SMALLINT UNSIGNED NOT NULL,
    MODIFY `size` INTEGER UNSIGNED NOT NULL,
    MODIFY `width` SMALLINT UNSIGNED NOT NULL,
    MODIFY `height` SMALLINT UNSIGNED NOT NULL,
    MODIFY `duration` INTEGER UNSIGNED NOT NULL;
