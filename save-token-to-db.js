/**
 * save-token-to-db.js
 * Script để lưu token từ .env vào database
 */
const mysql = require('mysql2/promise');

async function saveTokenToDB() {
  const connection = await mysql.createConnection({
    host: '103.149.29.56',
    port: 3306,
    user: 'cdcsmysql',
    password: 'cdcs@mysql',
    database: 'QLCongDoanCoSo'
  });

  try {
    const oaId = '3121990094672718789';
    const accessToken = 'OGwT0Juvv6rf29y4DJZZRcCFdmGy8-0g15F69LW8-GqEFSS41mVyAW9supjV9F8nP1JV7MHVnW0dDlSD07ZdEobDonSm7kybBdBj9MrT-prSAUqnOKJfEdySnXjbQw9qOLc1HaewgNfGOTTlS2RzPIXom7q90i129cRJOJ0fybOp4-nE55dLBmq-pWOvJ-nc0ZNIS2C5s0GrN_GF3IhHDmrixYiFAC8p9sxU2GCXvH8eLe4O3XBn92vqoXfj4zG8UcVq9c0ZsXDzIzuxFZ7DJnLviqT37AzJNN-BR0SsfW4jMwSn1GQ38XzfXWWrKeLWQXU0JMD4h2KuF8OABsU5FGKEWLOw8QT19MlVTIqYfLOlJhbN5Y33EZD1yYSH2VOCBstiEZ4OoZeoTyvMFHREOmPrm7yt7_fiGsu2ILax8kPk';
    
    // Set expiry 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const query = `
      INSERT INTO zalo_oa_tokens (oa_id, access_token, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      access_token = VALUES(access_token),
      expires_at = VALUES(expires_at),
      updated_at = NOW()
    `;
    
    await connection.execute(query, [oaId, accessToken, expiresAt]);
    
    console.log('✅ Token đã được lưu vào database successfully!');
    
    // Verify token exists
    const [rows] = await connection.execute('SELECT * FROM zalo_oa_tokens WHERE oa_id = ?', [oaId]);
    console.log('📋 Token trong DB:', rows[0]);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await connection.end();
  }
}

saveTokenToDB();
