import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationTables1759500000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng thong_bao
    await queryRunner.query(`
            CREATE TABLE \`thong_bao\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`noi_dung_thong_bao\` text NOT NULL,
                \`nguoi_gui\` varchar(255) NOT NULL,
                \`ghi_chu\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_thong_bao_nguoi_gui\` (\`nguoi_gui\`),
                CONSTRAINT \`FK_thong_bao_nguoi_gui\` FOREIGN KEY (\`nguoi_gui\`) REFERENCES \`user\` (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

    // Tạo bảng user_thong_bao
    await queryRunner.query(`
            CREATE TABLE \`user_thong_bao\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` varchar(255) NOT NULL,
                \`thong_bao_id\` int NOT NULL,
                \`trang_thai\` varchar(255) NOT NULL DEFAULT 'chua_doc',
                \`ghi_chu\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_user_thong_bao_user\` (\`userId\`),
                KEY \`FK_user_thong_bao_thong_bao\` (\`thong_bao_id\`),
                CONSTRAINT \`FK_user_thong_bao_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`),
                CONSTRAINT \`FK_user_thong_bao_thong_bao\` FOREIGN KEY (\`thong_bao_id\`) REFERENCES \`thong_bao\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa theo thứ tự ngược lại để tránh lỗi foreign key
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_thong_bao\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`thong_bao\``);
  }

}
