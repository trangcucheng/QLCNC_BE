const mysql = require('mysql');

// Thông tin kết nối database từ .env hoặc config
const connection = mysql.createConnection({
  host: '103.149.29.56',
  port: 3306,
  user: 'cdcsmysql',
  password: 'cdcs@mysql',
  database: 'QLCongDoanCoSo'
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS zalo_oa_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    oa_id VARCHAR(255) COMMENT 'Zalo OA ID',
    access_token TEXT COMMENT 'Access token của Zalo OA',
    refresh_token TEXT COMMENT 'Refresh token của Zalo OA',
    expires_in INT COMMENT 'Thời gian hết hạn token (seconds)',
    expires_at DATETIME COMMENT 'Thời điểm hết hạn token',
    token_type VARCHAR(50) DEFAULT 'Bearer' COMMENT 'Loại token',
    scope TEXT COMMENT 'Phạm vi quyền của token',
    is_active TINYINT DEFAULT 1 COMMENT '1: Active, 0: Inactive',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
    INDEX idx_oa_id (oa_id),
    INDEX idx_active (is_active),
    INDEX idx_expires_at (expires_at)
  )
`;

connection.connect((err) => {
  if (err) {
    console.error('❌ Lỗi kết nối database:', err);
    return;
  }
  
  console.log('✅ Đã kết nối database thành công');
  
  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('❌ Lỗi tạo bảng:', err);
    } else {
      console.log('✅ Bảng zalo_oa_tokens đã được tạo thành công!');
    }
    
    connection.end();
  });
});
