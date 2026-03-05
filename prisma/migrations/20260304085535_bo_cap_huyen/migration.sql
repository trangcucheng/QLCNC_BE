/*
  Warnings:

  - You are about to drop the column `donViChaId` on the `DonViHanhChinh` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `DonViHanhChinh` DROP FOREIGN KEY `DonViHanhChinh_donViChaId_fkey`;

-- DropIndex
DROP INDEX `DonViHanhChinh_donViChaId_fkey` ON `DonViHanhChinh`;

-- AlterTable
ALTER TABLE `DonViHanhChinh` DROP COLUMN `donViChaId`,
    ADD COLUMN `loai` VARCHAR(191) NULL,
    ADD COLUMN `tinhThanhPhoId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DonViHanhChinh` ADD CONSTRAINT `DonViHanhChinh_tinhThanhPhoId_fkey` FOREIGN KEY (`tinhThanhPhoId`) REFERENCES `DonViHanhChinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
