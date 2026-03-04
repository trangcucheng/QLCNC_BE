@echo off
echo 🗃️ Running Database Migrations for Zalo Integration...

REM Backup database trước khi migrate
echo 📋 Step 1: Creating database backup...
set BACKUP_FILE=qlcd_db_backup_%date:~10,4%%date:~7,2%%date:~4,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
set BACKUP_FILE=%BACKUP_FILE: =0%
mysqldump -u cdcsmysql -pcdcs@mysql QLCongDoanCoSo > %TEMP%\%BACKUP_FILE%
echo ✅ Database backup saved to %TEMP%\%BACKUP_FILE%

REM Kiểm tra kết nối database  
echo 📋 Step 2: Testing database connection...
mysql -u cdcsmysql -pcdcs@mysql -e "USE QLCongDoanCoSo; SELECT 'Database connected successfully' as status;"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Database connection failed. Please check credentials.
    pause
    exit /b 1
)

REM Chạy migrations
echo 📋 Step 3: Running TypeORM migrations...
npm run migration:run

if %ERRORLEVEL% EQU 0 (
    echo ✅ Migrations completed successfully!
) else (
    echo ❌ Migration failed.
    echo Database backup location: %TEMP%\%BACKUP_FILE%
    pause
    exit /b 1
)

REM Verify new tables exist
echo 📋 Step 4: Verifying new tables...
mysql -u cdcsmysql -pcdcs@mysql -e "USE QLCongDoanCoSo; SHOW TABLES LIKE 'zalo_%%'; SHOW TABLES LIKE 'oa_follow_events';"

echo 🎉 Migration process completed!
echo 📁 Database backup location: %TEMP%\%BACKUP_FILE%
pause
