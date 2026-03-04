import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTongSoFieldsToBaoCaoDoanSo1730419200000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            ADD COLUMN \`tongSoCongDoan\` INT NOT NULL DEFAULT 0 
            COMMENT 'Tổng số lượng công đoàn'
        `);

    await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            ADD COLUMN \`tongSoCnvcld\` INT NOT NULL DEFAULT 0 
            COMMENT 'Tổng số lượng công nhân viên chức lao động'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            DROP COLUMN \`tongSoCongDoan\`
        `);

    await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            DROP COLUMN \`tongSoCnvcld\`
        `);
  }

}
