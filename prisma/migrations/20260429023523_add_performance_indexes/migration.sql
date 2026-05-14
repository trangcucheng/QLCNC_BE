-- CreateIndex
CREATE INDEX `DanhSachDen_hetHan_idx` ON `DanhSachDen`(`hetHan`);

-- CreateIndex
CREATE INDEX `VaiTroNguoiDung_nguoiDungId_idx` ON `VaiTroNguoiDung`(`nguoiDungId`);

-- CreateIndex
CREATE INDEX `VaiTroQuyen_vaiTroId_idx` ON `VaiTroQuyen`(`vaiTroId`);

-- RenameIndex
ALTER TABLE `VaiTroNguoiDung` RENAME INDEX `VaiTroNguoiDung_vaiTroId_fkey` TO `VaiTroNguoiDung_vaiTroId_idx`;

-- RenameIndex
ALTER TABLE `VaiTroQuyen` RENAME INDEX `VaiTroQuyen_quyenId_fkey` TO `VaiTroQuyen_quyenId_idx`;
