-- AlterTable
ALTER TABLE `Item` MODIFY `processed` ENUM('NO', 'STARTED', 'FAIL', 'V1') NOT NULL;
