import { MigrationInterface, QueryRunner } from "typeorm";

export class editBaoCaoDoanSo21761067763898 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm 2 cột vào bảng organization
        await queryRunner.query(`
            ALTER TABLE organization 
            ADD COLUMN tongSoCongDoan INT DEFAULT 0 COMMENT 'Tổng số lượng công đoàn',
            ADD COLUMN tongSoCnvcld INT DEFAULT 0 COMMENT 'Tổng số lượng công nhân viên chức lao động'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa 2 cột khi rollback
        await queryRunner.query(`
            ALTER TABLE organization 
            DROP COLUMN tongSoCongDoan,
            DROP COLUMN tongSoCnvcld
        `);
    }

}
