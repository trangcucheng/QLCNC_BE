import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateZaloUserTable1758875312637 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`zalo_users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`zaloId\` varchar(100) NOT NULL COMMENT 'Zalo User ID',
                \`name\` varchar(255) NOT NULL COMMENT 'Tên người dùng Zalo',
                \`phone\` varchar(15) NULL COMMENT 'Số điện thoại',
                \`avatar\` text NULL COMMENT 'Avatar URL',
                \`userId\` varchar(255) NULL COMMENT 'Liên kết với user hệ thống',
                \`additionalInfo\` json NULL COMMENT 'Thông tin bổ sung từ Zalo',
                \`lastLoginAt\` datetime NULL COMMENT 'Lần cuối đăng nhập',
                \`isActive\` boolean NOT NULL DEFAULT 1 COMMENT 'Trạng thái hoạt động',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`UK_zalo_users_zaloId\` (\`zaloId\`),
                KEY \`FK_zalo_users_userId\` (\`userId\`),
                CONSTRAINT \`FK_zalo_users_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng Zalo Mini App';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`zalo_users\``);
    }

}
