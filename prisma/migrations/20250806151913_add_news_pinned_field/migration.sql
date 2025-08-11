-- AlterTable
ALTER TABLE `news` ADD COLUMN `isPinned` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `tools` ADD COLUMN `tags` VARCHAR(191) NULL;
