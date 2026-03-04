# 📎 Tính năng gửi thông báo sự kiện có file đính kèm

## ✅ Đã sửa lỗi và hoàn thành

### 🔧 **Các lỗi đã được sửa:**

1. **Lỗi `Property 'fileDinhKem' does not exist`**
   - ✅ Đã xóa các tham chiếu đến `fileDinhKem` trong entity `NguoiNhanSuKien`
   - ✅ Chỉ sử dụng `fileDinhKem` từ entity `SuKien` (đã có sẵn)

2. **Lỗi TypeORM create overload**
   - ✅ Đã sửa object creation để khớp với entity schema

3. **Duplicate method call**
   - ✅ Đã thay thế cả 2 chỗ gọi `sendEventNotification` bằng `sendZaloNotificationWithEventFiles`

---

## 🚀 **Tính năng hoạt động như sau:**

### **Khi gửi thông báo sự kiện:**

1. **Tự động kiểm tra** `SuKien.fileDinhKem`
2. **Nếu có file** → Gửi Zalo OA với file đính kèm
3. **Nếu không có** → Gửi thông báo Zalo thường

### **Format JSON của `SuKien.fileDinhKem`:**
```json
{
  "files": [
    {
      "name": "document.pdf",
      "originalName": "Tài liệu hướng dẫn.pdf", 
      "path": "uploads/su-kien/document_123456789_abc.pdf"
    }
  ]
}
```

---

## 🧪 **Test thử:**

### **Bước 1: Tạo sự kiện có file**
```sql
INSERT INTO su_kien (ten_su_kien, file_dinh_kem, thoi_gian_bat_dau, thoi_gian_ket_thuc) 
VALUES (
  'Hội nghị quý 4 2025',
  '{"files":[{"name":"agenda.pdf","path":"uploads/su-kien/agenda.pdf","originalName":"Chương trình hội nghị.pdf"}]}',
  '2025-12-01 09:00:00',
  '2025-12-01 17:00:00'
);
```

### **Bước 2: Gửi thông báo**
```bash
POST /api/nguoi-nhan-su-kien/gui-thong-bao
{
  "suKienId": 1,
  "nguoiNhanIds": ["user1", "user2"],
  "loaiThongBao": "Thông báo sự kiện"
}
```

### **Kết quả:**
- ✅ Database: Lưu thông báo vào `nguoi_nhan_su_kien`
- ✅ Zalo OA: Gửi thông báo + file PDF đến người nhận
- ✅ Response: Trả về `downloadLinks` của file

---

## 📋 **Log để debug:**

Khi có file đính kèm, sẽ thấy log:
```
📎 Gửi thông báo có 1 file đính kèm cho 2 users
```

Khi không có file hoặc parse lỗi:
```
Không thể parse file đính kèm từ sự kiện: [error details]
```

---

## 🎯 **API Endpoints đã sẵn sàng:**

1. **Gửi thông báo** (tự động detect file từ sự kiện)
   ```
   POST /nguoi-nhan-su-kien/gui-thong-bao
   POST /nguoi-nhan-su-kien/gui-thong-bao-tat-ca
   ```

2. **Upload file mới** (nếu muốn đính kèm file riêng)
   ```
   POST /nguoi-nhan-su-kien/gui-thong-bao-co-file
   ```

3. **Download file**
   ```
   GET /api/uploads/su-kien/{filename}
   ```

**🎉 Tính năng đã sẵn sàng sử dụng!**
