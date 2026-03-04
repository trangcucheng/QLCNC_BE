# QLCD Backend - Production Deployment Guide

## 🚀 Triển khai Database Changes lên Production

### Option 1: Chạy migration trên server (Khuyên dùng)

#### Bước 1: Upload code lên server
```bash
# Copy files qua server (trừ node_modules)
rsync -avz --exclude 'node_modules' --exclude '.git' ./ user@server:/path/to/project/

# Hoặc sử dụng deploy script tự động
npm run deploy:prod
```

#### Bước 2: Chạy migration trên server
```bash
# SSH vào server
ssh user@server

# Navigate tới project directory
cd /path/to/project

# Install dependencies
npm install

# Build project
npm run build

# Backup database và chạy migration
chmod +x scripts/migrate-production.sh
./scripts/migrate-production.sh
```

### Option 2: Chạy migration từ local (Cần kết nối trực tiếp)

#### Bước 1: Cấu hình kết nối production database
```bash
# Tạo file .env.production với thông tin server database
cp .env.production.example .env.production

# Sửa thông tin database trong .env.production:
DB_HOST=your_production_server_ip
DB_USER=cdcsmysql
DB_PASS=cdcs@mysql
```

#### Bước 2: Chạy migration từ local
```bash
# Windows
npm run migration:prod

# Linux/Mac  
NODE_ENV=production npm run migration:run
```

## 📋 Checklist trước khi deploy

### 1. Kiểm tra database backup
```sql
-- Tạo backup trước khi migrate
mysqldump -u cdcsmysql -p QLCongDoanCoSo > backup_before_zalo_migration.sql
```

### 2. Kiểm tra các entities mới
- ✅ `ZaloAccount.entity.ts` - Quản lý tài khoản Zalo của users
- ✅ `ZaloSession.entity.ts` - Quản lý OAuth sessions 
- ✅ `OaFollowEvent.entity.ts` - Log follow/unfollow events

### 3. Cập nhật TypeORM configuration
Đảm bảo các entities mới được register trong `app.module.ts`:

```typescript
// Thêm vào entities array
TypeOrmModule.forRoot({
  entities: [
    // ... existing entities
    ZaloAccount,
    ZaloSession, 
    OaFollowEvent,
  ],
})
```

### 4. Test sau khi migration

#### Kiểm tra tables được tạo
```sql
USE QLCongDoanCoSo;
SHOW TABLES LIKE 'zalo_%';
SHOW TABLES LIKE 'oa_follow_events';
```

#### Kiểm tra structure
```sql
DESCRIBE zalo_accounts;
DESCRIBE zalo_sessions;
DESCRIBE oa_follow_events;
```

#### Test API endpoints
```bash
# Health check
curl http://your_server/health

# Test Zalo endpoints  
curl http://your_server/zalo/auth-url
curl -X POST http://your_server/zalo/webhook -H "Content-Type: application/json" -d '{}'
```

## 🔧 Production Environment Variables

Đảm bảo file `.env` production có đủ các biến:

```env
# Database
DB_HOST=your_production_server_ip
DB_PORT=3306
DB_NAME=QLCongDoanCoSo
DB_USER=cdcsmysql
DB_PASS=cdcs@mysql

# Zalo Integration
ZALO_APP_ID=your_app_id
ZALO_APP_SECRET=your_app_secret
ZALO_OA_ID=your_oa_id
ZALO_OA_SECRET=your_oa_secret
ZALO_API_URL=https://oauth.zaloapp.com/v4
ZALO_OA_API_URL=https://openapi.zalo.me/v2.0/oa
```

## 🚨 Rollback Plan

Nếu có lỗi sau khi deploy:

### 1. Rollback database
```bash
mysql -u cdcsmysql -p QLCongDoanCoSo < backup_before_zalo_migration.sql
```

### 2. Rollback code
```bash
# Nếu dùng git
git checkout previous_working_commit

# Restart services
pm2 restart all
```

### 3. Kiểm tra services
```bash
pm2 status
pm2 logs
```

## 📞 Support

Nếu gặp vấn đề trong quá trình deploy:

1. Kiểm tra logs: `pm2 logs`
2. Kiểm tra database connection
3. Verify backup files tồn tại
4. Contact team lead để support

## 🎯 Next Steps sau khi deploy thành công

1. Test tất cả Zalo endpoints
2. Verify webhook nhận được events từ Zalo OA  
3. Test OAuth flow hoàn chỉnh
4. Monitor performance và error logs
5. Update documentation với production URLs
