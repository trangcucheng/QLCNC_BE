-- CreateTable
CREATE TABLE `DonVi` (
    `id` VARCHAR(191) NOT NULL,
    `ma` VARCHAR(191) NOT NULL,
    `ten` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `trangThai` BOOLEAN NOT NULL DEFAULT true,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,
    `donViChaId` VARCHAR(191) NULL,

    UNIQUE INDEX `DonVi_ma_key`(`ma`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DonVi` ADD CONSTRAINT `DonVi_donViChaId_fkey` FOREIGN KEY (`donViChaId`) REFERENCES `DonVi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
