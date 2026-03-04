import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSuKienCollation1759500000007 implements MigrationInterface {
  name = 'FixSuKienCollation1759500000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔧 Fixing collation for su_kien and nguoi_nhan_su_kien tables...');

    try {
      // Fix su_kien table collations
      await queryRunner.query(`
                ALTER TABLE su_kien 
                MODIFY COLUMN ten_su_kien VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN noi_dung_su_kien TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN dia_diem VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN trang_thai VARCHAR(50) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN doi_tuong VARCHAR(255) 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN file_dinh_kem TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN ghi_chu TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            `);
      console.log('✅ Updated su_kien table collation');

      // Fix nguoi_nhan_su_kien table
      await queryRunner.query(`
                ALTER TABLE nguoi_nhan_su_kien 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci,
                MODIFY COLUMN ghi_chu TEXT 
                CHARACTER SET utf8mb4 
                COLLATE utf8mb4_unicode_ci
            `);
      console.log('✅ Updated nguoi_nhan_su_kien table collation');

      console.log('✅ All su_kien related collations fixed');

    } catch (error) {
      console.error('❌ Error fixing su_kien collations:', error.message);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting su_kien collation changes...');

    // Note: Reverting collation changes is risky and may cause data issues
    // This down migration is for reference only
    console.log('⚠️ Collation revert not implemented for safety reasons');
  }
}
