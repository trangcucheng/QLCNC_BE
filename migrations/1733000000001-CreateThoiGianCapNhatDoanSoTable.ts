import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateThoiGianCapNhatDoanSoTable1733000000001 implements MigrationInterface {
  name = 'CreateThoiGianCapNhatDoanSoTable1733000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng ThoiGianCapNhatDoanSo
    await queryRunner.query(`
            CREATE TABLE ThoiGianCapNhatDoanSo (
                id int NOT NULL AUTO_INCREMENT,
                ten varchar(255) NOT NULL COMMENT 'Tên đợt cập nhật',
                thoiGianBatDau datetime NOT NULL COMMENT 'Thời gian bắt đầu',
                thoiGianKetThuc datetime NOT NULL COMMENT 'Thời gian kết thúc',
                moTa text NULL COMMENT 'Mô tả chi tiết',
                isActive tinyint NOT NULL DEFAULT 1 COMMENT 'Trạng thái hoạt động',
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (id)
            ) ENGINE=InnoDB COMMENT='Bảng quản lý thời gian cập nhật đoàn số'
        `);

    // Tạo index cho trường isActive
    await queryRunner.query(`
            CREATE INDEX IDX_thoi_gian_cap_nhat_doan_so_isActive 
            ON ThoiGianCapNhatDoanSo (isActive)
        `);

    // Tạo index cho thời gian bắt đầu và kết thúc
    await queryRunner.query(`
            CREATE INDEX IDX_thoi_gian_cap_nhat_doan_so_time_range 
            ON ThoiGianCapNhatDoanSo (thoiGianBatDau, thoiGianKetThuc)
        `);

    // Insert dữ liệu mẫu
    await queryRunner.query(`
            INSERT INTO ThoiGianCapNhatDoanSo (ten, thoiGianBatDau, thoiGianKetThuc, moTa, isActive) VALUES
            ('Cập nhật đoàn số Quý I/2025', '2025-01-01 00:00:00', '2025-03-31 23:59:59', 'Đợt cập nhật thông tin đoàn viên và cơ cấu tổ chức quý đầu năm 2025', true),
            ('Cập nhật đoàn số Quý II/2025', '2025-04-01 00:00:00', '2025-06-30 23:59:59', 'Đợt cập nhật thông tin đoàn viên và cơ cấu tổ chức quý 2 năm 2025', false)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các index
    await queryRunner.query(`DROP INDEX IDX_thoi_gian_cap_nhat_doan_so_time_range ON ThoiGianCapNhatDoanSo`);
    await queryRunner.query(`DROP INDEX IDX_thoi_gian_cap_nhat_doan_so_isActive ON ThoiGianCapNhatDoanSo`);

    // Xóa bảng
    await queryRunner.query(`DROP TABLE ThoiGianCapNhatDoanSo`);
  }
}
