import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFailedLoginFieldsToUser1730900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` 
            ADD COLUMN \`failedLoginAttempts\` INT NOT NULL DEFAULT 0 COMMENT 'Số lần nhập sai mật khẩu'
        `);

    await queryRunner.query(`
            ALTER TABLE \`user\` 
            ADD COLUMN \`lastFailedLoginAt\` DATETIME NULL COMMENT 'Thời điểm nhập sai mật khẩu gần nhất'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`lastFailedLoginAt\`
        `);

    await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`failedLoginAttempts\`
        `);
  }
}
