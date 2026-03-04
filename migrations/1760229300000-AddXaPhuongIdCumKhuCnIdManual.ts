import { MigrationInterface, QueryRunner } from "typeorm";

export class AddXaPhuongIdCumKhuCnIdManual1760229300000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if xaPhuongId column exists
    const hasXaPhuongId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "xaPhuongId");
    if (!hasXaPhuongId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` ADD COLUMN \`xaPhuongId\` int NULL`);
    }

    // Check if cumKhuCnId column exists
    const hasCumKhuCnId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "cumKhuCnId");
    if (!hasCumKhuCnId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` ADD COLUMN \`cumKhuCnId\` int NULL`);
    }

    // Modify organizationId to be nullable (only if it's currently NOT NULL)
    await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` MODIFY COLUMN \`organizationId\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove added columns if they exist
    const hasCumKhuCnId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "cumKhuCnId");
    if (hasCumKhuCnId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP COLUMN \`cumKhuCnId\``);
    }

    const hasXaPhuongId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "xaPhuongId");
    if (hasXaPhuongId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` DROP COLUMN \`xaPhuongId\``);
    }

    // Revert organizationId to NOT NULL
    await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` MODIFY COLUMN \`organizationId\` int NOT NULL`);
  }

}
