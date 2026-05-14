-- AlterTable
ALTER TABLE `HoSoDoiTuong` ADD COLUMN `fileAnh` JSON NULL;

-- UpdateData - Set empty array for existing records
UPDATE `HoSoDoiTuong` SET `fileAnh` = JSON_ARRAY() WHERE `fileAnh` IS NULL;
