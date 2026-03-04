import { MigrationInterface, QueryRunner } from "typeorm";

export class editStaff1761116713789 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Xóa bảng staff cũ (nếu tồn tại)
        await queryRunner.query(`DROP TABLE IF EXISTS \`staff\``);

        // Tạo bảng staff mới với cấu trúc đơn giản
        await queryRunner.query(`
            CREATE TABLE \`staff\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` nvarchar(255) NOT NULL COMMENT 'Tên cán bộ',
                \`phone\` nvarchar(50) NULL COMMENT 'Số điện thoại',
                \`organizationId\` int NULL COMMENT 'ID tổ chức',
                \`chucVuId\` int NULL COMMENT 'ID chức vụ',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo',
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật',
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa bảng staff
        await queryRunner.query(`DROP TABLE IF EXISTS \`staff\``);
    }

}
