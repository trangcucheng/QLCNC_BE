const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect((err) => {
  if (err) {
    console.log('❌ Connection failed:', err.message);
    return;
  }
  
  console.log('✅ Connected to database');
  
  // Check Zalo tables
  connection.query('SHOW TABLES LIKE "zalo_%"', (err, results) => {
    if (!err) {
      console.log('🔍 Zalo tables found:');
      results.forEach(row => {
        console.log('  -', Object.values(row)[0]);
      });
    }
    
    // Check OA events table
    connection.query('SHOW TABLES LIKE "oa_follow_events"', (err2, results2) => {
      if (!err2) {
        console.log('🔍 OA events table:');
        results2.forEach(row => {
          console.log('  -', Object.values(row)[0]);
        });
      }
      
      // Check table structures
      const tables = ['zalo_accounts', 'zalo_sessions', 'oa_follow_events'];
      let completed = 0;
      
      tables.forEach(table => {
        connection.query(`DESCRIBE ${table}`, (err3, results3) => {
          if (!err3) {
            console.log(`\n📋 Structure of ${table}:`);
            results3.forEach(col => {
              console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
          } else {
            console.log(`❌ Table ${table} not found:`, err3.message);
          }
          
          completed++;
          if (completed === tables.length) {
            connection.end();
            console.log('\n🎉 Database verification completed!');
          }
        });
      });
    });
  });
});
