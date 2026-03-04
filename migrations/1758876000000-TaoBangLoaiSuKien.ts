import { MigrationInterface, QueryRunner } from "typeorm";

export class TaoBangLoaiSuKien1758876000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`loai_su_kien\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`ten\` nvarchar(255) NOT NULL COMMENT 'Tên loại sự kiện',
                \`mo_ta\` nvarchar(500) NULL COMMENT 'Mô tả loại sự kiện',
                \`trang_thai\` boolean NOT NULL DEFAULT 1 COMMENT 'Trạng thái hoạt động',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng loại sự kiện';
        `);

    // Thêm dữ liệu mẫu
    await queryRunner.query(`
            INSERT INTO \`loai_su_kien\` (\`ten\`, \`mo_ta\`) VALUES
            ('Họp Ban Chấp hành', 'Cuộc họp định kỳ của Ban Chấp hành Công đoàn'),
            ('Hoạt động văn hóa', 'Các hoạt động văn hóa, văn nghệ của Công đoàn'),
            ('Hoạt động thể thao', 'Giải thể thao, các hoạt động rèn luyện sức khỏe'),
            ('Tập huấn đào tạo', 'Các lớp tập huấn, đào tạo kỹ năng cho đoàn viên'),
            ('Từ thiện xã hội', 'Hoạt động từ thiện, hỗ trợ cộng đồng'),
            ('Kỷ niệm ngày lễ', 'Tổ chức kỷ niệm các ngày lễ lớn trong năm');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`loai_su_kien\``);
  }

}
