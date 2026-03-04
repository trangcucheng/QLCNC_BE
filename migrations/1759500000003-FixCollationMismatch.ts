import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCollationMismatch1759500000003 implements MigrationInterface {
  name = 'FixCollationMismatch1759500000003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Fixing collation mismatch between user and zalo_accounts tables...');

    // Fix collation của zalo_accounts.user_id để match với user.id
    try {
      await queryRunner.query(`
                ALTER TABLE zalo_accounts 
                MODIFY COLUMN user_id VARCHAR(36) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_0900_ai_ci
            `);
      console.log('✅ Updated zalo_accounts.user_id collation to utf8mb4_0900_ai_ci');
    } catch (error) {
      console.log('⚠️ Could not update zalo_accounts collation:', error.message);
    }

    console.log('✅ Collation fix migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Reverting collation changes...');
    // Revert changes if needed
  }
}
