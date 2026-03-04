import { MigrationInterface, QueryRunner } from "typeorm";

export class AddForeignKeyColumnsToBaoCao1760230000000 implements MigrationInterface {
  name = 'AddForeignKeyColumnsToBaoCao1760230000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra và thêm cột xaPhuongId nếu chưa có
    const hasXaPhuongId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "xaPhuongId");
    if (!hasXaPhuongId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` ADD COLUMN \`xaPhuongId\` int NULL`);
    }

    // Kiểm tra và thêm cột cumKhuCnId nếu chưa có
    const hasCumKhuCnId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "cumKhuCnId");
    if (!hasCumKhuCnId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` ADD COLUMN \`cumKhuCnId\` int NULL`);
    }

    // Đảm bảo organizationId có thể null
    await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` MODIFY COLUMN \`organizationId\` int NULL`);

    // Thêm foreign key constraints
    // FK cho organizationId
    try {
      await queryRunner.query(`
                ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
                ADD CONSTRAINT \`FK_bao_cao_organization\` 
                FOREIGN KEY (\`organizationId\`) REFERENCES \`organization\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
            `);
    } catch (error) {
      console.log('Organization FK might already exist:', error.message);
    }

    // FK cho xaPhuongId
    try {
      await queryRunner.query(`
                ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
                ADD CONSTRAINT \`FK_bao_cao_xa_phuong\` 
                FOREIGN KEY (\`xaPhuongId\`) REFERENCES \`xa_phuong\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
            `);
    } catch (error) {
      console.log('XaPhuong FK might already exist:', error.message);
    }

    // FK cho cumKhuCnId
    try {
      await queryRunner.query(`
                ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
                ADD CONSTRAINT \`FK_bao_cao_cum_khu_cn\` 
                FOREIGN KEY (\`cumKhuCnId\`) REFERENCES \`cum_khu_cong_nghiep\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
            `);
    } catch (error) {
      console.log('CumKhuCongNghiep FK might already exist:', error.message);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign key constraints
    try {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP FOREIGN KEY \`FK_bao_cao_cum_khu_cn\``);
    } catch (error) {
      console.log('Error dropping CumKhuCongNghiep FK:', error.message);
    }

    try {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP FOREIGN KEY \`FK_bao_cao_xa_phuong\``);
    } catch (error) {
      console.log('Error dropping XaPhuong FK:', error.message);
    }

    try {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP FOREIGN KEY \`FK_bao_cao_organization\``);
    } catch (error) {
      console.log('Error dropping Organization FK:', error.message);
    }

    // Xóa các cột (nếu cần)
    const hasCumKhuCnId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "cumKhuCnId");
    if (hasCumKhuCnId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP COLUMN \`cumKhuCnId\``);
    }

    const hasXaPhuongId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "xaPhuongId");
    if (hasXaPhuongId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP COLUMN \`xaPhuongId\``);
    }

    // Khôi phục organizationId về NOT NULL (tùy chọn, có thể bỏ qua nếu cần giữ nullable)
    // await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` MODIFY COLUMN \`organizationId\` int NOT NULL`);
  }
}
