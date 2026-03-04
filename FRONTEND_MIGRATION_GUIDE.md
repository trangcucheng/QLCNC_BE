# 🚀 Frontend Migration Guide - Unified API System

## 📋 **Tổng quan thay đổi:**

### **TRƯỚC (Old System):**
```javascript
// ❌ 2 bộ API riêng biệt
// Web APIs
axios.get('/api/v1/su-kien')
axios.get('/api/v1/thong-bao')  
axios.get('/api/v1/cum-khu-cong-nghiep')

// Zalo/Mobile APIs  
axios.get('/api/v1/mobile/su-kien/list')
axios.get('/api/v1/zalo/thong-bao')
axios.get('/api/v1/mobile/organization/list')
```

### **SAU (Unified System):**
```javascript
// ✅ 1 bộ API thống nhất
// Cùng 1 endpoint cho cả web + mobile
axios.get('/api/v1/api/su-kien')
axios.get('/api/v1/api/thong-bao')
axios.get('/api/v1/api/cum-khu-cong-nghiep')
axios.get('/api/v1/api/organization')
```

---

## 🔐 **1. Authentication Changes**

### **Token Usage - KHÔNG THAY ĐỔI:**
```javascript
// Web users vẫn dùng web JWT
const webToken = localStorage.getItem('webToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${webToken}`;

// Zalo users vẫn dùng Zalo JWT  
const zaloToken = localStorage.getItem('zaloToken');
axios.defaults.headers.common['Authorization'] = `Bearer ${zaloToken}`;
```

### **Response Adaptation - TỰ ĐỘNG:**
```javascript
// Web users nhận full response
{
  "data": [...],
  "pagination": { total: 100, page: 1, limit: 10 },
  "metadata": { ... }
}

// Zalo users nhận simplified response
{
  "success": true,
  "data": [...], // Simplified fields
  "pagination": { total: 100, page: 1, limit: 10 }
}
```

---

## 📱 **2. API Endpoint Mapping**

### **Sự Kiện (Events):**
| Old Endpoint | New Unified Endpoint | Notes |
|-------------|---------------------|-------|
| `GET /su-kien` | `GET /api/su-kien` | Web format |
| `GET /mobile/su-kien/list` | `GET /api/su-kien` | Mobile format |
| `GET /mobile/su-kien/upcoming` | `GET /api/su-kien/upcoming` | New endpoint |
| `POST /su-kien` | `POST /api/su-kien` | Admin only |
| `PUT /su-kien/:id` | `PUT /api/su-kien/:id` | Admin only |
| `DELETE /su-kien/:id` | `DELETE /api/su-kien/:id` | Admin only |

### **Thông Báo (Notifications):**
| Old Endpoint | New Unified Endpoint | Notes |
|-------------|---------------------|-------|
| `GET /thong-bao` | `GET /api/thong-bao` | Admin view all |
| `GET /zalo/thong-bao/my-notifications` | `GET /api/thong-bao/my-notifications` | User view own |
| `GET /mobile/thong-bao-su-kien/unread-count` | `GET /api/thong-bao/unread-count` | Unread count |
| `POST /thong-bao` | `POST /api/thong-bao` | Admin only |
| `PUT /thong-bao/:id/mark-read` | `PUT /api/thong-bao/:id/mark-read` | Mark as read |

### **Tổ Chức (Organizations):**
| Old Endpoint | New Unified Endpoint | Notes |
|-------------|---------------------|-------|
| `GET /organization` | `GET /api/organization` | Full list |
| `GET /mobile/organization/list` | `GET /api/organization` | Same endpoint |
| `GET /mobile/organization/dropdown` | `GET /api/organization/dropdown` | Dropdown data |
| `GET /organization/stats` | `GET /api/organization/stats` | Statistics |

### **Cụm Khu Công Nghiệp:**
| Old Endpoint | New Unified Endpoint | Notes |
|-------------|---------------------|-------|
| `GET /cum-khu-cong-nghiep` | `GET /api/cum-khu-cong-nghiep` | Paginated list |
| `GET /cum-khu-cong-nghiep/all` | `GET /api/cum-khu-cong-nghiep/all` | All for dropdown |

---

## ⚡ **3. Migration Steps cho FE**

### **Step 1: Update API Base URLs**
```javascript
// config/api.js
const API_CONFIG = {
  // OLD
  WEB_BASE_URL: '/api/v1',
  MOBILE_BASE_URL: '/api/v1/mobile',  
  ZALO_BASE_URL: '/api/v1/zalo',
  
  // NEW - Unified
  UNIFIED_BASE_URL: '/api/v1/api'
};

// services/apiService.js  
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.UNIFIED_BASE_URL; // ✅ Single base URL
  }
  
  // Generic method cho tất cả endpoints
  async get(endpoint, params = {}) {
    return axios.get(`${this.baseURL}${endpoint}`, { params });
  }
  
  async post(endpoint, data) {
    return axios.post(`${this.baseURL}${endpoint}`, data);
  }
}
```

### **Step 2: Update Service Classes**
```javascript
// services/suKienService.js
class SuKienService {
  async getList(params = {}) {
    // OLD: Different endpoints for web vs mobile
    // const endpoint = this.isMobile ? '/mobile/su-kien/list' : '/su-kien';
    
    // NEW: Same endpoint for all
    return ApiService.get('/su-kien', params);
  }
  
  async getUpcoming() {
    // NEW: Available for both web and mobile
    return ApiService.get('/su-kien/upcoming');
  }
  
  async create(data, files) {
    // Only admins can create - handled by permissions
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    files.forEach(file => formData.append('files', file));
    
    return ApiService.post('/su-kien', formData);
  }
}

// services/thongBaoService.js  
class ThongBaoService {
  async getMyNotifications(params = {}) {
    // Unified endpoint for user notifications
    return ApiService.get('/thong-bao/my-notifications', params);
  }
  
  async getUnreadCount() {
    return ApiService.get('/thong-bao/unread-count');
  }
  
  async markAsRead(id) {
    return ApiService.put(`/thong-bao/${id}/mark-read`);
  }
}
```

### **Step 3: Update Response Handling**
```javascript
// utils/responseHandler.js
class ResponseHandler {
  static normalize(response) {
    // Handle both old and new response formats
    if (response.success !== undefined) {
      // New mobile format
      return {
        data: response.data,
        pagination: response.pagination,
        success: response.success
      };
    } else {
      // Web format  
      return response;
    }
  }
}

// components/EventList.vue
export default {
  async fetchEvents() {
    try {
      const response = await SuKienService.getList(this.queryParams);
      const normalized = ResponseHandler.normalize(response.data);
      
      this.events = normalized.data;
      this.pagination = normalized.pagination;
    } catch (error) {
      this.handleError(error);
    }
  }
}
```

---

## 🔒 **4. Permission-Based UI**

### **Frontend Permission Check:**
```javascript
// utils/permissions.js
class PermissionChecker {
  static canCreate(userType, userRole) {
    if (userType === 'WEB') {
      return ['ADMIN', 'MANAGER'].includes(userRole);
    }
    // Zalo users cannot create by default
    return false;
  }
  
  static canDelete(userType, userRole) {
    return userType === 'WEB' && userRole === 'ADMIN';
  }
}

// components/EventManagement.vue
<template>
  <div>
    <!-- Show create button only if user has permission -->
    <button 
      v-if="canCreate" 
      @click="createEvent"
      class="btn btn-primary">
      Tạo sự kiện
    </button>
    
    <!-- Show delete button only for admins -->
    <button 
      v-if="canDelete" 
      @click="deleteEvent(event.id)"
      class="btn btn-danger">
      Xóa
    </button>
  </div>
</template>

<script>
export default {
  computed: {
    canCreate() {
      return PermissionChecker.canCreate(this.$store.state.auth.userType, this.$store.state.auth.userRole);
    },
    canDelete() {
      return PermissionChecker.canDelete(this.$store.state.auth.userType, this.$store.state.auth.userRole);
    }
  }
}
</script>
```

---

## 📋 **5. Error Handling Updates**

```javascript
// utils/errorHandler.js
class ErrorHandler {
  static handle(error) {
    if (error.response?.status === 403) {
      // New unified permission error
      const message = error.response.data.message || 'Không có quyền thực hiện thao tác này';
      
      if (message.includes('Insufficient permissions')) {
        this.showPermissionError(message);
      } else {
        this.showGenericError(message);
      }
    }
  }
  
  static showPermissionError(message) {
    // Extract required vs available permissions from error message
    const matches = message.match(/Required: (.*?), Available: (.*)/);
    if (matches) {
      const required = matches[1].split(', ');
      const available = matches[2].split(', '); 
      
      Toast.error(`Cần quyền: ${required.join(', ')}. Bạn có: ${available.join(', ')}`);
    }
  }
}
```

---

## ⏰ **6. Migration Timeline**

### **Phase 1: Parallel Support (1 tuần)**
- ✅ Deploy unified endpoints
- ✅ Keep old endpoints for backward compatibility
- ✅ Update FE gradually

### **Phase 2: Frontend Migration (1-2 tuần)**
- 🔄 Update API services to use unified endpoints
- 🔄 Test thoroughly on both web and mobile
- 🔄 Update error handling

### **Phase 3: Cleanup (1 tuần)**
- 🗑️ Remove old endpoint usage
- 🗑️ Remove old API service methods
- 🗑️ Update documentation

---

## 🧪 **7. Testing Checklist**

### **Web Application:**
- [ ] Login với web token hoạt động
- [ ] CRUD operations với proper permissions
- [ ] Full detailed responses
- [ ] Admin-only features accessible

### **Zalo Mini App:**
- [ ] Login với Zalo token hoạt động  
- [ ] Read operations working
- [ ] Simplified mobile responses
- [ ] Permission restrictions enforced
- [ ] Error messages user-friendly

### **Cross-platform:**
- [ ] Same data consistency across platforms
- [ ] Permission enforcement working correctly
- [ ] Response format adaptation working

---

## 📞 **8. Support & Rollback**

### **If Issues Occur:**
```javascript
// Quick rollback to old endpoints
const API_CONFIG = {
  USE_UNIFIED: false, // Switch to false for rollback
  UNIFIED_BASE_URL: '/api/v1/api',
  LEGACY_WEB_URL: '/api/v1',
  LEGACY_MOBILE_URL: '/api/v1/mobile',
  LEGACY_ZALO_URL: '/api/v1/zalo'
};

// Conditional endpoint selection
function getEndpoint(endpoint, userType) {
  if (API_CONFIG.USE_UNIFIED) {
    return `${API_CONFIG.UNIFIED_BASE_URL}${endpoint}`;
  }
  
  // Fallback to legacy endpoints
  if (userType === 'ZALO') {
    return `${API_CONFIG.LEGACY_ZALO_URL}${endpoint}`;
  }
  return `${API_CONFIG.LEGACY_WEB_URL}${endpoint}`;
}
```

---

## ✅ **Summary Benefits cho FE:**

1. **🎯 Single API to maintain** - không cần track 2 bộ endpoints
2. **🔄 Automatic response adaptation** - backend tự format theo user type  
3. **🛡️ Built-in permission system** - FE chỉ cần check role để show/hide UI
4. **📱 Mobile-optimized responses** - simplified data cho mobile performance
5. **🔧 Easy maintenance** - 1 service class thay vì 2-3 classes

**Ready to implement! 🚀**
