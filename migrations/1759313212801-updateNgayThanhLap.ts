import { MigrationInterface, QueryRunner } from "typeorm";

export class updateNgayThanhLap1759313212801 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thay đổi kiểu dữ liệu từ INT sang DATE
        await queryRunner.query(`
      ALTER TABLE organization MODIFY COLUMN namThanhLap DATE COMMENT 'Ngày thành lập';
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE organization MODIFY COLUMN namThanhLap INT COMMENT 'Năm thành lập';
    `);
    }

}
