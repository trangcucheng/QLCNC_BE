import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationIdToThoiGianCapNhatDoanSo1761898095365 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`ThoiGianCapNhatDoanSo\` 
            ADD COLUMN \`organizationId\` TEXT NULL 
            COMMENT 'Danh sách ID tổ chức (cách nhau bởi dấu phẩy). Dùng cho báo cáo đột xuất'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`ThoiGianCapNhatDoanSo\` 
            DROP COLUMN \`organizationId\`
        `);
  }

}
