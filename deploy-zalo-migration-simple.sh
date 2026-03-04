#!/bin/bash

echo "🚀 QLCD: Running Zalo Integration Migration..."

# Kiểm tra Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Backup database bằng Node.js nếu không có mysqldump
echo "📋 Creating database backup..."
if command -v mysqldump >/dev/null 2>&1; then
    BACKUP_FILE="backup_before_zalo_$(date +%Y%m%d_%H%M%S).sql"
    mysqldump -u cdcsmysql -p'cdcs@mysql' QLCongDoanCoSo > "/tmp/$BACKUP_FILE"
    echo "✅ Database backup created: /tmp/$BACKUP_FILE"
else
    echo "⚠️  mysqldump not found, skipping backup (running migration directly)"
    echo "💡 To enable backup: sudo apt install mysql-client"
fi

# Test database connection với Node.js
echo "📋 Testing database connection..."
node -e "
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'cdcsmysql', 
  password: 'cdcs@mysql',
  database: 'QLCongDoanCoSo'
});
connection.connect((err) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully');
    connection.end();
  }
});
"

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to database! Check credentials."
    exit 1
fi

# Install dependencies nếu cần
if [ ! -d "node_modules" ]; then
    echo "📋 Installing dependencies..."
    npm install
fi

# Build project
echo "📋 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Run migration
echo "📋 Running migration..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    
    # Verify tables bằng Node.js
    echo "📋 Verifying new tables..."
    node -e "
    const mysql = require('mysql');
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'cdcsmysql',
      password: 'cdcs@mysql', 
      database: 'QLCongDoanCoSo'
    });
    connection.connect();
    
    const queries = [
      'SHOW TABLES LIKE \"zalo_%\"',
      'SHOW TABLES LIKE \"oa_follow_events\"',
      'SELECT COUNT(*) as count FROM zalo_accounts',
      'SELECT COUNT(*) as count FROM zalo_sessions', 
      'SELECT COUNT(*) as count FROM oa_follow_events'
    ];
    
    queries.forEach((query, i) => {
      connection.query(query, (err, results) => {
        if (!err) {
          console.log('Query ' + (i+1) + ':', results);
        }
        if (i === queries.length - 1) {
          connection.end();
        }
      });
    });
    "
    
    echo ""
    echo "🎉 MIGRATION HOÀN THÀNH!"
    echo "📋 Có thể restart server: pm2 restart all"
    
else
    echo "❌ Migration failed!"
    echo "🔍 Check logs: npm run migration:run"
    exit 1
fi
