/*
  Warnings:

  - Made the column `itemId` on table `Image` required. This step will fail if there are existing NULL values in that column.
  - Made the column `itemId` on table `Thumbnail` required. This step will fail if there are existing NULL values in that column.
  - Made the column `itemId` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `Thumbnail` DROP FOREIGN KEY `Thumbnail_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `Video` DROP FOREIGN KEY `Video_itemId_fkey`;

-- AlterTable
ALTER TABLE `Image` MODIFY `itemId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Thumbnail` MODIFY `itemId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Video` MODIFY `itemId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Thumbnail` ADD CONSTRAINT `Thumbnail_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
