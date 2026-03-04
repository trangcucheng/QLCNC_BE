const mysql = require('mysql');

const conn = mysql.createConnection({
  host: '103.149.29.56',
  port: 3306,
  user: 'cdcsmysql',
  password: 'cdcs@mysql',
  database: 'QLCongDoanCoSo'
});

conn.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err);
    return;
  }
  
  console.log('✅ Connected to database');
  
  // Kiểm tra xem các cột đã tồn tại chưa
  conn.query('DESCRIBE ThoiGianCapNhatDoanSo', (err, results) => {
    if (err) {
      console.error('❌ Error checking table:', err);
      conn.end();
      return;
    }
    
    const columns = results.map(row => row.Field);
    console.log('📋 Current columns:', columns);
    
    if (columns.includes('notification_schedules')) {
      console.log('✅ Columns already exist!');
      conn.end();
      return;
    }
    
    console.log('🔄 Adding new columns...');
    
    // Thêm các cột mới
    const queries = [
      'ALTER TABLE ThoiGianCapNhatDoanSo ADD COLUMN notification_schedules JSON NULL COMMENT "Cấu hình lịch thông báo tự động (JSON)"',
      'ALTER TABLE ThoiGianCapNhatDoanSo ADD COLUMN auto_notification_enabled tinyint NOT NULL DEFAULT 0 COMMENT "Bật/tắt thông báo tự động"',
      'ALTER TABLE ThoiGianCapNhatDoanSo ADD COLUMN next_notification_time datetime NULL COMMENT "Thời gian gửi thông báo tiếp theo"',
      'ALTER TABLE ThoiGianCapNhatDoanSo ADD COLUMN last_notification_time datetime NULL COMMENT "Thời gian gửi thông báo lần cuối"'
    ];
    
    let completed = 0;
    queries.forEach((query, index) => {
      console.log(`🔄 Running query ${index + 1}:`, query);
      conn.query(query, (err) => {
        if (err) {
          console.error(`❌ Error adding column ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Added column ${index + 1} successfully`);
        }
        
        completed++;
        if (completed === queries.length) {
          console.log('🎉 All columns added successfully!');
          
          // Thêm index
          conn.query('CREATE INDEX IDX_thoi_gian_cap_nhat_doan_so_next_notification ON ThoiGianCapNhatDoanSo (next_notification_time, auto_notification_enabled)', (err) => {
            if (err && !err.message.includes('Duplicate key name')) {
              console.error('❌ Error adding index:', err.message);
            } else {
              console.log('✅ Added index successfully');
            }
            conn.end();
          });
        }
      });
    });
  });
});
