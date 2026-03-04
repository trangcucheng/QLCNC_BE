/**
 * test-token-logic.js
 * Test logic lấy token và auto-refresh
 */

const mysql = require('mysql2/promise');
const axios = require('axios');

async function testTokenLogic() {
  // Kết nối DB
  const connection = await mysql.createConnection({
    host: '103.149.29.56',
    port: 3306,
    user: 'cdcsmysql',
    password: 'cdcs@mysql',
    database: 'QLCongDoanCoSo'
  });

  try {
    console.log('=== TEST ZALO OA TOKEN LOGIC ===\n');

    // 1. Kiểm tra bảng có tồn tại chưa
    console.log('1️⃣ Kiểm tra bảng zalo_oa_tokens...');
    try {
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'zalo_oa_tokens'"
      );
      if (tables.length === 0) {
        console.log('❌ Bảng zalo_oa_tokens chưa tồn tại!');
        // Tạo bảng
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS zalo_oa_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            oa_id VARCHAR(255) NOT NULL COMMENT 'Zalo OA ID',
            access_token TEXT NOT NULL COMMENT 'Access token',
            refresh_token TEXT COMMENT 'Refresh token',
            expires_in INT NOT NULL COMMENT 'Thời gian hết hạn (seconds)',
            expires_at DATETIME NOT NULL COMMENT 'Thời điểm hết hạn',
            token_type VARCHAR(50) DEFAULT 'Bearer' COMMENT 'Loại token',
            scope TEXT COMMENT 'Phạm vi quyền',
            is_active TINYINT DEFAULT 1 COMMENT '1: Active, 0: Inactive',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_oa_id (oa_id),
            INDEX idx_active (is_active),
            INDEX idx_expires_at (expires_at)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await connection.query(createTableSQL);
        console.log('✅ Đã tạo bảng zalo_oa_tokens');
      } else {
        console.log('✅ Bảng zalo_oa_tokens đã tồn tại');
      }
    } catch (error) {
      console.error('❌ Lỗi kiểm tra bảng:', error.message);
    }

    // 2. Kiểm tra token hiện tại
    console.log('\n2️⃣ Kiểm tra token hiện tại...');
    const oaId = '3121990094672718789';
    const [currentTokens] = await connection.query(
      'SELECT * FROM zalo_oa_tokens WHERE oa_id = ? ORDER BY created_at DESC LIMIT 5',
      [oaId]
    );

    if (currentTokens.length === 0) {
      console.log('❌ Không có token nào trong DB');
      
      // Thêm token từ .env để test
      const staticToken = 'OGwT0Juvv6rf29y4DJZZRcCFdmGy8-0g15F69LW8-GqEFSS41mVyAW9supjV9F8nP1JV7MHVnW0dDlSD07ZdEobDonSm7kybBdBj9MrT-prSAUqnOKJfEdySnXjbQw9qOLc1HaewgNfGOTTlS2RzPIXom7q90i129cRJOJ0fybOp4-nE55dLBmq-pWOvJ-nc0ZNIS2C5s0GrN_GF3IhHDmrixYiFAC8p9sxU2GCXvH8eLe4O3XBn92vqoXfj4zG8UcVq9c0ZsXDzIzuxFZ7DJnLviqT37AzJNN-BR0SsfW4jMwSn1GQ38XzfXWWrKeLWQXU0JMD4h2KuF8OABsU5FGKEWLOw8QT19MlVTIqYfLOlJhbN5Y33EZD1yYSH2VOCBstiEZ4OoZeoTyvMFHREOmPrm7yt7_fiGsu2ILax8kPk';
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 ngày
      
      await connection.query(
        `INSERT INTO zalo_oa_tokens 
         (oa_id, access_token, expires_in, expires_at, is_active) 
         VALUES (?, ?, ?, ?, 1)`,
        [oaId, staticToken, 30*24*60*60, expiresAt]
      );
      console.log('✅ Đã thêm token mặc định để test');
    } else {
      console.log('📋 Danh sách token:');
      currentTokens.forEach((token, index) => {
        const expiresAt = new Date(token.expires_at);
        const now = new Date();
        const timeToExpiry = expiresAt.getTime() - now.getTime();
        const minutesToExpiry = Math.floor(timeToExpiry / (1000 * 60));
        
        console.log(`  ${index + 1}. ID: ${token.id} | Active: ${token.is_active} | Expires: ${expiresAt.toISOString()} | Time left: ${minutesToExpiry} minutes`);
      });
    }

    // 3. Test logic getAccessToken
    console.log('\n3️⃣ Test logic getAccessToken...');
    const [activeTokens] = await connection.query(
      'SELECT * FROM zalo_oa_tokens WHERE oa_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
      [oaId]
    );
    const activeToken = activeTokens[0];

    if (activeToken) {
      const expiresAt = new Date(activeToken.expires_at);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;
      const willExpireSoon = (expiresAt.getTime() - now.getTime()) < fiveMinutes;
      
      console.log(`📊 Token hiện tại:`);
      console.log(`   - Token ID: ${activeToken.id}`);
      console.log(`   - Expires at (raw): ${activeToken.expires_at}`);
      console.log(`   - Current time: ${now.toISOString()}`);
      
      // Kiểm tra và chuyển đổi thời gian an toàn
      const expiresTime = new Date(activeToken.expires_at);
      if (isNaN(expiresTime.getTime())) {
        console.log(`   - ❌ Thời gian expires_at không hợp lệ`);
        return;
      }
      
      console.log(`   - Expires at: ${expiresTime.toISOString()}`);
      console.log(`   - Minutes left: ${Math.floor((expiresTime.getTime() - now.getTime()) / (1000 * 60))}`);
      console.log(`   - Will expire soon: ${willExpireSoon}`);
      
      if (willExpireSoon) {
        console.log('⚠️ Token sắp hết hạn - cần refresh!');
        if (activeToken.refresh_token) {
          console.log('🔄 Có refresh_token, có thể tự động refresh');
        } else {
          console.log('❌ Không có refresh_token - cần OAuth lại');
        }
      } else {
        console.log('✅ Token còn hiệu lực');
      }
    }

    // 4. Test call API với token hiện tại
    console.log('\n4️⃣ Test call Zalo OA API...');
    if (activeToken) {
      try {
        const testResponse = await axios.post(
          'https://openapi.zalo.me/v2.0/oa/message',
          {
            recipient: { user_id: '2434694422809794199' },
            message: { text: 'Test token từ script debug' }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'access_token': activeToken.access_token
            }
          }
        );
        console.log('✅ API call thành công:', testResponse.data);
      } catch (apiError) {
        console.log('❌ API call thất bại:');
        console.log('   Response:', apiError.response?.data);
        console.log('   Status:', apiError.response?.status);
        
        if (apiError.response?.status === 401) {
          console.log('🔑 Token có thể đã hết hạn hoặc không hợp lệ');
        }
      }
    }

    console.log('\n=== COMPLETE ===');

  } catch (error) {
    console.error('❌ Lỗi tổng quát:', error);
  } finally {
    await connection.end();
  }
}

testTokenLogic();
