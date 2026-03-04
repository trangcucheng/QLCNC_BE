import { MigrationInterface, QueryRunner } from "typeorm";

export class TaoBangSuKien1758877000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`su_kien\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`ten_su_kien\` nvarchar(255) NOT NULL COMMENT 'Tên sự kiện',
                \`thoi_gian_bat_dau\` datetime NOT NULL COMMENT 'Thời gian bắt đầu',
                \`thoi_gian_ket_thuc\` datetime NOT NULL COMMENT 'Thời gian kết thúc',
                \`nguoi_tao\` varchar(255) NULL COMMENT 'User ID người tạo sự kiện',
                \`noi_dung_su_kien\` text NULL COMMENT 'Nội dung chi tiết sự kiện',
                \`dia_diem\` nvarchar(255) NULL COMMENT 'Địa điểm tổ chức',
                \`trang_thai\` nvarchar(50) NOT NULL DEFAULT 'Đang chuẩn bị' COMMENT 'Trạng thái sự kiện',
                \`doi_tuong\` nvarchar(255) NULL COMMENT 'Đối tượng tham gia',
                \`loai_su_kien_id\` int NULL COMMENT 'ID loại sự kiện',
                \`so_luong_tham_gia_du_kien\` int NULL DEFAULT 0 COMMENT 'Số lượng dự kiến tham gia',
                \`file_dinh_kem\` text NULL COMMENT 'Đường dẫn file đính kèm (JSON format)',
                \`ghi_chu\` text NULL COMMENT 'Ghi chú thêm',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`),
                KEY \`FK_su_kien_nguoi_tao\` (\`nguoi_tao\`),
                KEY \`FK_su_kien_loai_su_kien\` (\`loai_su_kien_id\`),
                CONSTRAINT \`FK_su_kien_nguoi_tao\` FOREIGN KEY (\`nguoi_tao\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT \`FK_su_kien_loai_su_kien\` FOREIGN KEY (\`loai_su_kien_id\`) REFERENCES \`loai_su_kien\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng sự kiện';
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`su_kien\``);
    }

}
