import { MigrationInterface, QueryRunner } from "typeorm";

export class createChucVuTable1761039235240 implements MigrationInterface {
    name = 'createChucVuTable1761039235240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng chuc_vu
        await queryRunner.query(`
      CREATE TABLE chuc_vu (
        id int NOT NULL AUTO_INCREMENT,
        ten_chuc_vu varchar(255) NOT NULL COMMENT 'Tên chức vụ',
        mo_ta varchar(500) NULL COMMENT 'Mô tả chức vụ',
        created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
        updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
        PRIMARY KEY (id)
      ) ENGINE=InnoDB COMMENT='Bảng quản lý chức vụ'
    `);

        // Insert dữ liệu mẫu
        await queryRunner.query(`
      INSERT INTO chuc_vu (ten_chuc_vu, mo_ta) VALUES
      ('Chủ tịch', 'Chủ tịch công đoàn'),
      ('Phó chủ tịch', 'Phó chủ tịch công đoàn'),
      ('Ủy viên BCH', 'Ủy viên Ban Chấp hành'),
      ('Ủy viên UBKT', 'Ủy viên Ủy ban Kiểm tra')
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa bảng
        await queryRunner.query(`DROP TABLE chuc_vu`);
    }

}
