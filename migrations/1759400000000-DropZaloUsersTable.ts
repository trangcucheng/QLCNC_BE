import { MigrationInterface, QueryRunner } from "typeorm";

export class DropZaloUsersTable1759400000000 implements MigrationInterface {
  name = 'DropZaloUsersTable1759400000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️ Dropping zalo_users table - migrated to ZaloAccount only');

    // Check if table exists before dropping
    const tableExists = await queryRunner.hasTable('zalo_users');
    if (tableExists) {
      await queryRunner.dropTable('zalo_users');
      console.log('✅ Successfully dropped zalo_users table');
    } else {
      console.log('⚠️ Table zalo_users does not exist, skipping drop');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Recreating zalo_users table for rollback');

    // Recreate the table structure (based on the original ZaloUser entity)
    await queryRunner.query(`
            CREATE TABLE \`zalo_users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`zalo_id\` varchar(255) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`avatar\` text NULL,
                \`last_login_at\` datetime NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                \`user_id\` varchar(36) NULL,
                \`total_follow_oa\` int NOT NULL DEFAULT '0',
                \`additional_info\` json NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_zalo_users_zalo_id\` (\`zalo_id\`),
                INDEX \`IDX_zalo_users_user_id\` (\`user_id\`)
            ) ENGINE=InnoDB
        `);

    // Add foreign key constraint to users table
    await queryRunner.query(`
            ALTER TABLE \`zalo_users\` 
            ADD CONSTRAINT \`FK_zalo_users_user_id\` 
            FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);

    console.log('✅ Recreated zalo_users table for rollback');
  }
}
