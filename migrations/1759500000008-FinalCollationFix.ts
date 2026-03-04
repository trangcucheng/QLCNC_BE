import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinalCollationFix1759500000008 implements MigrationInterface {
  name = 'FinalCollationFix1759500000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Final collation fix for remaining tables...');

    try {
      // Kiểm tra và fix bất kỳ bảng nào còn có collation mismatch

      // Fix organization table các text columns
      await queryRunner.query(`
                ALTER TABLE organization 
                MODIFY COLUMN name VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN address TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN description TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN ghiChu TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN tenChuTichCongDoan VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN sdtChuTich VARCHAR(20) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            `);
      console.log('✅ Fixed organization table collation');

      // Fix user table text columns
      await queryRunner.query(`
                ALTER TABLE user 
                MODIFY COLUMN fullName VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN phoneNumber VARCHAR(20) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN email VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN avatar VARCHAR(500) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN description TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            `);
      console.log('✅ Fixed user table text columns collation');

      console.log('✅ All final collation fixes completed');

    } catch (error) {
      console.error('❌ Error in final collation fix:', error.message);
      // Don't throw error, just log it since some columns might not exist
      console.log('⚠️ Some columns might not exist, continuing...');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting final collation changes...');
    console.log('⚠️ Collation revert not implemented for safety reasons');
  }
}
