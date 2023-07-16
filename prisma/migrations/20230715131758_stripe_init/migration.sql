-- AlterTable
ALTER TABLE `User` ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `subEndsAt` DATETIME(3) NULL,
    ADD COLUMN `trialEndsAt` DATETIME(3) NULL;
