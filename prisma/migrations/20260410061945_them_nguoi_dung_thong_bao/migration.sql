-- AlterTable
ALTER TABLE `HoSoDoiTuong` MODIFY `ghiChu` TEXT NULL;

-- CreateTable
CREATE TABLE `NguoiDungThongBao` (
    `id` VARCHAR(191) NOT NULL,
    `nguoiDungId` VARCHAR(191) NOT NULL,
    `thongBaoId` VARCHAR(191) NOT NULL,
    `daDoc` BOOLEAN NOT NULL DEFAULT false,
    `ngayDoc` DATETIME(3) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NguoiDungThongBao_nguoiDungId_daDoc_idx`(`nguoiDungId`, `daDoc`),
    UNIQUE INDEX `NguoiDungThongBao_nguoiDungId_thongBaoId_key`(`nguoiDungId`, `thongBaoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NguoiDungThongBao` ADD CONSTRAINT `NguoiDungThongBao_thongBaoId_fkey` FOREIGN KEY (`thongBaoId`) REFERENCES `ThongBao`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
