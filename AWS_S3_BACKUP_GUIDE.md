# 🌩️ AWS S3 Backup Integration

## ✨ Tính Năng Mới

### Tự Động Backup Song Song: Local + S3
- ✅ Mỗi lần backup tự động lưu **2 nơi**: Local disk + AWS S3
- ✅ Nếu S3 upload fail → Local backup vẫn OK (không ảnh hưởng)
- ✅ Tự động cleanup theo retention policy trên cả 2 nơi
- ✅ Storage Class: **STANDARD_IA** (rẻ hơn 50% so với STANDARD)
- ✅ Encryption at rest: **AES256**

## 🚀 Cài Đặt

### 1. Cài Đặt AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

### 2. Tạo AWS S3 Bucket

#### Option A: AWS Console (Dễ nhất)
1. Đăng nhập https://console.aws.amazon.com/s3
2. Create bucket → Tên: `qlcd-backup-{company}`
3. Region: **ap-southeast-1** (Singapore - gần VN nhất)
4. Block all public access: **Enabled** ✅
5. Versioning: **Enabled** (khuyến nghị)
6. Default encryption: **SSE-S3** (AES256)

#### Option B: AWS CLI
```bash
aws s3 mb s3://qlcd-backup-mycompany --region ap-southeast-1

aws s3api put-bucket-versioning \
  --bucket qlcd-backup-mycompany \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket qlcd-backup-mycompany \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 3. Tạo IAM User với Quyền S3

#### AWS Console:
1. IAM → Users → Create user
2. User name: `qlcd-backup-user`
3. Attach policy: **AmazonS3FullAccess** (hoặc custom policy bên dưới)
4. Security credentials → Create access key
5. Lưu lại: **Access Key ID** và **Secret Access Key**

#### Custom IAM Policy (Bảo mật hơn):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::qlcd-backup-mycompany",
        "arn:aws:s3:::qlcd-backup-mycompany/*"
      ]
    }
  ]
}
```

### 4. Cấu Hình Environment Variables

Thêm vào `.env`:
```env
# AWS S3 Backup Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=ap-southeast-1
AWS_BACKUP_BUCKET=qlcd-backup-mycompany

# Local Backup Directory (Optional)
BACKUP_DIR=/var/backups/qlcd
```

**⚠️ BẢO MẬT:** Đừng commit `.env` vào git!

### 5. Khởi Động Lại Server
```bash
npm run build
pm2 restart qlcd-api
```

## 📡 API Endpoints

### 1. Test S3 Connection
```bash
GET /backup-restore/s3/test
```

**Response:**
```json
{
  "success": true,
  "message": "S3 connection successful - Bucket: qlcd-backup-mycompany"
}
```

### 2. Lấy Danh Sách Backups trên S3
```bash
# Tất cả backups
GET /backup-restore/s3/list

# Chỉ daily backups
GET /backup-restore/s3/list?prefix=qlcd/daily/
```

**Response:**
```json
[
  {
    "key": "qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz",
    "size": "45.23 MB",
    "lastModified": "2024-12-01T02:05:30.000Z",
    "storageClass": "STANDARD_IA"
  }
]
```

### 3. Upload Local Backup lên S3
```bash
POST /backup-restore/s3/upload
Content-Type: application/json

{
  "filePath": "backups/daily/backup-daily-2024-12-01T02-00-00.sql.gz"
}
```

**Response:**
```json
{
  "message": "Upload successful",
  "s3Key": "qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz"
}
```

### 4. Download Backup từ S3
```bash
POST /backup-restore/s3/download
Content-Type: application/json

{
  "s3Key": "qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz",
  "localPath": "backups/restore/downloaded-backup.sql.gz"
}
```

### 5. Xóa Backup trên S3
```bash
DELETE /backup-restore/s3/delete
Content-Type: application/json

{
  "s3Key": "qlcd/manual/backup-manual-2024-12-01T10-30-00.sql.gz"
}
```

## 🔄 Quy Trình Backup Tự Động

### 1. Daily Backup (2h sáng)
```
1. BackupCronService chạy lúc 2h sáng
2. BackupRestoreService tạo backup local
   ├── mysqldump → backup.sql
   ├── gzip compression → backup.sql.gz
   └── Lưu vào: backups/daily/
3. S3BackupService tự động upload
   ├── Upload lên S3 với StorageClass=STANDARD_IA
   ├── Server-side encryption: AES256
   └── S3 Key: qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz
4. Cleanup old backups
   ├── Local: Giữ 7 bản mới nhất
   └── S3: Giữ 7 bản mới nhất
```

### 2. Nếu S3 Fail
```
1. Backup local vẫn hoàn thành ✅
2. Log warning: "S3 upload failed but local backup OK"
3. Admin có thể upload manual sau bằng API /s3/upload
```

## 💰 Chi Phí AWS S3

### Pricing (ap-southeast-1 - Singapore)

#### Storage
- **STANDARD_IA**: $0.0125/GB/month
- **GLACIER**: $0.005/GB/month (archive, restore mất vài giờ)

#### Requests
- PUT/COPY/POST: $0.01 per 1,000 requests
- GET: $0.001 per 1,000 requests

### Ước Tính Chi Phí

**Scenario:** Database 1GB, backup daily

| Item | Calculation | Cost/Month |
|------|-------------|------------|
| Storage (7 daily) | 7 GB × $0.0125 | $0.09 |
| Storage (4 weekly) | 4 GB × $0.0125 | $0.05 |
| Storage (12 monthly) | 12 GB × $0.0125 | $0.15 |
| Upload (30 daily + 4 weekly + 1 monthly) | 35 requests × $0.00001 | $0.0004 |
| Download (test restore 1 lần) | 1 request × $0.000001 | ~$0 |
| **TOTAL** | | **~$0.30/month** |

**Database 10GB:** ~$3/month  
**Database 100GB:** ~$30/month

→ Rất rẻ so với giá trị của data!

## 🎯 Best Practices

### 1. Lifecycle Policy (Tự Động Chuyển Storage Class)

Tạo S3 Lifecycle rule để tiết kiệm chi phí:

```
Rule: Archive old backups
├── Transition to GLACIER after 30 days (Daily backups)
├── Transition to GLACIER after 60 days (Weekly backups)
└── Keep STANDARD_IA for Monthly backups
```

**Cài đặt:**
1. S3 Console → Bucket → Management → Lifecycle rules
2. Create rule:
   - Name: `archive-old-backups`
   - Prefix: `qlcd/daily/`
   - Transition: STANDARD_IA → GLACIER after 30 days
3. Repeat for weekly/monthly với prefix khác

### 2. Versioning

S3 Versioning bảo vệ khỏi xóa nhầm:
- Xóa file → Không mất, chỉ đánh dấu deleted
- Có thể khôi phục lại bất kỳ version nào

**Trade-off:** Chi phí storage x2-3 lần

### 3. Cross-Region Replication

Backup quan trọng? Replicate sang region khác:
- Primary: ap-southeast-1 (Singapore)
- Replica: ap-northeast-1 (Tokyo)

→ Chống data loss khi cả 1 AWS region sập

### 4. Monitoring & Alerts

#### CloudWatch Alarm cho Backup
```bash
# Alert khi không có backup mới trong 25h
aws cloudwatch put-metric-alarm \
  --alarm-name qlcd-backup-missing \
  --metric-name NumberOfObjects \
  --namespace AWS/S3 \
  --statistic Average \
  --period 86400 \
  --threshold 1 \
  --comparison-operator LessThanThreshold
```

#### Email Notification
- SNS Topic → Subscribe email
- CloudWatch Alarm → Send to SNS khi backup fail

## 🔐 Bảo Mật

### 1. Bucket Policy - Block Public Access
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::qlcd-backup-mycompany/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```
→ Chỉ cho phép HTTPS, chặn HTTP

### 2. MFA Delete
```bash
aws s3api put-bucket-versioning \
  --bucket qlcd-backup-mycompany \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device 123456"
```
→ Phải nhập MFA code mới xóa được backup

### 3. Encryption Key Management

Thay vì AES256, dùng KMS để quản lý key:
```typescript
ServerSideEncryption: 'aws:kms',
SSEKMSKeyId: 'arn:aws:kms:ap-southeast-1:123456789012:key/abc123...',
```

## 🧪 Testing

### 1. Test Upload/Download
```bash
# Test upload
curl -X POST http://localhost:3000/backup-restore/s3/upload \
  -H "Content-Type: application/json" \
  -d '{"filePath":"backups/manual/backup-manual-2024-12-01T10-00-00.sql.gz"}'

# Test list
curl http://localhost:3000/backup-restore/s3/list?prefix=qlcd/manual/

# Test download
curl -X POST http://localhost:3000/backup-restore/s3/download \
  -H "Content-Type: application/json" \
  -d '{
    "s3Key":"qlcd/manual/backup-manual-2024-12-01T10-00-00.sql.gz",
    "localPath":"backups/test-restore/downloaded.sql.gz"
  }'
```

### 2. Test Restore từ S3
```bash
# 1. Download từ S3
curl -X POST http://localhost:3000/backup-restore/s3/download \
  -d '{"s3Key":"qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz", "localPath":"backups/restore/latest.sql.gz"}'

# 2. Restore vào database
curl -X POST http://localhost:3000/backup-restore/restore \
  -d '{"filePath":"backups/restore/latest.sql.gz"}'
```

### 3. Test Disaster Recovery
```bash
# Giả lập: Server chết, mất hết local backups
# Restore từ S3 sang server mới:

1. Setup server mới với .env có AWS credentials
2. Download backup mới nhất từ S3
3. Restore database
4. Verify data integrity
```

## 📊 Logs

### S3 Upload Success
```
✅ Local backup completed: backups/daily/backup-daily-2024-12-01T02-00-00.sql.gz (45.23 MB)
☁️  Uploading to S3: qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz...
✅ S3 upload completed: s3://qlcd-backup-mycompany/qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz (45.23 MB)
✅ [DAILY BACKUP] Hoàn thành: Backup completed - Local: ... | S3: qlcd/daily/...
```

### S3 Disabled (No Credentials)
```
⚠️  S3 Backup disabled - Missing AWS credentials
✅ Local backup completed: backups/daily/backup-daily-2024-12-01T02-00-00.sql.gz (45.23 MB)
✅ [DAILY BACKUP] Hoàn thành: Backup completed - Local only: ...
```

### S3 Upload Failed
```
✅ Local backup completed: backups/daily/backup-daily-2024-12-01T02-00-00.sql.gz (45.23 MB)
☁️  Uploading to S3: qlcd/daily/backup-daily-2024-12-01T02-00-00.sql.gz...
❌ S3 upload failed: The specified bucket does not exist
⚠️  S3 upload failed but local backup OK: The specified bucket does not exist
✅ [DAILY BACKUP] Hoàn thành: Backup completed - Local only: ...
```

## 🔧 Troubleshooting

### Error: "The specified bucket does not exist"
→ Kiểm tra `AWS_BACKUP_BUCKET` trong `.env`  
→ Tạo bucket bằng AWS Console

### Error: "Access Denied"
→ IAM user không có quyền S3  
→ Attach policy `AmazonS3FullAccess` hoặc custom policy

### Error: "Invalid Access Key"
→ Kiểm tra `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`  
→ Generate lại Access Key trong IAM Console

### Backup chạy nhưng không upload S3
→ Check logs: "S3 Backup disabled"  
→ Thiếu AWS credentials trong `.env`

### Upload quá chậm
→ File quá lớn → Multipart upload tự động (>5MB)  
→ Bandwidth thấp → Tăng instance type hoặc dùng AWS Direct Connect

## 📝 Summary

### ✅ Đã Implement
- S3BackupService với full CRUD operations
- Tự động upload local backups lên S3
- Cleanup theo retention policy trên cả local & S3
- Storage Class: STANDARD_IA (tiết kiệm chi phí)
- Server-side encryption: AES256
- Graceful degradation: S3 fail → local backup vẫn OK
- REST API endpoints cho S3 operations

### 🎯 Lợi Ích
- **99.999999999% durability** (11 nines)
- **Geo-redundant** - data replicate nhiều datacenter
- **Cost-effective** - ~$0.30/month cho database 1GB
- **Disaster recovery** - Khôi phục từ bất kỳ đâu có internet
- **Versioning** - Không sợ xóa nhầm
- **Encryption** - Bảo mật data at rest

### 🚀 Next Steps
1. Cấu hình S3 Lifecycle rules để archive backups cũ → GLACIER
2. Setup CloudWatch alarms để alert khi backup fail
3. Enable S3 Cross-Region Replication cho critical data
4. Test disaster recovery procedure định kỳ
