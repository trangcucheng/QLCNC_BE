const { createConnection } = require('typeorm');
const ormconfig = require('./ormconfig.js');

async function addColumns() {
  console.log('🔗 Connecting to database...');
  const connection = await createConnection(ormconfig);
  const queryRunner = connection.createQueryRunner();
  
  try {
    console.log('🚀 Adding columns to bao_cao_doan_so_theo_ky...');
    
    // Kiểm tra và thêm cột xaPhuongId
    const hasXaPhuongId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "xaPhuongId");
    if (!hasXaPhuongId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` ADD COLUMN \`xaPhuongId\` int NULL`);
      console.log('✅ Added xaPhuongId column');
    } else {
      console.log('ℹ️  xaPhuongId column already exists');
    }

    // Kiểm tra và thêm cột cumKhuCnId  
    const hasCumKhuCnId = await queryRunner.hasColumn("bao_cao_doan_so_theo_ky", "cumKhuCnId");
    if (!hasCumKhuCnId) {
      await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` ADD COLUMN \`cumKhuCnId\` int NULL`);
      console.log('✅ Added cumKhuCnId column');
    } else {
      console.log('ℹ️  cumKhuCnId column already exists');
    }

    // Đảm bảo organizationId nullable
    await queryRunner.query(`ALTER TABLE \`bao_cao_doan_so_theo_ky\` MODIFY COLUMN \`organizationId\` int NULL`);
    console.log('✅ Modified organizationId to nullable');

    console.log('🎉 All columns added successfully!');
    
    // Kiểm tra kết quả
    const columns = await queryRunner.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'bao_cao_doan_so_theo_ky'
      AND COLUMN_NAME IN ('organizationId', 'xaPhuongId', 'cumKhuCnId')
      ORDER BY COLUMN_NAME
    `);
    
    console.log('\n📋 Current columns:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (nullable: ${col.IS_NULLABLE})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await queryRunner.release();
    await connection.close();
    console.log('🔌 Database connection closed');
  }
}

addColumns().catch(console.error);
