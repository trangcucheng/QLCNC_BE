@echo off
echo 🚀 Running Migration to Server Database...

REM Kiểm tra file .env.server tồn tại
if not exist ".env.server" (
    echo ❌ File .env.server không tồn tại!
    echo 💡 Vui lòng tạo file .env.server với thông tin server database
    pause
    exit /b 1
)

REM Backup file .env hiện tại
if exist ".env" (
    echo 📋 Backing up current .env file...
    copy ".env" ".env.local.backup" >nul
)

REM Copy .env.server thành .env để sử dụng
echo 📋 Switching to server database configuration...
copy ".env.server" ".env" >nul

echo 📋 Current database configuration:
findstr "DB_HOST=" .env
findstr "DB_NAME=" .env

REM Xác nhận từ user
set /p confirm="⚠️  Bạn có chắc muốn chạy migration đến database server? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Migration cancelled
    REM Restore .env file
    if exist ".env.local.backup" (
        copy ".env.local.backup" ".env" >nul
        del ".env.local.backup" >nul
    )
    pause
    exit /b 1
)

REM Test kết nối trước
echo 📋 Testing database connection...
node -e "
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
    console.log('❌ Cannot connect to server database:', err.message);
    console.log('🔧 Please check:');
    console.log('   - Server IP address in .env.server');
    console.log('   - MySQL port 3306 is open on server');
    console.log('   - User cdcsmysql has remote access permissions');
    process.exit(1);
  } else {
    console.log('✅ Connected to server database successfully!');
    connection.end();
  }
});
"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Connection failed! Restoring local configuration...
    REM Restore .env file
    if exist ".env.local.backup" (
        copy ".env.local.backup" ".env" >nul
        del ".env.local.backup" >nul
    )
    pause
    exit /b 1
)

REM Build project
echo 📋 Building project...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    REM Restore .env file
    if exist ".env.local.backup" (
        copy ".env.local.backup" ".env" >nul
        del ".env.local.backup" >nul
    )
    pause
    exit /b 1
)

REM Chạy migration
echo 📋 Running migration to server database...
npm run migration:run

if %ERRORLEVEL% EQU 0 (
    echo ✅ Migration completed successfully!
    
    REM Verify tables
    echo 📋 Verifying new tables on server...
    node -e "
    const mysql = require('mysql');
    require('dotenv').config();
    
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    connection.connect();
    
    const queries = [
      'SHOW TABLES LIKE \"zalo_%\"',
      'SHOW TABLES LIKE \"oa_follow_events\"'
    ];
    
    let completed = 0;
    queries.forEach((query) => {
      connection.query(query, (err, results) => {
        if (!err && results.length > 0) {
          console.log('✅ Found tables:', results.map(r => Object.values(r)[0]));
        } else {
          console.log('⚠️  Query result:', results);
        }
        completed++;
        if (completed === queries.length) {
          connection.end();
        }
      });
    });
    "
    
    echo 🎉 MIGRATION TO SERVER COMPLETED!
    echo 💡 Bây giờ có thể restart PM2 trên server: pm2 restart all
    
) else (
    echo ❌ Migration failed!
    echo 🔍 Check the error messages above
)

REM Restore local .env file
echo 📋 Restoring local database configuration...
if exist ".env.local.backup" (
    copy ".env.local.backup" ".env" >nul
    del ".env.local.backup" >nul
    echo ✅ Local configuration restored
)

pause
