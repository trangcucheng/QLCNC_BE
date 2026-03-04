import { MigrationInterface, QueryRunner } from "typeorm";

export class TaoBangNguoiNhanSuKien1758878000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`nguoi_nhan_su_kien\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`nguoi_nhan_id\` varchar(255) NULL COMMENT 'ID người nhận thông báo',
                \`su_kien_id\` int NOT NULL COMMENT 'ID sự kiện',
                \`trang_thai_xem\` nvarchar(20) NOT NULL DEFAULT 'Chưa xem' COMMENT 'Trạng thái xem: Đã xem, Chưa xem',
                \`thoi_gian_gui\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gửi thông báo',
                \`thoi_gian_xem\` datetime NULL COMMENT 'Thời gian người dùng xem thông báo',
                \`loai_thong_bao\` nvarchar(50) NOT NULL DEFAULT 'Thông báo sự kiện' COMMENT 'Loại thông báo',
                \`ghi_chu\` text NULL COMMENT 'Ghi chú thêm',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`UK_nguoi_nhan_su_kien\` (\`nguoi_nhan_id\`, \`su_kien_id\`),
                KEY \`FK_nguoi_nhan_su_kien_nguoi_nhan\` (\`nguoi_nhan_id\`),
                KEY \`FK_nguoi_nhan_su_kien_su_kien\` (\`su_kien_id\`),
                CONSTRAINT \`FK_nguoi_nhan_su_kien_nguoi_nhan\` FOREIGN KEY (\`nguoi_nhan_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_nguoi_nhan_su_kien_su_kien\` FOREIGN KEY (\`su_kien_id\`) REFERENCES \`su_kien\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người nhận thông báo sự kiện';
        `);


  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`nguoi_nhan_su_kien\``);
  }

}
