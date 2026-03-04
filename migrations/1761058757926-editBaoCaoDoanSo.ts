import { MigrationInterface, QueryRunner } from "typeorm";

export class editBaoCaoDoanSo1761058757926 implements MigrationInterface {
    name = 'editBaoCaoDoanSo1761058757926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm cột loaiBaoCao vào bảng bao_cao_doan_so_theo_ky
        await queryRunner.query(`
      ALTER TABLE bao_cao_doan_so_theo_ky
      ADD COLUMN loaiBaoCao ENUM('dinh_ky', 'dot_xuat') NOT NULL DEFAULT 'dinh_ky'
      COMMENT 'Loại báo cáo: Định kỳ hoặc Đột xuất'
      AFTER noiDung
    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        // Xóa cột loaiBaoCao
        await queryRunner.query(`
      ALTER TABLE bao_cao_doan_so_theo_ky
      DROP COLUMN loaiBaoCao
    `);
    }

}
