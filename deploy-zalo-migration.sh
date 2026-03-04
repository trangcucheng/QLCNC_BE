#!/bin/bash

echo "🚀 QLCD: Running Zalo Integration Migration..."

# Kiểm tra Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Backup database trước khi migrate
echo "📋 Creating database backup..."
BACKUP_FILE="backup_before_zalo_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u cdcsmysql -p'cdcs@mysql' QLCongDoanCoSo > "/tmp/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Database backup created: /tmp/$BACKUP_FILE"
else
    echo "❌ Backup failed! Aborting migration."
    exit 1
fi

# Test database connection
echo "📋 Testing database connection..."
mysql -u cdcsmysql -p'cdcs@mysql' -e "SELECT 'Connected to QLCongDoanCoSo' as status;" QLCongDoanCoSo

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
    
    # Verify tables được tạo
    echo "📋 Verifying new tables..."
    mysql -u cdcsmysql -p'cdcs@mysql' QLCongDoanCoSo << EOF
SHOW TABLES LIKE 'zalo_%';
SHOW TABLES LIKE 'oa_follow_events';
SELECT COUNT(*) as zalo_accounts_count FROM zalo_accounts;
SELECT COUNT(*) as zalo_sessions_count FROM zalo_sessions;
SELECT COUNT(*) as oa_follow_events_count FROM oa_follow_events;
EOF
    
    echo ""
    echo "🎉 MIGRATION HOÀN THÀNH!"
    echo "📁 Database backup: /tmp/$BACKUP_FILE"
    echo "📋 Có thể restart server: pm2 restart all"
    
else
    echo "❌ Migration failed!"
    echo "🔄 Rollback option available with backup: /tmp/$BACKUP_FILE"
    echo "To rollback: mysql -u cdcsmysql -p QLCongDoanCoSo < /tmp/$BACKUP_FILE"
    exit 1
fi
