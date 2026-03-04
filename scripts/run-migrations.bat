@echo off
echo 🚀 Đang chạy migrations cho CDCS database...

REM Kiểm tra database connection
echo 📋 Checking database connection...
call npm run typeorm -- query "SELECT 1"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database connection successful
    
    REM Chạy migration
    echo 🔄 Running migrations...
    call npm run migration:run
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Migrations completed successfully!
        echo.
        echo 📊 Database structure created:
        echo   - ✅ roles
        echo   - ✅ users
        echo   - ✅ user_tokens  
        echo   - ✅ staffs
        echo   - ✅ organization ^(updated structure^)
        echo   - ✅ cum_khu_cong_nghiep
        echo   - ✅ xa_phuong
        echo   - ✅ zalo_users
        echo.
        echo 🎉 Ready for development!
    ) else (
        echo ❌ Migration failed. Check error messages above.
        exit /b 1
    )
) else (
    echo ❌ Database connection failed. Please check:
    echo   - MySQL server is running
    echo   - Database credentials in .env file  
    echo   - Database exists
    exit /b 1
)
