#!/bin/bash

# Script backup database trước khi migration
# Chạy script này trước khi deploy migration lên production

# Thông tin database từ .env
DB_HOST="your_production_host"
DB_USER="your_production_user"
DB_PASS="your_production_password" 
DB_NAME="qlcd"

# Tạo thư mục backup nếu chưa có
mkdir -p backups

# Tạo backup với timestamp
BACKUP_FILE="backups/qlcd_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "🔄 Đang backup database $DB_NAME..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup thành công: $BACKUP_FILE"
    echo "📦 Kích thước: $(du -h $BACKUP_FILE | cut -f1)"
else
    echo "❌ Backup thất bại!"
    exit 1
fi

# Nén file backup để tiết kiệm dung lượng
gzip $BACKUP_FILE
echo "🗜️ Đã nén backup thành: $BACKUP_FILE.gz"

echo "🎯 Bây giờ bạn có thể chạy migration an toàn!"
