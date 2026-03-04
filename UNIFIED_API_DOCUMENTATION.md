# 🚀 UNIFIED API DOCUMENTATION
## Complete REST API for Web & Mobile Integration

---

## 📋 **OVERVIEW**

Hệ thống Unified API cung cấp **single endpoints** phục vụ cả **Web Users** và **Mobile (Zalo) Users** với:
- **Unified Authentication**: Một hệ thống xác thực cho cả JWT_SECRET_KEY và ZALO_JWT_SECRET
- **Permission-Based Access**: Granular access control với decorators
- **Adaptive Response**: Format phản hồi tự động theo platform (web chi tiết, mobile đơn giản)
- **Backward Compatibility**: Giữ nguyên các controllers cũ để tương thích

---

## 🔐 **AUTHENTICATION**

### **Headers Required:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### **Token Types:**
- **Web Users**: JWT signed với `JWT_SECRET_KEY`
- **Zalo Users**: JWT signed với `ZALO_JWT_SECRET`

### **Permission Levels:**
- `@CanRead()` - Quyền đọc cơ bản
- `@CanCreate()` - Quyền tạo mới  
- `@CanUpdate()` - Quyền cập nhật
- `@CanDelete()` - Quyền xóa
- `@RequirePermissions('SPECIFIC_PERMISSION')` - Quyền đặc biệt

---

## 🏢 **1. ORGANIZATION MANAGEMENT**
**Base URL:** `/api/organization`

### **GET /api/organization**
- **Description:** Lấy danh sách tổ chức
- **Permissions:** `@CanRead()`
- **Query Params:** page, limit, search, parentId, isActive
- **Web Response:** Full organization details với children, users, roles
- **Mobile Response:** Simplified organization với chỉ id, tenToChuc, isActive

### **GET /api/organization/hierarchy**
- **Description:** Lấy cây tổ chức phân cấp
- **Permissions:** `@CanRead()`
- **Web Response:** Complete hierarchy tree với full details
- **Mobile Response:** Minimal hierarchy với basic info

### **GET /api/organization/my-organization**
- **Description:** Lấy thông tin tổ chức của user hiện tại
- **Permissions:** `@CanRead()`

### **POST /api/organization**
- **Description:** Tạo tổ chức mới
- **Permissions:** `@RequirePermissions('MANAGE_ORGANIZATIONS')`
- **Body:** CreateOrganizationDto

### **PUT /api/organization/:id**
- **Description:** Cập nhật tổ chức
- **Permissions:** `@RequirePermissions('MANAGE_ORGANIZATIONS')`
- **Body:** UpdateOrganizationDto

---

## 🏭 **2. CUM KHU CONG NGHIEP MANAGEMENT** 
**Base URL:** `/api/cum-khu-cong-nghiep`

### **GET /api/cum-khu-cong-nghiep**
- **Description:** Danh sách cum khu công nghiệp theo phân quyền
- **Permissions:** `@CanRead()`
- **Query Params:** page, limit, search, trangThai
- **Auto Filter:** Non-admin users chỉ thấy của organization mình

### **GET /api/cum-khu-cong-nghiep/stats**
- **Description:** Thống kê cum khu theo phạm vi quyền hạn
- **Permissions:** `@CanRead()`

### **POST /api/cum-khu-cong-nghiep**
- **Description:** Tạo cum khu mới
- **Permissions:** `@CanCreate()`
- **Auto Assignment:** Tự động gán organizationId của user

---

## 🌏 **3. XA PHUONG MANAGEMENT**
**Base URL:** `/api/xa-phuong`

### **GET /api/xa-phuong**
- **Description:** Danh sách xã phường theo quyền hạn
- **Permissions:** `@CanRead()`
- **Query Params:** page, limit, search, cumKhuId
- **Mobile Response:** Chỉ id, tenXaPhuong, cumKhu basic info

### **GET /api/xa-phuong/by-cum-khu/:cumKhuId**
- **Description:** Lấy xã phường theo cum khu cụ thể
- **Permissions:** `@CanRead()`

---

## 🎉 **4. EVENT MANAGEMENT**
**Base URL:** `/api/su-kien`

### **GET /api/su-kien**
- **Description:** Danh sách sự kiện theo phân quyền
- **Permissions:** `@CanRead()`
- **Query Params:** page, limit, search, loaiSuKienId, trangThai, fromDate, toDate
- **Auto Filter:** Users chỉ thấy sự kiện của organization/area mình

### **GET /api/su-kien/my-events**
- **Description:** Sự kiện user đã đăng ký tham gia
- **Permissions:** `@CanRead()`
- **Mobile Response:** Essential event info với trạng thái phản hồi

### **GET /api/su-kien/upcoming**
- **Description:** Sự kiện sắp diễn ra
- **Permissions:** `@CanRead()`

### **POST /api/su-kien**
- **Description:** Tạo sự kiện mới
- **Permissions:** `@CanCreate()`
- **Body:** CreateSuKienDto với file upload support

### **PUT /api/su-kien/:id/approve**
- **Description:** Phê duyệt sự kiện
- **Permissions:** `@RequirePermissions('APPROVE_EVENTS')`

---

## 📂 **5. EVENT CATEGORIES**
**Base URL:** `/api/loai-su-kien`

### **GET /api/loai-su-kien**
- **Description:** Danh sách loại sự kiện
- **Permissions:** `@CanRead()`
- **Mobile Response:** Simplified với chỉ id, tenLoai, icon

### **POST /api/loai-su-kien**
- **Description:** Tạo loại sự kiện mới
- **Permissions:** `@RequirePermissions('MANAGE_EVENT_CATEGORIES')`

---

## 👥 **6. EVENT RECIPIENTS**
**Base URL:** `/api/nguoi-nhan-su-kien`

### **GET /api/nguoi-nhan-su-kien/my-events**
- **Description:** Sự kiện được nhận của user hiện tại
- **Permissions:** `@CanRead()`
- **Query Params:** page, limit, trangThai

### **POST /api/nguoi-nhan-su-kien**
- **Description:** Đăng ký tham gia sự kiện
- **Permissions:** `@CanCreate()`
- **Auto Assignment:** Tự động gán userId/zaloUserId của user hiện tại

### **PUT /api/nguoi-nhan-su-kien/:id/response**
- **Description:** Phản hồi tham gia sự kiện (đồng ý/từ chối)
- **Permissions:** `@CanUpdate()`
- **Body:** { trangThai, ghiChu? }

### **POST /api/nguoi-nhan-su-kien/bulk-add**
- **Description:** Thêm nhiều người nhận sự kiện
- **Permissions:** `@RequirePermissions('MANAGE_EVENTS')`

---

## 🔔 **7. NOTIFICATIONS**
**Base URL:** `/api/thong-bao`

### **GET /api/thong-bao**
- **Description:** Danh sách thông báo theo user
- **Permissions:** `@CanRead()`
- **Query Params:** page, limit, isRead, loaiThongBao
- **Auto Filter:** Users chỉ thấy thông báo của mình

### **GET /api/thong-bao/unread-count**
- **Description:** Số lượng thông báo chưa đọc
- **Permissions:** `@CanRead()`

### **PUT /api/thong-bao/:id/mark-read**
- **Description:** Đánh dấu đã đọc thông báo
- **Permissions:** `@CanUpdate()`

### **POST /api/thong-bao/mark-all-read**
- **Description:** Đánh dấu tất cả đã đọc
- **Permissions:** `@CanUpdate()`

---

## 📊 **8. REPORTS**
**Base URL:** `/api/bao-cao`

### **GET /api/bao-cao/doan-so-theo-ky**
- **Description:** Báo cáo đoàn số theo kỳ
- **Permissions:** `@CanRead()`
- **Query Params:** nam, ky, organizationId?
- **Access Control:** Admin xem tất cả, users xem theo organization

### **GET /api/bao-cao/su-kien-stats**
- **Description:** Thống kê sự kiện theo thời gian
- **Permissions:** `@CanRead()`
- **Query Params:** fromDate, toDate, organizationId?

### **GET /api/bao-cao/user-activity**
- **Description:** Báo cáo hoạt động user
- **Permissions:** `@RequirePermissions('VIEW_REPORTS')`

### **POST /api/bao-cao/export**
- **Description:** Export báo cáo ra file Excel/PDF
- **Permissions:** `@RequirePermissions('EXPORT_REPORTS')`

---

## 👤 **9. USER MANAGEMENT**
**Base URL:** `/api/user`

### **GET /api/user/profile**
- **Description:** Profile user hiện tại
- **Permissions:** `@CanRead()`
- **Web Response:** Full user details với organization, role, permissions
- **Mobile Response:** Basic profile với avatar, name, organization

### **PUT /api/user/profile**
- **Description:** Cập nhật profile
- **Permissions:** `@CanUpdate()`
- **Auto Handling:** Web users update User entity, Zalo users update ZaloUser

### **PUT /api/user/change-password**
- **Description:** Đổi mật khẩu (chỉ web users)
- **Permissions:** `@CanUpdate()`
- **Zalo Restriction:** Zalo users không thể đổi mật khẩu

### **GET /api/user/my-organization**
- **Description:** Thông tin tổ chức của user
- **Permissions:** `@CanRead()`

### **GET /api/user/stats**
- **Description:** Thống kê user
- **Permissions:** `@CanRead()`
- **Access Control:** Admin xem all, user xem personal stats

### **GET /api/user** (Admin only)
- **Description:** Danh sách users
- **Permissions:** `@RequirePermissions('MANAGE_USERS')`

---

## 🛡️ **10. ROLE MANAGEMENT**
**Base URL:** `/api/role`

### **GET /api/role/my-role**
- **Description:** Role và permissions của user hiện tại
- **Permissions:** `@CanRead()`

### **GET /api/role/permissions**
- **Description:** Danh sách tất cả permissions có thể gán
- **Permissions:** `@CanRead()`

### **GET /api/role** (Admin only)
- **Description:** Danh sách roles
- **Permissions:** `@RequirePermissions('MANAGE_ROLES')`

### **POST /api/role** (Admin only)
- **Description:** Tạo role mới
- **Permissions:** `@RequirePermissions('MANAGE_ROLES')`

### **PUT /api/role/:id/permissions** (Admin only)
- **Description:** Cập nhật permissions cho role
- **Permissions:** `@RequirePermissions('MANAGE_ROLES')`

---

## 📱 **RESPONSE FORMAT DIFFERENCES**

### **Web Users Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenToChuc": "Công đoàn ABC",
    "maToChuc": "CD001",
    "diaChi": "123 Đường ABC",
    "soDienThoai": "0123456789",
    "email": "contact@abc.com",
    "nguoiDaiDien": "Nguyễn Văn A",
    "chucVuNguoiDaiDien": "Chủ tịch",
    "ngayThanhLap": "2020-01-01",
    "moTa": "Mô tả chi tiết...",
    "parentId": null,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z",
    "children": [...],
    "users": [...],
    "roles": [...]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### **Mobile Users Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tenToChuc": "Công đoàn ABC",
    "nguoiDaiDien": "Nguyễn Văn A",
    "soDienThoai": "0123456789",
    "isActive": true,
    "childrenCount": 5
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## 🔧 **ERROR HANDLING**

### **Standard Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "timestamp": "2023-01-01T00:00:00Z",
  "path": "/api/endpoint"
}
```

### **Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 🚀 **INTEGRATION EXAMPLES**

### **Frontend Web Integration:**
```javascript
// Fetch organizations
const response = await fetch('/api/organization', {
  headers: {
    'Authorization': `Bearer ${webUserToken}`,
    'Content-Type': 'application/json'
  }
});
const { data, pagination } = await response.json();
```

### **Mobile/Zalo Integration:**
```javascript
// Same endpoint, different token and simplified response
const response = await fetch('/api/organization', {
  headers: {
    'Authorization': `Bearer ${zaloUserToken}`,
    'Content-Type': 'application/json'
  }
});
const { data } = await response.json(); // Simplified mobile format
```

---

## 📈 **PERFORMANCE CONSIDERATIONS**

- **Pagination:** Tất cả list endpoints hỗ trợ pagination với `page` & `limit`
- **Filtering:** Query params để giảm data load
- **Mobile Optimization:** Simplified responses cho mobile để giảm bandwidth
- **Caching:** Consider client-side caching cho reference data (roles, categories)

---

## 🔐 **SECURITY NOTES**

- **Organization Isolation:** Non-admin users chỉ access data trong organization của mình
- **Permission Validation:** Tất cả endpoints đều check permissions trước khi xử lý
- **Token Validation:** Automatic validation cho cả web và Zalo tokens
- **Data Sanitization:** Input validation với class-validator DTOs

---

## 🆕 **MIGRATION FROM OLD APIS**

Các endpoint cũ vẫn hoạt động để backward compatibility:
- `/web/*` - Web controllers cũ
- `/mobile/*` - Mobile controllers cũ 
- `/zalo/*` - Zalo-specific controllers

**Recommended:** Migrate dần sang unified endpoints `/api/*` để có single integration point.

---

**🎯 Total Unified Endpoints: 50+ endpoints covering complete QLCD functionality**
**🔗 Single Authentication System for Web + Mobile**
**📱 Optimized Responses for both platforms**
**🛡️ Granular Permission Control**
**⚡ Production Ready with Error Handling**
