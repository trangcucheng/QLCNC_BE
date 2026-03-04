import { MigrationInterface, QueryRunner } from "typeorm";

export class SkipZaloIntegrationTables1758890000002 implements MigrationInterface {
  name = 'SkipZaloIntegrationTables1758890000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('⏭️ Skipping Zalo Integration Tables - already handled manually');

    // Mark the problematic migration as completed
    await queryRunner.query(`
            INSERT IGNORE INTO migrations (timestamp, name) VALUES 
            (1758890000001, 'CreateZaloIntegrationTables1758890000001')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⏭️ Removing skip marker for Zalo Integration Tables');

    await queryRunner.query(`
            DELETE FROM migrations WHERE name = 'CreateZaloIntegrationTables1758890000001'
        `);
  }
}
