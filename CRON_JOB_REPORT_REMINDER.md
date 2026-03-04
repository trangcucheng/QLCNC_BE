# Cron Job Nhắc Nhở Kỳ Báo Cáo

## 📋 Tổng Quan

Hệ thống tự động gửi thông báo nhắc nhở cho tất cả users **trước 1 ngày** khi bắt đầu kỳ báo cáo.

---

## ⏰ Lịch Chạy

**Cron Expression:** `0 7 * * *`

- **Thời gian:** Mỗi ngày lúc **7:00 sáng** (giờ Việt Nam)
- **Timezone:** `Asia/Ho_Chi_Minh`
- **Tần suất:** Hàng ngày

---

## 🔍 Logic Hoạt Động

### 1. Kiểm Tra Hàng Ngày

```
1. Lấy ngày mai (today + 1 day)
2. Lấy tất cả kỳ báo cáo đang active (isActive = true)
3. Với mỗi kỳ, kiểm tra:
   - Ngày mai có phải ngày BẮT ĐẦU kỳ báo cáo không?
4. Nếu có → Gửi thông báo nhắc nhở
```

### 2. Điều Kiện Gửi Thông Báo

| Loại Kỳ | Điều Kiện Gửi |
|----------|---------------|
| **Hàng tháng** | `ngayMai == ngayBatDauTrongThang`<br>VD: Kỳ từ 1-5, gửi vào ngày 31 (trước ngày 1) |
| **Hàng quý** | `thangMai IN cacThangApDung` AND `ngayMai == ngayBatDauTrongThang`<br>VD: Quý [1,4,7,10], ngày 1-15 → Gửi vào 31/3, 30/6, 30/9, 31/12 |
| **Hàng năm** | `thangMai == thangBatDau` AND `ngayMai == ngayBatDauTrongThang`<br>VD: Tháng 12, ngày 20-31 → Gửi vào 19/12 |
| **Đột xuất** | `thoiGianBatDau == ngayMai`<br>VD: Kỳ 15/05-20/05 → Gửi vào 14/05 |

---

## 📊 Ví Dụ Cụ Thể

### Scenario 1: Báo Cáo Hàng Tháng

**Cấu hình:**
```json
{
  "id": 1,
  "ten": "Báo cáo đầu tháng",
  "loaiKy": "hang_thang",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 5
}
```

**Timeline:**

| Ngày | Cron Job Chạy | Hành Động |
|------|---------------|-----------|
| **30/10/2025 07:00** | Ngày mai = 31/10 | ❌ Không gửi (31 ≠ 1) |
| **31/10/2025 07:00** | Ngày mai = 01/11 | ✅ **GỬI THÔNG BÁO** (1 == 1) |
| **01/11/2025 07:00** | Ngày mai = 02/11 | ❌ Không gửi (2 ≠ 1) |

**Nội dung thông báo:**
```
🔔 NHẮC NHỞ: Kỳ báo cáo đoàn số bắt đầu ngày mai

Kỳ báo cáo: "Báo cáo đầu tháng"
📋 Mô tả: Báo cáo đoàn số định kỳ

📅 Loại: Báo cáo hàng tháng
📆 Thời gian: Từ ngày 1/11/2025 đến 5/11/2025
⏰ Bắt đầu: 1/11/2025
🚨 Hạn nộp: 5/11/2025

💡 Vui lòng chuẩn bị và nộp báo cáo đúng thời hạn!
```

---

### Scenario 2: Báo Cáo Hàng Quý

**Cấu hình:**
```json
{
  "id": 2,
  "ten": "Báo cáo đầu quý",
  "loaiKy": "hang_quy",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 15,
  "cacThangApDung": [1, 4, 7, 10]
}
```

**Timeline năm 2025:**

| Ngày | Ngày Mai | Hành Động |
|------|----------|-----------|
| **31/12/2024 07:00** | 01/01/2025 (Quý 1) | ✅ **GỬI** cho Quý 1 |
| **31/03/2025 07:00** | 01/04/2025 (Quý 2) | ✅ **GỬI** cho Quý 2 |
| **30/06/2025 07:00** | 01/07/2025 (Quý 3) | ✅ **GỬI** cho Quý 3 |
| **30/09/2025 07:00** | 01/10/2025 (Quý 4) | ✅ **GỬI** cho Quý 4 |

**Tổng cộng:** Gửi **4 lần/năm**

---

### Scenario 3: Báo Cáo Hàng Năm

**Cấu hình:**
```json
{
  "id": 3,
  "ten": "Báo cáo tổng kết năm",
  "loaiKy": "hang_nam",
  "thangBatDau": 12,
  "ngayBatDauTrongThang": 20,
  "ngayKetThucTrongThang": 31
}
```

**Timeline:**

| Ngày | Hành Động |
|------|-----------|
| **19/12/2025 07:00** | ✅ **GỬI** thông báo báo cáo năm 2025 |

**Tổng cộng:** Gửi **1 lần/năm**

---

### Scenario 4: Báo Cáo Đột Xuất

**Cấu hình:**
```json
{
  "id": 4,
  "ten": "Báo cáo đột xuất tháng 5",
  "loaiKy": "dot_xuat",
  "thoiGianBatDau": "2025-05-15T00:00:00.000Z",
  "thoiGianKetThuc": "2025-05-20T23:59:59.000Z"
}
```

**Timeline:**

| Ngày | Hành Động |
|------|-----------|
| **14/05/2025 07:00** | ✅ **GỬI** thông báo |
| **15/05/2025 07:00** | ❌ Không gửi (đã qua ngày bắt đầu) |

---

## 🎯 Ai Nhận Thông Báo?

**Tất cả users đáp ứng:**
1. `isActive = true` trong bảng `user`
2. Có liên kết Zalo account trong bảng `zalo_users`
3. Zalo account `isActive = true`

**Ưu tiên gửi:**
1. `zaloOaUserId` (đã follow OA)
2. `zaloAppUserId` (đăng nhập qua Zalo App)
3. `zaloMiniAppId` (chỉ dùng Mini App)

---

## 📱 Nội Dung Thông Báo

### Template Chung

```
🔔 NHẮC NHỞ: Kỳ báo cáo đoàn số bắt đầu ngày mai

Kỳ báo cáo: "{tên kỳ}"
📋 Mô tả: {mô tả}

📅 Loại: {loại kỳ}
📆 Thời gian: Từ ngày {ngày bắt đầu} đến {ngày kết thúc}
⏰ Bắt đầu: {ngày bắt đầu}
🚨 Hạn nộp: {ngày kết thúc}

💡 Vui lòng chuẩn bị và nộp báo cáo đúng thời hạn!
```

### Metadata

```json
{
  "messageType": "bao_cao_nhac_nho",
  "relatedId": 123,
  "type": "reminder",
  "loaiKy": "hang_thang",
  "ngayBatDau": "1/11/2025"
}
```

---

## 🔧 Technical Details

### File Structure

```
src/HeThong/thoi-gian-cap-nhat-doan-so/
├── thoi-gian-cap-nhat-doan-so-cron.service.ts  ← Cron service
├── thoi-gian-cap-nhat-doan-so.service.ts       ← Main service
├── thoi-gian-cap-nhat-doan-so.controller.ts    ← Controller
└── thoi-gian-cap-nhat-doan-so.module.ts        ← Module
```

### Cron Service Methods

```typescript
class ThoiGianCapNhatDoanSoCronService {
  @Cron('0 7 * * *')
  handleReportPeriodReminder()  // Main cron handler
  
  kiemTraCanGuiThongBao()       // Check if should send
  
  guiThongBaoNhacNho()          // Send notification
  
  testSendReminder()            // Test API
}
```

---

## 🧪 Testing

### 1. Test API (Manual)

```bash
GET http://localhost:3000/thoi-gian-cap-nhat-doan-so/cron/test-reminder
```

**Response:**
```json
{
  "success": true,
  "message": "Test cron job completed. Check logs for details."
}
```

### 2. Check Logs

```
🔔 [CRON] Bắt đầu kiểm tra kỳ báo cáo cần nhắc nhở...
📅 Ngày mai: 1/11/2025
📊 Tìm thấy 5 kỳ báo cáo đang active
📢 [CRON] Gửi thông báo cho kỳ: Báo cáo đầu tháng (ID: 1)
👥 [CRON] Tìm thấy 150 users active
📱 [CRON] Tìm thấy 120 Zalo accounts
📊 [CRON] Sẽ gửi cho 100 Zalo users
✅ [CRON] Kết quả gửi: 95/100 thành công cho kỳ "Báo cáo đầu tháng"
✅ [CRON] Hoàn thành kiểm tra và gửi thông báo
```

### 3. Verify Zalo Notification

Check Zalo app trên điện thoại → Thông báo từ OA

---

## 📊 Monitoring

### Log Levels

| Level | Mô Tả |
|-------|-------|
| `LOG` | Thông tin thường | 
| `WARN` | Cảnh báo (không có Zalo accounts, v.v.) |
| `ERROR` | Lỗi nghiêm trọng |

### Key Metrics

- **Số kỳ active:** Bao nhiêu kỳ đang được theo dõi
- **Số users:** Tổng users active
- **Số Zalo accounts:** Users đã liên kết Zalo
- **Success rate:** X/Y gửi thành công

---

## ⚙️ Configuration

### Cron Expression

Thay đổi thời gian chạy trong `thoi-gian-cap-nhat-doan-so-cron.service.ts`:

```typescript
@Cron('0 7 * * *')  // 7:00 AM mỗi ngày
```

**Cú pháp:** `[minute] [hour] [day] [month] [weekday]`

**Ví dụ:**
- `0 8 * * *` → 8:00 AM mỗi ngày
- `0 7 * * 1-5` → 7:00 AM thứ 2-6
- `0 9,17 * * *` → 9:00 AM và 5:00 PM mỗi ngày

### Timezone

```typescript
@Cron('0 7 * * *', {
  timeZone: 'Asia/Ho_Chi_Minh'  // GMT+7
})
```

---

## 🚨 Troubleshooting

### Issue 1: Không Gửi Thông Báo

**Nguyên nhân:**
- Không có kỳ nào active
- Không có user nào liên kết Zalo
- Ngày mai không phải ngày bắt đầu kỳ

**Giải pháp:**
```bash
# 1. Check logs
# 2. Test manual
GET /thoi-gian-cap-nhat-doan-so/cron/test-reminder

# 3. Debug specific period
GET /thoi-gian-cap-nhat-doan-so/debug-notification/{id}
```

### Issue 2: Gửi Trùng Lặp

**Nguyên nhân:** Có nhiều cron job đang chạy

**Giải pháp:**
- Kiểm tra chỉ có 1 instance app đang chạy
- Check PM2 process list
- Restart app

### Issue 3: Sai Timezone

**Nguyên nhân:** Server timezone khác với `Asia/Ho_Chi_Minh`

**Giải pháp:**
- Đảm bảo `timeZone` được set trong decorator
- Check server timezone: `date`
- Set environment `TZ=Asia/Ho_Chi_Minh`

---

## 📈 Performance

**Bulk Sending:**
- ✅ Gửi 1 lần cho nhiều users (bulk API)
- ❌ Không gửi từng user một (tránh spam API)

**Deduplication:**
- Dùng `Set<string>` để loại bỏ Zalo user ID trùng

**Error Handling:**
- Try-catch cho từng kỳ
- Lỗi 1 kỳ không ảnh hưởng kỳ khác
- Log chi tiết để debug

---

## 🎯 Next Steps

1. **Monitor logs** sau khi deploy để đảm bảo cron chạy đúng
2. **Test thực tế** với users thật
3. **Adjust timing** nếu cần (có thể đổi sang 6:00 hoặc 8:00)
4. **Add metrics** (optional): Track success rate, response time
5. **Setup alerts** (optional): Notify admin nếu fail rate cao

---

## ✅ Checklist Deploy

- [ ] Code đã merge vào branch chính
- [ ] Test manual API `/cron/test-reminder`
- [ ] Verify Zalo notification nhận được
- [ ] Check logs không có error
- [ ] Restart app/PM2
- [ ] Monitor logs ngày hôm sau lúc 7:00 AM
- [ ] Verify users nhận được thông báo

---

## 📞 Support

**Logs location:** Console output hoặc PM2 logs

**Contact:** Dev team nếu có vấn đề với cron job

**Emergency:** Disable cron bằng cách comment `@Cron` decorator
