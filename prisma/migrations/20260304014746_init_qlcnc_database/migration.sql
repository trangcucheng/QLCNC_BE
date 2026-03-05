-- CreateTable
CREATE TABLE `NguoiDung` (
    `id` VARCHAR(191) NOT NULL,
    `hoTen` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `matKhau` VARCHAR(191) NOT NULL,
    `soDienThoai` VARCHAR(191) NULL,
    `loaiNguoiDung` ENUM('CAN_BO_NGHIEP_VU', 'LANH_DAO', 'QUAN_TRI_VIEN') NOT NULL,
    `trangThaiHoatDong` BOOLEAN NOT NULL DEFAULT true,
    `lanDangNhapCuoi` DATETIME(3) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NguoiDung_email_key`(`email`),
    UNIQUE INDEX `NguoiDung_soDienThoai_key`(`soDienThoai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VaiTro` (
    `id` VARCHAR(191) NOT NULL,
    `tenVaiTro` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VaiTro_tenVaiTro_key`(`tenVaiTro`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quyen` (
    `id` VARCHAR(191) NOT NULL,
    `tenQuyen` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Quyen_tenQuyen_key`(`tenQuyen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VaiTroQuyen` (
    `id` VARCHAR(191) NOT NULL,
    `vaiTroId` VARCHAR(191) NOT NULL,
    `quyenId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VaiTroQuyen_vaiTroId_quyenId_key`(`vaiTroId`, `quyenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VaiTroNguoiDung` (
    `id` VARCHAR(191) NOT NULL,
    `nguoiDungId` VARCHAR(191) NOT NULL,
    `vaiTroId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `VaiTroNguoiDung_nguoiDungId_vaiTroId_key`(`nguoiDungId`, `vaiTroId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LichSuDangNhap` (
    `id` VARCHAR(191) NOT NULL,
    `nguoiDungId` VARCHAR(191) NOT NULL,
    `diaChiIP` VARCHAR(191) NULL,
    `thietBi` VARCHAR(191) NULL,
    `trinh_duyet` VARCHAR(191) NULL,
    `viTri` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonViHanhChinh` (
    `id` VARCHAR(191) NOT NULL,
    `ma` VARCHAR(191) NOT NULL,
    `ten` VARCHAR(191) NOT NULL,
    `cap` INTEGER NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `trangThai` BOOLEAN NOT NULL DEFAULT true,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,
    `donViChaId` VARCHAR(191) NULL,

    UNIQUE INDEX `DonViHanhChinh_ma_key`(`ma`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToimDanh` (
    `id` VARCHAR(191) NOT NULL,
    `ma` VARCHAR(191) NOT NULL,
    `ten` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `khungHinhPhat` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ToimDanh_ma_key`(`ma`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuanHeXaHoi` (
    `id` VARCHAR(191) NOT NULL,
    `tenQuanHe` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QuanHeXaHoi_tenQuanHe_key`(`tenQuanHe`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BieuMau` (
    `id` VARCHAR(191) NOT NULL,
    `ten` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `duongDan` VARCHAR(191) NOT NULL,
    `phienBan` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HoSoDoiTuong` (
    `id` VARCHAR(191) NOT NULL,
    `hoTen` VARCHAR(191) NOT NULL,
    `tenGoiKhac` VARCHAR(191) NULL,
    `gioiTinh` ENUM('NAM', 'NU') NOT NULL,
    `ngaySinh` DATETIME(3) NOT NULL,
    `noiSinh` VARCHAR(191) NULL,
    `quocTich` VARCHAR(191) NOT NULL DEFAULT 'Việt Nam',
    `danToc` VARCHAR(191) NOT NULL DEFAULT 'Kinh',
    `tonGiao` VARCHAR(191) NULL,
    `soCMND_CCCD` VARCHAR(191) NULL,
    `ngayCapCMND` DATETIME(3) NULL,
    `noiCapCMND` VARCHAR(191) NULL,
    `soHoChieu` VARCHAR(191) NULL,
    `ngayCapHoChieu` DATETIME(3) NULL,
    `noiCapHoChieu` VARCHAR(191) NULL,
    `trinhDoHocVan` VARCHAR(191) NULL,
    `ngheNghiep` VARCHAR(191) NULL,
    `noiLamViec` VARCHAR(191) NULL,
    `capBac` VARCHAR(191) NULL,
    `chucVu` VARCHAR(191) NULL,
    `donVi` VARCHAR(191) NULL,
    `queQuanId` VARCHAR(191) NULL,
    `diaChiQueQuan` VARCHAR(191) NULL,
    `noiThuongTruId` VARCHAR(191) NULL,
    `diaChiThuongTru` VARCHAR(191) NULL,
    `noiOHienTaiId` VARCHAR(191) NULL,
    `diaChiHienTai` VARCHAR(191) NULL,
    `tienAn` VARCHAR(191) NULL,
    `tienSu` VARCHAR(191) NULL,
    `trangThai` ENUM('DANG_THEO_DOI', 'TAM_GIAM', 'DA_XU_LY', 'CHUYEN_NOI_KHAC') NOT NULL DEFAULT 'DANG_THEO_DOI',
    `ghiChu` VARCHAR(191) NULL,
    `anhDaiDien` VARCHAR(191) NULL,
    `nguoiTaoId` VARCHAR(191) NOT NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HoSoDoiTuong_soCMND_CCCD_key`(`soCMND_CCCD`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuanHeDoiTuong` (
    `id` VARCHAR(191) NOT NULL,
    `doiTuongChinh` VARCHAR(191) NOT NULL,
    `doiTuongLienQuan` VARCHAR(191) NOT NULL,
    `quanHeId` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HoSoVuViec` (
    `id` VARCHAR(191) NOT NULL,
    `soHoSo` VARCHAR(191) NOT NULL,
    `tenVuViec` VARCHAR(191) NOT NULL,
    `moTaVuViec` VARCHAR(191) NOT NULL,
    `ngayXayRa` DATETIME(3) NOT NULL,
    `diaChiXayRa` VARCHAR(191) NOT NULL,
    `donViHanhChinhId` VARCHAR(191) NULL,
    `mucDoViPham` ENUM('NONG', 'RAT_NONG', 'DAC_BIET_NONG') NOT NULL,
    `trangThai` ENUM('DANG_XU_LY', 'TAM_DUNG', 'HOAN_THANH', 'CHUYEN_GIAI', 'HUY_BO') NOT NULL DEFAULT 'DANG_XU_LY',
    `donViXuLy` VARCHAR(191) NULL,
    `canBoXuLy` VARCHAR(191) NULL,
    `ngayBatDauXuLy` DATETIME(3) NULL,
    `ngayKetThuc` DATETIME(3) NULL,
    `ketQuaXuLy` VARCHAR(191) NULL,
    `ghiChu` VARCHAR(191) NULL,
    `nguoiTaoId` VARCHAR(191) NOT NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HoSoVuViec_soHoSo_key`(`soHoSo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VuViecDoiTuong` (
    `id` VARCHAR(191) NOT NULL,
    `vuViecId` VARCHAR(191) NOT NULL,
    `doiTuongId` VARCHAR(191) NOT NULL,
    `vaiTro` VARCHAR(191) NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VuViecDoiTuong_vuViecId_doiTuongId_key`(`vuViecId`, `doiTuongId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VuViecToimDanh` (
    `id` VARCHAR(191) NOT NULL,
    `vuViecId` VARCHAR(191) NOT NULL,
    `toimDanhId` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VuViecToimDanh_vuViecId_toimDanhId_key`(`vuViecId`, `toimDanhId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LichSuXuLyVuViec` (
    `id` VARCHAR(191) NOT NULL,
    `vuViecId` VARCHAR(191) NOT NULL,
    `trangThaiCu` ENUM('DANG_XU_LY', 'TAM_DUNG', 'HOAN_THANH', 'CHUYEN_GIAI', 'HUY_BO') NULL,
    `trangThaiMoi` ENUM('DANG_XU_LY', 'TAM_DUNG', 'HOAN_THANH', 'CHUYEN_GIAI', 'HUY_BO') NOT NULL,
    `lyDo` VARCHAR(191) NOT NULL,
    `nguoiThucHien` VARCHAR(191) NOT NULL,
    `ngayThucHien` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaiLieuDoiTuong` (
    `id` VARCHAR(191) NOT NULL,
    `doiTuongId` VARCHAR(191) NOT NULL,
    `tenTaiLieu` VARCHAR(191) NOT NULL,
    `loaiTaiLieu` ENUM('HINH_ANH', 'VIDEO', 'TAI_LIEU', 'CHUNG_CU_SO') NOT NULL,
    `duongDan` VARCHAR(191) NOT NULL,
    `kichThuoc` INTEGER NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaiLieuVuViec` (
    `id` VARCHAR(191) NOT NULL,
    `vuViecId` VARCHAR(191) NOT NULL,
    `tenTaiLieu` VARCHAR(191) NOT NULL,
    `loaiTaiLieu` ENUM('HINH_ANH', 'VIDEO', 'TAI_LIEU', 'CHUNG_CU_SO') NOT NULL,
    `duongDan` VARCHAR(191) NOT NULL,
    `kichThuoc` INTEGER NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DanhSachDen` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `hetHan` DATETIME(3) NOT NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DanhSachDen_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ThongBao` (
    `id` VARCHAR(191) NOT NULL,
    `tieuDe` VARCHAR(191) NOT NULL,
    `noiDung` VARCHAR(191) NOT NULL,
    `loaiThongBao` VARCHAR(191) NOT NULL,
    `uu_tien` INTEGER NOT NULL DEFAULT 1,
    `trangThai` BOOLEAN NOT NULL DEFAULT true,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CauHinhHeThong` (
    `id` VARCHAR(191) NOT NULL,
    `khoa` VARCHAR(191) NOT NULL,
    `giaTri` VARCHAR(191) NOT NULL,
    `moTa` VARCHAR(191) NULL,
    `ngayTao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ngayCapNhat` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CauHinhHeThong_khoa_key`(`khoa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VaiTroQuyen` ADD CONSTRAINT `VaiTroQuyen_vaiTroId_fkey` FOREIGN KEY (`vaiTroId`) REFERENCES `VaiTro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VaiTroQuyen` ADD CONSTRAINT `VaiTroQuyen_quyenId_fkey` FOREIGN KEY (`quyenId`) REFERENCES `Quyen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VaiTroNguoiDung` ADD CONSTRAINT `VaiTroNguoiDung_nguoiDungId_fkey` FOREIGN KEY (`nguoiDungId`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VaiTroNguoiDung` ADD CONSTRAINT `VaiTroNguoiDung_vaiTroId_fkey` FOREIGN KEY (`vaiTroId`) REFERENCES `VaiTro`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LichSuDangNhap` ADD CONSTRAINT `LichSuDangNhap_nguoiDungId_fkey` FOREIGN KEY (`nguoiDungId`) REFERENCES `NguoiDung`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonViHanhChinh` ADD CONSTRAINT `DonViHanhChinh_donViChaId_fkey` FOREIGN KEY (`donViChaId`) REFERENCES `DonViHanhChinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HoSoDoiTuong` ADD CONSTRAINT `HoSoDoiTuong_queQuanId_fkey` FOREIGN KEY (`queQuanId`) REFERENCES `DonViHanhChinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HoSoDoiTuong` ADD CONSTRAINT `HoSoDoiTuong_noiThuongTruId_fkey` FOREIGN KEY (`noiThuongTruId`) REFERENCES `DonViHanhChinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HoSoDoiTuong` ADD CONSTRAINT `HoSoDoiTuong_noiOHienTaiId_fkey` FOREIGN KEY (`noiOHienTaiId`) REFERENCES `DonViHanhChinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HoSoDoiTuong` ADD CONSTRAINT `HoSoDoiTuong_nguoiTaoId_fkey` FOREIGN KEY (`nguoiTaoId`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuanHeDoiTuong` ADD CONSTRAINT `QuanHeDoiTuong_doiTuongChinh_fkey` FOREIGN KEY (`doiTuongChinh`) REFERENCES `HoSoDoiTuong`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuanHeDoiTuong` ADD CONSTRAINT `QuanHeDoiTuong_quanHeId_fkey` FOREIGN KEY (`quanHeId`) REFERENCES `QuanHeXaHoi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HoSoVuViec` ADD CONSTRAINT `HoSoVuViec_donViHanhChinhId_fkey` FOREIGN KEY (`donViHanhChinhId`) REFERENCES `DonViHanhChinh`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HoSoVuViec` ADD CONSTRAINT `HoSoVuViec_nguoiTaoId_fkey` FOREIGN KEY (`nguoiTaoId`) REFERENCES `NguoiDung`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VuViecDoiTuong` ADD CONSTRAINT `VuViecDoiTuong_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VuViecDoiTuong` ADD CONSTRAINT `VuViecDoiTuong_doiTuongId_fkey` FOREIGN KEY (`doiTuongId`) REFERENCES `HoSoDoiTuong`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VuViecToimDanh` ADD CONSTRAINT `VuViecToimDanh_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VuViecToimDanh` ADD CONSTRAINT `VuViecToimDanh_toimDanhId_fkey` FOREIGN KEY (`toimDanhId`) REFERENCES `ToimDanh`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LichSuXuLyVuViec` ADD CONSTRAINT `LichSuXuLyVuViec_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaiLieuDoiTuong` ADD CONSTRAINT `TaiLieuDoiTuong_doiTuongId_fkey` FOREIGN KEY (`doiTuongId`) REFERENCES `HoSoDoiTuong`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaiLieuVuViec` ADD CONSTRAINT `TaiLieuVuViec_vuViecId_fkey` FOREIGN KEY (`vuViecId`) REFERENCES `HoSoVuViec`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
