-- DropForeignKey
ALTER TABLE `TagsOnItems` DROP FOREIGN KEY `TagsOnItems_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `TagsOnItems` DROP FOREIGN KEY `TagsOnItems_tagId_fkey`;

-- AddForeignKey
ALTER TABLE `TagsOnItems` ADD CONSTRAINT `TagsOnItems_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagsOnItems` ADD CONSTRAINT `TagsOnItems_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
