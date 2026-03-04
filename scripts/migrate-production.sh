#!/bin/bash

# Production Migration Script
# Chạy script này trên server production

echo "🗃️ Running Database Migrations for Zalo Integration..."

# Backup database trước khi migrate
echo "📋 Step 1: Creating database backup..."
BACKUP_FILE="qlcd_db_backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u cdcsmysql -pcdcs@mysql QLCongDoanCoSo > /tmp/$BACKUP_FILE
echo "✅ Database backup saved to /tmp/$BACKUP_FILE"

# Kiểm tra kết nối database
echo "📋 Step 2: Testing database connection..."
mysql -u cdcsmysql -pcdcs@mysql -e "USE QLCongDoanCoSo; SELECT 'Database connected successfully' as status;"

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed. Please check credentials."
    exit 1
fi

# Chạy migrations
echo "📋 Step 3: Running TypeORM migrations..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed. Rolling back..."
    
    # Rollback option
    echo "Do you want to restore from backup? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        mysql -u cdcsmysql -pcdcs@mysql QLCongDoanCoSo < /tmp/$BACKUP_FILE
        echo "🔄 Database restored from backup"
    fi
    exit 1
fi

# Verify new tables exist
echo "📋 Step 4: Verifying new tables..."
mysql -u cdcsmysql -pcdcs@mysql -e "
USE QLCongDoanCoSo; 
SHOW TABLES LIKE 'zalo_%';
SHOW TABLES LIKE 'oa_follow_events';
"

echo "🎉 Migration process completed!"
echo "📁 Database backup location: /tmp/$BACKUP_FILE"
