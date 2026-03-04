import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCumKhuCongNghiepTable1758869700000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng cum_khu_cong_nghiep
    await queryRunner.query(`
            CREATE TABLE \`cum_khu_cong_nghiep\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`ten\` varchar(255) NOT NULL COMMENT 'Tên cụm khu công nghiệp',
                \`moTa\` text NULL COMMENT 'Mô tả về cụm khu công nghiệp',
                \`diaChi\` varchar(500) NULL COMMENT 'Địa chỉ cụm khu công nghiệp',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Thêm foreign key constraint từ organization tới cum_khu_cong_nghiep (nếu bảng organization đã có)
    await queryRunner.query(`
            ALTER TABLE \`organization\` 
            ADD CONSTRAINT \`FK_organization_cumKhuCongNghiep\` 
            FOREIGN KEY (\`cumKhuCnId\`) 
            REFERENCES \`cum_khu_cong_nghiep\`(\`id\`) 
            ON DELETE SET NULL 
            ON UPDATE CASCADE
        `);

    // Tạo index cho performance
    await queryRunner.query(`
            CREATE INDEX \`IDX_organization_cumKhuCnId\` 
            ON \`organization\` (\`cumKhuCnId\`)
        `);

    // Insert dữ liệu mẫu
    await queryRunner.query(`
            INSERT INTO \`cum_khu_cong_nghiep\` (\`ten\`, \`moTa\`, \`diaChi\`) VALUES
            ('Cụm CN Tân Thuận', 'Cụm khu công nghiệp Tân Thuận - TP.HCM', 'Quận 7, TP. Hồ Chí Minh'),
            ('Cụm CN Phú Mỹ Hưng', 'Cụm khu công nghiệp Phú Mỹ Hưng', 'Quận 7, TP. Hồ Chí Minh'),
            ('Cụm CN Hòa Khánh', 'Cụm khu công nghiệp Hòa Khánh - Đà Nẵng', 'Quận Liên Chiểu, Đà Nẵng'),
            ('Cụm CN Thăng Long', 'Cụm khu công nghiệp Thăng Long - Hà Nội', 'Đông Anh, Hà Nội')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa index
    await queryRunner.query(`
            DROP INDEX \`IDX_organization_cumKhuCnId\` 
            ON \`organization\`
        `);

    // Xóa foreign key constraint
    await queryRunner.query(`
            ALTER TABLE \`organization\` 
            DROP FOREIGN KEY \`FK_organization_cumKhuCongNghiep\`
        `);

    // Xóa bảng cum_khu_cong_nghiep
    await queryRunner.query(`DROP TABLE IF EXISTS \`cum_khu_cong_nghiep\``);
  }
}
