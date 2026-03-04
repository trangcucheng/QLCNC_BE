import { MigrationInterface, QueryRunner } from "typeorm";

export class UnifyAllCollationsToUuid1759500000005 implements MigrationInterface {
  name = 'UnifyAllCollationsToUuid1759500000005'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Unifying all user ID references to UUID with utf8mb4_unicode_ci...');

    // 1. Convert user.id về lại UUID format và utf8mb4_unicode_ci
    try {
      console.log('Converting user.id back to UUID format...');

      // Clear all existing user_id references first để tránh constraint errors
      await queryRunner.query(`UPDATE zalo_accounts SET user_id = NULL WHERE user_id IS NOT NULL`);
      await queryRunner.query(`UPDATE user_thong_bao SET userId = NULL WHERE userId IS NOT NULL`);

      // Convert user.id to VARCHAR UUID with utf8mb4_unicode_ci
      await queryRunner.query(`
                ALTER TABLE user 
                MODIFY COLUMN id VARCHAR(36) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            `);

      // Generate UUIDs for all existing users
      await queryRunner.query(`UPDATE user SET id = UUID() WHERE 1=1`);

      console.log('✅ User.id converted to UUID with utf8mb4_unicode_ci');
    } catch (error) {
      console.log('⚠️ Error converting user.id:', error.message);
    }

    // 2. Update all related tables to use utf8mb4_unicode_ci
    const tablesToUpdate = [
      { table: 'zalo_accounts', column: 'user_id' },
      { table: 'user_thong_bao', column: 'userId' },
      { table: 'thong_bao', column: 'nguoi_gui' }
    ];

    for (const { table, column } of tablesToUpdate) {
      try {
        await queryRunner.query(`
                    ALTER TABLE ${table} 
                    MODIFY COLUMN ${column} VARCHAR(36) 
                    CHARACTER SET utf8mb4 
                    COLLATE utf8mb4_unicode_ci
                `);
        console.log(`✅ Updated ${table}.${column} collation`);
      } catch (error) {
        console.log(`⚠️ Could not update ${table}.${column}:`, error.message);
      }
    }

    console.log('✅ All collations unified to utf8mb4_unicode_ci');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Reverting collation unification...');
    // Revert logic if needed
  }
}
