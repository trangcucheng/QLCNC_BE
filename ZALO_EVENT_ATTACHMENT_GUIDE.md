## Hướng dẫn sử dụng tính năng gửi thông báo sự kiện có file đính kèm

### 📋 Mô tả
Khi gửi thông báo sự kiện, hệ thống sẽ tự động kiểm tra:
- Nếu sự kiện có `fileDinhKem` trong database → gửi thông báo Zalo kèm file
- Nếu sự kiện không có file → gửi thông báo Zalo thường

### 🔧 Cách thức hoạt động

1. **Kiểm tra file đính kèm từ SuKien entity**
```typescript
// Entity SuKien đã có field:
@Column({ name: 'file_dinh_kem', type: 'text', nullable: true })
fileDinhKem: string; // JSON string chứa thông tin files
```

2. **Logic gửi thông báo**
```typescript
// Method mới được thêm vào NguoiNhanSuKienService:
private async sendZaloNotificationWithEventFiles(
  zaloUserIds: string[], 
  suKien: SuKien, 
  loaiThongBao?: string
): Promise<void>
```

3. **Format JSON của fileDinhKem**
```json
{
  "files": [
    {
      "name": "document.pdf",
      "originalName": "Tài liệu hướng dẫn.pdf",
      "path": "uploads/su-kien/document_123456789_abc.pdf",
      "size": 1024000,
      "uploadedAt": "2025-10-14T10:00:00Z"
    }
  ]
}
```

### 🚀 Test case

#### Case 1: Sự kiện có file đính kèm
```sql
-- Tạo sự kiện có file
INSERT INTO su_kien (ten_su_kien, file_dinh_kem, ...) 
VALUES (
  'Hội nghị quý 4',
  '{"files":[{"name":"agenda.pdf","path":"uploads/su-kien/agenda.pdf"}]}',
  ...
);

-- Gửi thông báo
POST /nguoi-nhan-su-kien/gui-thong-bao
{
  "suKienId": 1,
  "nguoiNhanIds": ["user1", "user2"]
}
```
**Kết quả**: Zalo OA gửi thông báo + file đính kèm

#### Case 2: Sự kiện không có file
```sql
-- Sự kiện không có file
INSERT INTO su_kien (ten_su_kien, file_dinh_kem, ...) 
VALUES ('Họp team', NULL, ...);
```
**Kết quả**: Zalo OA gửi thông báo thường

### 📡 API Endpoints

1. **Gửi thông báo thường** (tự động kiểm tra file từ sự kiện)
```
POST /nguoi-nhan-su-kien/gui-thong-bao
```

2. **Gửi thông báo + upload file mới**
```
POST /nguoi-nhan-su-kien/gui-thong-bao-co-file
Content-Type: multipart/form-data
```

### 🔗 Tích hợp đã hoàn thành

✅ ZaloPushService.sendOAMessageWithAttachment()
✅ Helper method sendZaloNotificationWithEventFiles()
✅ Auto detection từ SuKien.fileDinhKem
✅ Fallback về thông báo thường
✅ Error handling và logging

### 🎯 Lợi ích

- **Tự động**: Không cần config thêm, tự động detect file
- **Linh hoạt**: Hỗ trợ cả file cũ (từ sự kiện) và file mới (upload)
- **An toàn**: Có error handling khi parse JSON thất bại
- **Performance**: Chỉ gửi file khi thật sự cần thiết
