-- CreateTable
CREATE TABLE `articles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `authors` TEXT NOT NULL,
    `journal` VARCHAR(191) NOT NULL,
    `volume` VARCHAR(191) NULL,
    `issue` VARCHAR(191) NULL,
    `pages` VARCHAR(191) NULL,
    `publishedDate` DATETIME(3) NOT NULL,
    `doi` VARCHAR(191) NULL,
    `pmid` VARCHAR(191) NULL,
    `abstract` TEXT NULL,
    `keywords` TEXT NULL,
    `impactFactor` DOUBLE NULL,
    `citationCount` INTEGER NULL DEFAULT 0,
    `url` VARCHAR(191) NULL,
    `pdfUrl` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL DEFAULT 'research',
    `isOpenAccess` BOOLEAN NOT NULL DEFAULT false,
    `language` VARCHAR(191) NOT NULL DEFAULT 'en',
    `status` VARCHAR(191) NOT NULL DEFAULT 'published',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` INTEGER NULL,
    `updatedBy` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `articles` ADD CONSTRAINT `articles_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
