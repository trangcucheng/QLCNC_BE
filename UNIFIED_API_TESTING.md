# 🧪 Unified API Testing Guide

## 🚀 **Available Unified Endpoints**

### **Authentication Test:**
```bash
# 1. Test with Web JWT Token
curl -X GET "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer YOUR_WEB_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (Web Format):
{
  "data": [...],
  "pagination": { "total": 10, "page": 1, "limit": 10 }
}

# 2. Test with Zalo JWT Token  
curl -X GET "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer YOUR_ZALO_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (Mobile Format):
{
  "success": true,
  "data": [...],
  "pagination": { "total": 10, "page": 1, "limit": 10 }
}
```

---

## 📋 **Available Unified Controllers**

### **1. Cụm Khu Công Nghiệp:**
```bash
# GET List with pagination
GET /api/v1/api/cum-khu-cong-nghiep?page=1&limit=10&search=keyword

# GET All (for dropdown)
GET /api/v1/api/cum-khu-cong-nghiep/all

# GET Details
GET /api/v1/api/cum-khu-cong-nghiep/1

# POST Create (Admin only)
POST /api/v1/api/cum-khu-cong-nghiep
{
  "tenCumKhu": "Tên cụm khu",
  "moTa": "Mô tả"
}

# PUT Update (Admin/Manager only)
PUT /api/v1/api/cum-khu-cong-nghiep/1
{
  "tenCumKhu": "Tên mới",
  "moTa": "Mô tả mới"
}

# DELETE Remove (Admin only)
DELETE /api/v1/api/cum-khu-cong-nghiep/1
```

### **2. Sự Kiện (Events):**
```bash
# GET List with filters
GET /api/v1/api/su-kien?page=1&limit=10&search=keyword&loaiSuKienId=1&trangThai=active

# GET Upcoming events
GET /api/v1/api/su-kien/upcoming

# GET Details
GET /api/v1/api/su-kien/1

# GET Download file
GET /api/v1/api/su-kien/download/filename.pdf

# POST Create with files (Admin only)
POST /api/v1/api/su-kien
Content-Type: multipart/form-data
{
  "tenSuKien": "Tên sự kiện",
  "noiDungSuKien": "Nội dung",
  "thoiGianBatDau": "2024-01-01T10:00:00.000Z",
  "thoiGianKetThuc": "2024-01-01T12:00:00.000Z",
  "diaDiem": "Địa điểm",
  "files": [file1, file2]
}

# PUT Update (Admin/Manager only)
PUT /api/v1/api/su-kien/1

# DELETE Remove (Admin only)
DELETE /api/v1/api/su-kien/1
```

### **3. Thông Báo (Notifications):**
```bash
# GET All notifications (Admin view) OR My notifications (User view)
GET /api/v1/api/thong-bao?page=1&limit=10&search=keyword

# GET My notifications explicitly
GET /api/v1/api/thong-bao/my-notifications?page=1&limit=10

# GET Unread count
GET /api/v1/api/thong-bao/unread-count

# GET Details
GET /api/v1/api/thong-bao/1

# POST Create (Admin only)
POST /api/v1/api/thong-bao
{
  "tieuDe": "Tiêu đề thông báo",
  "noiDung": "Nội dung thông báo",
  "loai": "info"
}

# PUT Update (Admin only)
PUT /api/v1/api/thong-bao/1

# PUT Mark as read
PUT /api/v1/api/thong-bao/1/mark-read

# DELETE Remove (Admin only)
DELETE /api/v1/api/thong-bao/1
```

### **4. Tổ Chức (Organizations):**
```bash
# GET List
GET /api/v1/api/organization?page=1&limit=10&search=keyword&cumKhuCnId=1

# GET Dropdown data
GET /api/v1/api/organization/dropdown

# GET Statistics
GET /api/v1/api/organization/stats

# GET Details
GET /api/v1/api/organization/1

# POST Create (Admin only)
POST /api/v1/api/organization
{
  "tenToChuc": "Tên tổ chức",
  "diaChi": "Địa chỉ",
  "soDienThoai": "0123456789",
  "email": "email@example.com"
}

# PUT Update (Admin/Manager only)
PUT /api/v1/api/organization/1

# DELETE Remove (Admin only)
DELETE /api/v1/api/organization/1
```

---

## 🔐 **Permission Testing**

### **Test Permission Scenarios:**

```bash
# 1. Test READ permission (All users should pass)
curl -X GET "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer ANY_VALID_TOKEN"
# Expected: 200 OK

# 2. Test CREATE permission (Only Admin/Manager should pass)
curl -X POST "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer ZALO_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenCumKhu": "Test"}'
# Expected: 403 Forbidden with permission error

curl -X POST "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer ADMIN_WEB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenCumKhu": "Test"}'
# Expected: 201 Created

# 3. Test DELETE permission (Only Admin should pass)
curl -X DELETE "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep/1" \
  -H "Authorization: Bearer MANAGER_TOKEN"
# Expected: 403 Forbidden

curl -X DELETE "http://localhost:3000/api/v1/api/cum-khu-cong-nghiep/1" \
  -H "Authorization: Bearer ADMIN_TOKEN"
# Expected: 200 OK
```

---

## 📊 **Response Format Testing**

### **Web User Response:**
```json
{
  "data": [
    {
      "id": 1,
      "tenCumKhu": "Cụm khu công nghiệp ABC",
      "moTa": "Mô tả chi tiết...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "organizations": [
        {
          "id": 1,
          "tenToChuc": "Công ty XYZ",
          "details": "Full nested data..."
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### **Zalo User Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tenCumKhu": "Cụm khu công nghiệp ABC",
      "moTa": "Mô tả chi tiết..."
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

---

## 🧪 **Postman Collection**

```json
{
  "info": {
    "name": "QLCD Unified API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "web_token",
      "value": "YOUR_WEB_JWT_TOKEN"
    },
    {
      "key": "zalo_token", 
      "value": "YOUR_ZALO_JWT_TOKEN"
    }
  ],
  "item": [
    {
      "name": "Cụm Khu Công Nghiệp",
      "item": [
        {
          "name": "GET List",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/cum-khu-cong-nghiep?page=1&limit=10",
              "host": ["{{base_url}}"],
              "path": ["api", "cum-khu-cong-nghiep"]
            }
          }
        },
        {
          "name": "POST Create (Admin Only)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"tenCumKhu\": \"Test Cụm Khu\",\n  \"moTa\": \"Test Description\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/cum-khu-cong-nghiep",
              "host": ["{{base_url}}"],
              "path": ["api", "cum-khu-cong-nghiep"]
            }
          }
        }
      ]
    },
    {
      "name": "Sự Kiện", 
      "item": [
        {
          "name": "GET List",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/su-kien?page=1&limit=10"
          }
        },
        {
          "name": "GET Upcoming",
          "request": {
            "method": "GET", 
            "url": "{{base_url}}/api/su-kien/upcoming"
          }
        }
      ]
    }
  ]
}
```

---

## ⚡ **Quick Test Scripts**

### **Test Authentication:**
```bash
#!/bin/bash
# test-auth.sh

BASE_URL="http://localhost:3000/api/v1"
WEB_TOKEN="your_web_jwt_token"
ZALO_TOKEN="your_zalo_jwt_token"

echo "Testing Web Token..."
curl -s -X GET "$BASE_URL/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer $WEB_TOKEN" | jq .

echo "Testing Zalo Token..."  
curl -s -X GET "$BASE_URL/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer $ZALO_TOKEN" | jq .
```

### **Test Permissions:**
```bash
#!/bin/bash
# test-permissions.sh

echo "Testing CREATE permission with Zalo token (should fail)..."
curl -s -X POST "$BASE_URL/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer $ZALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenCumKhu": "Test"}' | jq .

echo "Testing CREATE permission with Admin token (should succeed)..."
curl -s -X POST "$BASE_URL/api/cum-khu-cong-nghiep" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenCumKhu": "Test"}' | jq .
```

---

## 🎯 **Expected Test Results**

### ✅ **Success Cases:**
- All authenticated users can READ data
- Admins can CREATE/UPDATE/DELETE
- Response format adapts based on user type
- Proper pagination in all responses

### ❌ **Error Cases:**
- Unauthenticated requests return 401
- Insufficient permissions return 403 with clear error message
- Invalid endpoints return 404
- Invalid data returns 400 with validation errors

**Ready for testing! 🚀**
