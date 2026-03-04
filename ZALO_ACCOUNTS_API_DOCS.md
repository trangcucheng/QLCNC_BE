### **🚀 Zalo Accounts Management API**

Dưới đây là các API endpoints đã được triển khai để quản lý Zalo Accounts với đầy đủ tính năng phân trang, tìm kiếm và lọc:

## **📋 API Endpoints**

### 1. **GET /api/v1/zalo-accounts** - Lấy danh sách với phân trang
```http
GET /api/v1/zalo-accounts?page=1&limit=10&search=john&isLinked=true&sortBy=createdAt&sortOrder=DESC
```

**Query Parameters:**
- `page`: Số trang (default: 1)  
- `limit`: Số items per page (default: 10)
- `search`: Tìm kiếm theo tên, SĐT, tên web user
- `isLinked`: Lọc theo trạng thái liên kết (true/false)
- `isFollowingOa`: Lọc theo follow OA (true/false)  
- `isActive`: Lọc theo trạng thái active (true/false)
- `sortBy`: Sắp xếp theo field (createdAt|displayName|lastActiveAt)
- `sortOrder`: Thứ tự sắp xếp (ASC|DESC)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "userId": "user-123",
      "zaloOaUserId": "oa_user_123",
      "zaloAppUserId": "app_user_123", 
      "zaloMiniAppId": "mini_app_123",
      "displayName": "John Doe",
      "avatar": "https://...",
      "phone": "0123456789",
      "isFollowingOa": true,
      "isActive": true,
      "lastFollowAt": "2024-01-15T10:30:00Z",
      "lastActiveAt": "2024-01-15T14:20:00Z",
      "lastLoginAt": "2024-01-15T14:20:00Z", 
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-01-15T14:20:00Z",
      "webUser": {
        "id": "user-123",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "0123456789",
        "avatar": "https://...",
        "roleId": 2,
        "organizationId": "org-456",
        "isActive": true
      },
      "isLinkedToWeb": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "totalAccounts": 25,
    "linkedAccounts": 18,
    "unlinkedAccounts": 7,
    "followingOa": 20,
    "activeAccounts": 23
  }
}
```

### 2. **GET /api/v1/zalo-accounts/unlinked** - Lấy accounts chưa liên kết
```http
GET /api/v1/zalo-accounts/unlinked
```

### 3. **GET /api/v1/zalo-accounts/overview** - Thống kê tổng quan
```http  
GET /api/v1/zalo-accounts/overview
```

### 4. **GET /api/v1/zalo-accounts/:id** - Lấy chi tiết account
```http
GET /api/v1/zalo-accounts/123
```

### 5. **POST /api/v1/zalo-accounts/link** - Liên kết account với user
```http
POST /api/v1/zalo-accounts/link
Content-Type: application/json

{
  "userId": "user-123",
  "zaloAccountId": 456
}
```

### 6. **DELETE /api/v1/zalo-accounts/:id/unlink** - Hủy liên kết
```http
DELETE /api/v1/zalo-accounts/123/unlink
```

### 7. **POST /api/v1/zalo-accounts/create-user** - Tạo user từ Zalo account
```http
POST /api/v1/zalo-accounts/create-user
Content-Type: application/json

{
  "zaloAccountId": 123,
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "roleId": 2,
  "organizationId": "org-456"
}
```

## **🔑 Authentication**
Tất cả endpoints yêu cầu JWT token trong header:
```http
Authorization: Bearer your-jwt-token-here
```

## **✅ Features Đã Triển Khai**

1. **✅ Phân trang** - `page` và `limit` parameters
2. **✅ Tìm kiếm** - Tìm theo `displayName`, `phone`, `fullName` của web user
3. **✅ Lọc nâng cao** - Theo trạng thái liên kết, follow OA, active status
4. **✅ Sắp xếp** - Theo multiple fields với ASC/DESC
5. **✅ Thống kê tổng quan** - Summary statistics trong response
6. **✅ Quản lý liên kết** - Link/unlink Zalo accounts với web users  
7. **✅ Tạo user từ Zalo** - Tạo web user mới từ Zalo account info
8. **✅ Validation** - Input validation với class-validator
9. **✅ Documentation** - Swagger API documentation
10. **✅ Error Handling** - Comprehensive error responses

## **🧪 Cách Test API**

Để test các API này, bạn có thể:

1. **Start server**: `npm run start:dev`
2. **Login để lấy JWT token**: POST `/api/v1/auth/login`
3. **Test endpoints**: Sử dụng Postman hoặc curl với token

Ví dụ test với curl:
```bash
# Lấy danh sách với tìm kiếm
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/zalo-accounts?page=1&limit=5&search=john&isLinked=true"

# Lấy thống kê
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/zalo-accounts/overview"
```

## **🔗 Integration với Frontend**

API này đã sẵn sàng cho frontend integration với:
- React/Angular/Vue.js admin dashboard
- Zalo Mini App management interface
- User management panel

Tất cả response đều theo chuẩn REST API với error handling và pagination metadata để frontend dễ dàng xử lý.
