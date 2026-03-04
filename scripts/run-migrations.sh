#!/bin/bash

echo "🚀 Đang chạy migrations cho CDCS database..."

# Kiểm tra xem database đã tồn tại chưa
echo "📋 Checking database connection..."
npm run typeorm -- query "SELECT 1"

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    
    # Chạy migration
    echo "🔄 Running migrations..."
    npm run migration:run
    
    if [ $? -eq 0 ]; then
        echo "✅ Migrations completed successfully!"
        echo ""
        echo "📊 Database structure created:"
        echo "  - ✅ roles"
        echo "  - ✅ users" 
        echo "  - ✅ user_tokens"
        echo "  - ✅ staffs"
        echo "  - ✅ organization (updated structure)"
        echo "  - ✅ cum_khu_cong_nghiep"
        echo "  - ✅ xa_phuong" 
        echo "  - ✅ zalo_users"
        echo ""
        echo "🎉 Ready for development!"
    else
        echo "❌ Migration failed. Check error messages above."
        exit 1
    fi
else
    echo "❌ Database connection failed. Please check:"
    echo "  - MySQL server is running"
    echo "  - Database credentials in .env file"
    echo "  - Database exists"
    exit 1
fi
