import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateXaPhuongTable1758869800000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng xa_phuong
    await queryRunner.query(`
            CREATE TABLE \`xa_phuong\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`ten\` varchar(255) NOT NULL COMMENT 'Tên xã phường',
                \`moTa\` text NULL COMMENT 'Mô tả về xã phường',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Insert dữ liệu mẫu cho các xã phường
    await queryRunner.query(`
            INSERT INTO \`xa_phuong\` (\`ten\`, \`moTa\`) VALUES
            ('Phường Tân Thuận Đông', 'Phường Tân Thuận Đông, Quận 7, TP. Hồ Chí Minh'),
            ('Phường Tân Thuận Tây', 'Phường Tân Thuận Tây, Quận 7, TP. Hồ Chí Minh'),
            ('Phường Phú Thuận', 'Phường Phú Thuận, Quận 7, TP. Hồ Chí Minh'),
            ('Phường Phú Mỹ', 'Phường Phú Mỹ, Quận 7, TP. Hồ Chí Minh'),
            ('Phường Bình Thuận', 'Phường Bình Thuận, Quận 7, TP. Hồ Chí Minh'),
            ('Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Bắc, Quận Liên Chiểu, Đà Nẵng'),
            ('Phường Hòa Khánh Nam', 'Phường Hòa Khánh Nam, Quận Liên Chiểu, Đà Nẵng'),
            ('Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Bắc, Quận Liên Chiểu, Đà Nẵng'),
            ('Xã Đông Anh', 'Xã Đông Anh, Huyện Đông Anh, Hà Nội'),
            ('Xã Thăng Long', 'Xã Thăng Long, Huyện Đông Anh, Hà Nội'),
            ('Xã Vân Hà', 'Xã Vân Hà, Huyện Đông Anh, Hà Nội'),
            ('Xã Vân Nội', 'Xã Vân Nội, Huyện Đông Anh, Hà Nội')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng xa_phuong
    await queryRunner.query(`DROP TABLE IF EXISTS \`xa_phuong\``);
  }
}
