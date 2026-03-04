# 📱 Zalo Mini App - Mobile APIs cho Sự Kiện

## 🚀 **API Endpoints được thêm:**

### 1. **Mobile Loại Sự Kiện APIs**
**Base URL:** `/mobile/loai-su-kien`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/list` | Danh sách loại sự kiện (có phân trang) | Zalo JWT |
| GET | `/dropdown` | Dropdown loại sự kiện | Zalo JWT |
| GET | `/:id` | Chi tiết loại sự kiện | Zalo JWT |
| POST | `/` | Tạo loại sự kiện mới | Zalo JWT |
| PUT | `/:id` | Cập nhật loại sự kiện | Zalo JWT |
| DELETE | `/:id` | Xóa loại sự kiện | Zalo JWT |

**Query Parameters (GET /list):**
- `page`: Số trang (default: 1)
- `limit`: Số bản ghi (default: 10)
- `search`: Tìm kiếm theo tên
- `trangThai`: Lọc theo trạng thái

---

### 2. **Mobile Sự Kiện APIs**
**Base URL:** `/mobile/su-kien`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/list` | Danh sách sự kiện (có phân trang & lọc) | Zalo JWT |
| GET | `/upcoming` | Sự kiện sắp diễn ra | Zalo JWT |
| GET | `/:id` | Chi tiết sự kiện | Zalo JWT |
| GET | `/download/:fileName` | Tải file đính kèm | Zalo JWT |
| POST | `/` | Tạo sự kiện (với file upload) | Zalo JWT |
| PUT | `/:id` | Cập nhật sự kiện | Zalo JWT |
| DELETE | `/:id` | Xóa sự kiện | Zalo JWT |

**Query Parameters (GET /list):**
- `page`: Số trang (default: 1)
- `limit`: Số bản ghi (default: 10)
- `search`: Tìm kiếm theo tiêu đề
- `loaiSuKienId`: Lọc theo loại sự kiện
- `trangThai`: Lọc theo trạng thái
- `tuNgay`: Lọc từ ngày (YYYY-MM-DD)
- `denNgay`: Lọc đến ngày (YYYY-MM-DD)

**File Upload Features:**
- Support multipart/form-data
- Max 10 files per request
- Max 10MB per file
- File types: documents, images, archives

---

### 3. **Mobile Thông Báo Sự Kiện APIs**
**Base URL:** `/mobile/thong-bao-su-kien`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my-notifications` | Thông báo của tôi | Zalo JWT |
| GET | `/unread-count` | Đếm thông báo chưa đọc | Zalo JWT |
| GET | `/recent` | Thông báo gần đây (5 mới nhất) | Zalo JWT |
| GET | `/:id` | Chi tiết thông báo (tự động đánh dấu đã đọc) | Zalo JWT |
| PUT | `/mark-read/:id` | Đánh dấu đã đọc | Zalo JWT |
| PUT | `/mark-all-read` | Đánh dấu tất cả đã đọc | Zalo JWT |
| POST | `/send` | Gửi thông báo (Admin only) | Zalo JWT |
| POST | `/broadcast` | Gửi broadcast tới tất cả | Zalo JWT |
| DELETE | `/:id` | Xóa thông báo (chỉ người nhận) | Zalo JWT |

---

## 🔑 **Authentication:**

**Tất cả API đều yêu cầu Zalo JWT Token:**
```
Authorization: Bearer <zalo_jwt_token>
```

**Lấy JWT token từ Zalo login:**
```javascript
// 1. Login qua Zalo
const loginResponse = await fetch('/zalo/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessToken: zaloAccessToken,
    code: authCode
  })
});

const { accessToken } = await loginResponse.json();

// 2. Sử dụng token cho mobile APIs
const eventsResponse = await fetch('/mobile/su-kien/list', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 📱 **Mobile Response Format:**

**Success Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "message": "Thành công"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Lỗi mô tả",
  "statusCode": 400
}
```

---

## 🚀 **Tính năng đặc biệt cho Mobile:**

### **1. Sự Kiện:**
- **Upcoming Events**: Lấy sự kiện sắp tới trong N ngày
- **File Download**: Tải file đính kèm với URL trực tiếp
- **File Upload**: Upload multiple files với validation
- **Optimized Response**: Chỉ trả về fields cần thiết cho mobile

### **2. Thông Báo:**
- **Auto Mark Read**: Tự động đánh dấu đã đọc khi xem chi tiết
- **Unread Count**: Đếm thông báo chưa đọc cho badge
- **Recent Notifications**: Top 5 thông báo gần đây
- **User Context**: Chỉ lấy thông báo của user hiện tại

### **3. Performance Optimization:**
- **Pagination**: Tất cả danh sách đều có phân trang
- **Selective Fields**: Chỉ trả về fields cần thiết
- **Mobile-First Design**: Response format tối ưu cho mobile app

---

## 🔧 **Cách Test APIs:**

**1. Lấy Zalo JWT token:**
```bash
curl -X POST http://localhost:3000/zalo/login \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_zalo_access_token",
    "code": "your_auth_code"
  }'
```

**2. Test Mobile APIs:**
```bash
# Lấy danh sách sự kiện
curl -X GET "http://localhost:3000/mobile/su-kien/list?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy thông báo của tôi
curl -X GET "http://localhost:3000/mobile/thong-bao-su-kien/my-notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Đếm thông báo chưa đọc
curl -X GET "http://localhost:3000/mobile/thong-bao-su-kien/unread-count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 **Next Steps:**

1. **Run Migration**: `npm run migration:run`
2. **Test Authentication**: Đảm bảo Zalo login hoạt động
3. **Test Mobile APIs**: Kiểm tra tất cả endpoint
4. **Frontend Integration**: Tích hợp vào Zalo Mini App
5. **Push Notifications**: Thêm tính năng push notification (optional)

**Files đã tạo:**
- `mobile-loai-su-kien.controller.ts`
- `mobile-su-kien.controller.ts`  
- `mobile-nguoi-nhan-su-kien.controller.ts`

**Modules đã cập nhật:**
- `loai-su-kien.module.ts`
- `su-kien.module.ts`
- `nguoi-nhan-su-kien.module.ts`
