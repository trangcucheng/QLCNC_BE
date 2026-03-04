import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoUyVienColumnsToOrganization1758900000000 implements MigrationInterface {
  name = 'AddSoUyVienColumnsToOrganization1758900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột Số Ủy viên BCH
    await queryRunner.query(`
      ALTER TABLE \`organization\` 
      ADD COLUMN \`soUyVienBch\` int NOT NULL DEFAULT 0 
      COMMENT 'Số Ủy viên Ban Chấp hành'
    `);

    // Thêm cột Số Ủy viên UBKT  
    await queryRunner.query(`
      ALTER TABLE \`organization\` 
      ADD COLUMN \`soUyVienUbkt\` int NOT NULL DEFAULT 0 
      COMMENT 'Số Ủy viên Ủy ban Kiểm tra'
    `);

    // Cập nhật dữ liệu mẫu cho các tổ chức hiện có
    await queryRunner.query(`
      UPDATE \`organization\` 
      SET 
        \`soUyVienBch\` = CASE 
          WHEN \`organizationLevel\` = 1 THEN 15
          WHEN \`organizationLevel\` = 2 THEN 9
          WHEN \`organizationLevel\` = 3 THEN 7
          ELSE 5
        END,
        \`soUyVienUbkt\` = CASE 
          WHEN \`organizationLevel\` = 1 THEN 7
          WHEN \`organizationLevel\` = 2 THEN 5
          WHEN \`organizationLevel\` = 3 THEN 3
          ELSE 3
        END
      WHERE \`soUyVienBch\` = 0 AND \`soUyVienUbkt\` = 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột Số Ủy viên UBKT
    await queryRunner.query(`
      ALTER TABLE \`organization\` 
      DROP COLUMN \`soUyVienUbkt\`
    `);

    // Xóa cột Số Ủy viên BCH
    await queryRunner.query(`
      ALTER TABLE \`organization\` 
      DROP COLUMN \`soUyVienBch\`
    `);
  }
}
