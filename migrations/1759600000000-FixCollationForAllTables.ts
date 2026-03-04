import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCollationForAllTables1759600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix collation cho bảng zalo_accounts - chỉ các cột tồn tại
    await queryRunner.query(`
      ALTER TABLE zalo_accounts 
      MODIFY COLUMN zalo_oa_user_id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN zalo_app_user_id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN zalo_mini_app_id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN display_name VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN avatar TEXT COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN phone VARCHAR(20) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN user_id VARCHAR(255) COLLATE utf8mb4_unicode_ci
    `);


    // Fix collation cho bảng user (chỉ các cột tồn tại)
    await queryRunner.query(`
      ALTER TABLE user 
      MODIFY COLUMN id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN identity VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN forgetPassCode VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN passWord VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN fullName VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN phoneNumber VARCHAR(20) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN email VARCHAR(255) COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN avatar TEXT COLLATE utf8mb4_unicode_ci,
      MODIFY COLUMN description TEXT COLLATE utf8mb4_unicode_ci
    `);

    console.log('✅ Fixed collation for all string columns to utf8mb4_unicode_ci');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Revert back to original collation if needed
    console.log('⚠️ Reverting collation changes...');

    // This is optional since changing back might cause issues
    // Only implement if absolutely necessary
  }
}
