# 🗄️ Hệ Thống Backup Tự Động

## ✨ Tính Năng

### 1️⃣ Scheduled Backups (Cron Jobs)
- **Daily Backup**: Hàng ngày lúc 2h sáng, giữ 7 bản gần nhất
- **Weekly Backup**: Chủ nhật lúc 3h sáng, giữ 4 bản gần nhất  
- **Monthly Backup**: Ngày 1 hàng tháng lúc 4h sáng, giữ 12 bản gần nhất

### 2️⃣ Backup Compression
- Tự động nén file backup bằng **gzip**
- Giảm kích thước xuống ~10-20% so với file gốc
- Compression levels:
  - Manual/Daily: Level 6 (cân bằng tốc độ & size)
  - Weekly/Monthly: Level 9 (nén tối đa)

### 3️⃣ Retention Policy (Chính Sách Giữ Backup)
- Tự động xóa backup cũ vượt quá số lượng cho phép
- Configurable trong `BackupRestoreService.backupConfig`
- Mặc định:
  - Manual: 5 bản
  - Daily: 7 bản
  - Weekly: 4 bản
  - Monthly: 12 bản

### 4️⃣ Multiple Backup Types
- **Manual**: Backup thủ công qua API
- **Daily**: Backup tự động hàng ngày
- **Weekly**: Backup tự động hàng tuần
- **Monthly**: Backup tự động hàng tháng

## 📁 Cấu Trúc Thư Mục

```
backups/
├── manual/
│   ├── backup-manual-2024-01-15T10-30-00.sql.gz
│   └── backup-manual-2024-01-16T14-20-00.sql.gz
├── daily/
│   ├── backup-daily-2024-01-15T02-00-00.sql.gz
│   ├── backup-daily-2024-01-16T02-00-00.sql.gz
│   └── ... (7 files total)
├── weekly/
│   ├── backup-weekly-2024-01-07T03-00-00.sql.gz
│   └── ... (4 files total)
└── monthly/
    ├── backup-monthly-2024-01-01T04-00-00.sql.gz
    └── ... (12 files total)
```

## 🚀 API Endpoints

### 1. Tạo Backup Thủ Công
```bash
GET /backup-restore/backup
```

**Response:**
```json
"Backup completed successfully: backups/manual/backup-manual-2024-01-15T10-30-00.sql.gz (45.23 MB)"
```

### 2. Restore Database
```bash
POST /backup-restore/restore
Content-Type: application/json

{
  "filePath": "backups/daily/backup-daily-2024-01-15T02-00-00.sql.gz"
}
```

**Response:**
```json
"Restore completed successfully from backups/daily/backup-daily-2024-01-15T02-00-00.sql.gz"
```

### 3. Lấy Danh Sách Backups
```bash
# Tất cả backups
GET /backup-restore/backups

# Chỉ daily backups
GET /backup-restore/backups?type=daily
```

**Response:**
```json
[
  {
    "type": "daily",
    "files": [
      {
        "fileName": "backup-daily-2024-01-16T02-00-00.sql.gz",
        "filePath": "backups/daily/backup-daily-2024-01-16T02-00-00.sql.gz",
        "size": "45.23 MB",
        "createdAt": "2024-01-16T02:05:30.000Z"
      }
    ]
  }
]
```

### 4. Thông Tin Tổng Quan
```bash
GET /backup-restore/summary
```

**Response:**
```json
{
  "totalBackups": 28,
  "totalSize": "1234.56 MB",
  "byType": {
    "manual": {
      "count": 5,
      "maxAllowed": 5,
      "totalSize": "226.15 MB"
    },
    "daily": {
      "count": 7,
      "maxAllowed": 7,
      "totalSize": "316.61 MB"
    },
    "weekly": {
      "count": 4,
      "maxAllowed": 4,
      "totalSize": "180.92 MB"
    },
    "monthly": {
      "count": 12,
      "maxAllowed": 12,
      "totalSize": "510.88 MB"
    }
  }
}
```

### 5. Xóa Backup
```bash
DELETE /backup-restore/delete
Content-Type: application/json

{
  "filePath": "backups/manual/backup-manual-2024-01-15T10-30-00.sql.gz"
}
```

### 6. Cleanup Backups Cũ
```bash
POST /backup-restore/cleanup?type=daily
```

### 7. Test Cron Job
```bash
POST /backup-restore/test-cron
```

## ⚙️ Cấu Hình

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=qlcd
DB_TYPE=mysql  # hoặc postgres

# Backup Configuration (Optional)
BACKUP_DIR=/var/backups/qlcd  # Mặc định: ./backups
```

### Thay Đổi Retention Policy
Chỉnh sửa `backup-restore.service.ts`:

```typescript
private backupConfig: Record<BackupType, BackupConfig> = {
  manual: { maxBackups: 10, compressionLevel: 6 },
  daily: { maxBackups: 30, compressionLevel: 6 },    // Giữ 30 ngày
  weekly: { maxBackups: 8, compressionLevel: 9 },    // Giữ 8 tuần
  monthly: { maxBackups: 24, compressionLevel: 9 },  // Giữ 24 tháng
};
```

### Thay Đổi Lịch Cron
Chỉnh sửa `backup-cron.service.ts`:

```typescript
// Daily backup lúc 3h sáng thay vì 2h
@Cron('0 3 * * *', { ... })

// Weekly backup vào thứ Bảy thay vì Chủ nhật
@Cron('0 3 * * 6', { ... })
```

## 📍 Nơi Lưu Backup Tốt Nhất

### 🏢 Production (Khuyến Nghị)

#### 1️⃣ Cloud Storage (TỐT NHẤT ⭐⭐⭐⭐⭐)
- **AWS S3**: 
  - Durability: 99.999999999%
  - Versioning, lifecycle policies
  - Cost: ~$0.023/GB/month
  
- **Google Cloud Storage**:
  - Nearline/Coldline storage cho archive
  - Lifecycle management tự động
  
- **Azure Blob Storage**:
  - Hot/Cool/Archive tiers
  - Geo-redundant storage

**Ưu điểm:**
- ✅ Durability cao nhất
- ✅ Tự động replicate nhiều region
- ✅ Không lo hết dung lượng
- ✅ Dễ dàng restore từ bất kỳ đâu

**Nhược điểm:**
- ❌ Cần phí hàng tháng
- ❌ Phụ thuộc vào internet

#### 2️⃣ Network Attached Storage (NAS) ⭐⭐⭐⭐
```bash
# Mount NAS vào server
sudo mount -t nfs nas.company.com:/backups /mnt/backups

# Update backup directory
BACKUP_DIR=/mnt/backups/qlcd
```

**Ưu điểm:**
- ✅ Tốc độ cao (local network)
- ✅ Centralized backup
- ✅ Dễ quản lý

#### 3️⃣ Separate Disk/Volume ⭐⭐⭐
```bash
# Mount separate volume
sudo mount /dev/sdb1 /var/backups

# Update backup directory
BACKUP_DIR=/var/backups/qlcd
```

### 💻 Development
```typescript
// Mặc định trong code
private backupDir = path.join(__dirname, '..', '..', '..', 'backups');
```

**Nhớ thêm vào .gitignore:**
```gitignore
# Backups
/backups/
*.sql
*.sql.gz
```

## 🔧 Best Practices

### 1. Sử dụng Cloud Storage cho Production
Cài đặt AWS SDK:
```bash
npm install @aws-sdk/client-s3
```

Tạo S3BackupService:
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async uploadToS3(filePath: string) {
  const s3Client = new S3Client({ region: 'ap-southeast-1' });
  const fileStream = fs.createReadStream(filePath);
  
  await s3Client.send(new PutObjectCommand({
    Bucket: 'my-backup-bucket',
    Key: `qlcd/${path.basename(filePath)}`,
    Body: fileStream,
  }));
}
```

### 2. Monitor Backup Status
- Log vào file riêng: `/var/log/qlcd-backup.log`
- Alert qua email/Slack nếu backup fail
- Dashboard hiển thị backup status

### 3. Test Restore Thường Xuyên
- Tạo database test riêng
- Restore backup vào test DB hàng tuần
- Verify data integrity

### 4. Encrypt Backups
```bash
# Encrypt backup file
openssl enc -aes-256-cbc -salt -in backup.sql.gz -out backup.sql.gz.enc -k YOUR_PASSWORD

# Decrypt
openssl enc -aes-256-cbc -d -in backup.sql.gz.enc -out backup.sql.gz -k YOUR_PASSWORD
```

## 📊 Monitoring

### Check Cron Logs
```bash
# Docker logs
docker logs qlcd-api | grep BACKUP

# PM2 logs
pm2 logs | grep BACKUP
```

### Example Logs
```
🔄 [DAILY BACKUP] Bắt đầu backup database hàng ngày...
📦 Dumping database to backups/daily/backup-daily-2024-01-16T02-00-00.sql...
🗜️  Compressing backup file...
✅ Backup completed: backups/daily/backup-daily-2024-01-16T02-00-00.sql.gz (45.23 MB)
✅ [DAILY BACKUP] Hoàn thành: Backup completed successfully...
🗑️  Cleaning up 1 old daily backups...
   Deleted: backup-daily-2024-01-08T02-00-00.sql.gz
```

## 🚨 Troubleshooting

### Cron không chạy
```typescript
// Check ScheduleModule trong app.module.ts
imports: [
  ScheduleModule.forRoot(),  // Phải có dòng này
  ...
]
```

### Lỗi mysqldump
```bash
# Test command thủ công
mysqldump -h localhost -u root -p qlcd > test.sql

# Check permissions
ls -la /path/to/backups/
```

### Hết dung lượng disk
```bash
# Check disk space
df -h

# Cleanup old backups manually
POST /backup-restore/cleanup?type=daily
POST /backup-restore/cleanup?type=weekly
```

## 📝 Changelog

### Version 1.0.0
- ✅ Scheduled backups (daily/weekly/monthly)
- ✅ Backup compression (gzip)
- ✅ Retention policy
- ✅ Multiple backup types
- ✅ REST API endpoints
- ✅ Automatic cleanup
- ✅ Support MySQL & PostgreSQL

### Roadmap
- [ ] S3 integration
- [ ] Backup encryption
- [ ] Email notifications
- [ ] Backup verification
- [ ] Incremental backups
- [ ] Point-in-time recovery
