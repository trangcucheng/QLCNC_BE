import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendZaloAccountsTable1759000000000 implements MigrationInterface {
  name = 'ExtendZaloAccountsTable1759000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to zalo_accounts table
    await queryRunner.query(`
            ALTER TABLE \`zalo_accounts\` 
            ADD COLUMN \`zalo_mini_app_id\` varchar(100) NULL COMMENT 'Zalo ID from Mini App login',
            ADD COLUMN \`phone\` varchar(15) NULL COMMENT 'Phone number',
            ADD COLUMN \`additional_info\` json NULL COMMENT 'Extra info from Zalo',
            ADD COLUMN \`last_login_at\` datetime NULL COMMENT 'Last login time',
            ADD COLUMN \`is_active\` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Active status'
        `);

    // Create index for better performance
    await queryRunner.query(`
            CREATE INDEX \`IDX_zalo_accounts_zalo_mini_app_id\` 
            ON \`zalo_accounts\` (\`zalo_mini_app_id\`)
        `);

    // Migrate data from zalo_users to zalo_accounts
    await queryRunner.query(`
            INSERT INTO \`zalo_accounts\` (
                \`user_id\`, 
                \`zalo_app_user_id\`,
                \`zalo_mini_app_id\`,
                \`display_name\`, 
                \`avatar\`, 
                \`phone\`, 
                \`additional_info\`, 
                \`last_login_at\`, 
                \`is_active\`,
                \`created_at\`, 
                \`updated_at\`
            )
            SELECT 
                zu.\`userId\`,
                zu.\`zaloId\`,
                zu.\`zaloId\`,
                zu.\`name\`,
                zu.\`avatar\`,
                zu.\`phone\`,
                zu.\`additionalInfo\`,
                zu.\`lastLoginAt\`,
                zu.\`isActive\`,
                zu.\`createdAt\`,
                zu.\`updatedAt\`
            FROM \`zalo_users\` zu
            WHERE zu.\`userId\` IS NOT NULL
            ON DUPLICATE KEY UPDATE
                \`zalo_mini_app_id\` = VALUES(\`zalo_mini_app_id\`),
                \`phone\` = VALUES(\`phone\`),
                \`additional_info\` = VALUES(\`additional_info\`),
                \`last_login_at\` = VALUES(\`last_login_at\`),
                \`is_active\` = VALUES(\`is_active\`)
        `);

    console.log('✅ Extended zalo_accounts table and migrated data from zalo_users');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the index
    await queryRunner.query(`DROP INDEX \`IDX_zalo_accounts_zalo_mini_app_id\` ON \`zalo_accounts\``);

    // Remove the added columns
    await queryRunner.query(`
            ALTER TABLE \`zalo_accounts\` 
            DROP COLUMN \`zalo_mini_app_id\`,
            DROP COLUMN \`phone\`,
            DROP COLUMN \`additional_info\`,
            DROP COLUMN \`last_login_at\`,
            DROP COLUMN \`is_active\`
        `);

    console.log('✅ Reverted zalo_accounts table extension');
  }
}
