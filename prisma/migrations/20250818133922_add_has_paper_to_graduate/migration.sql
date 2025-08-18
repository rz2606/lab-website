-- AlterTable
ALTER TABLE `graduates` ADD COLUMN `advisor` VARCHAR(191) NULL,
    ADD COLUMN `degree` VARCHAR(191) NULL,
    ADD COLUMN `discipline` VARCHAR(191) NULL,
    ADD COLUMN `enrollmentDate` VARCHAR(191) NULL,
    ADD COLUMN `graduationDate` VARCHAR(191) NULL,
    ADD COLUMN `hasPaper` BOOLEAN NULL,
    ADD COLUMN `remarks` TEXT NULL,
    ADD COLUMN `serialNumber` VARCHAR(191) NULL,
    ADD COLUMN `thesisTitle` TEXT NULL;

-- CreateTable
CREATE TABLE `awards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serialNumber` VARCHAR(191) NULL,
    `awardee` VARCHAR(191) NOT NULL,
    `awardDate` VARCHAR(191) NULL,
    `awardName` TEXT NULL,
    `advisor` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `awards` ADD CONSTRAINT `awards_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `awards` ADD CONSTRAINT `awards_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
