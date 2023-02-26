-- AlterTable
ALTER TABLE `Item` ADD COLUMN `optimized` ENUM('NO', 'STARTED', 'FAIL', 'V1') NOT NULL DEFAULT 'NO';
