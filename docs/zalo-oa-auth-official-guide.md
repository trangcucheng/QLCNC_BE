# Zalo Official Account Authentication - Implementation Guide

## 📋 Tài liệu tham khảo chính thức
**URL**: https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new

## 🔐 OA Access Token - Client Credentials Flow

### API Endpoint
```
POST https://oauth.zaloapp.com/v4/oa/access_token
```

### Request Format (Theo tài liệu chính thức)
```bash
curl -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'secret_key: <your_app_secret>' \
  --data-urlencode 'app_id=<your_app_id>' \
  --data-urlencode 'grant_type=client_credentials' \
  'https://oauth.zaloapp.com/v4/oa/access_token'
```

### Key Points từ tài liệu Zalo:
1. **Content-Type**: `application/x-www-form-urlencoded` (KHÔNG phải JSON)
2. **Secret Key**: Đưa vào `header` với tên `secret_key`
3. **Grant Type**: `client_credentials` cho OA token
4. **App ID**: ID của ứng dụng (có thể là Mini App ID)

### Request Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `app_id` | string | Yes | ID của ứng dụng Zalo |
| `grant_type` | string | Yes | `client_credentials` |

### Request Headers
| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| `Content-Type` | `application/x-www-form-urlencoded` | Yes | Format dữ liệu |
| `secret_key` | `<your_app_secret>` | Yes | Secret key của app |

### Response Success
```json
{
  "access_token": "oa_access_token_here",
  "refresh_token": "oa_refresh_token_here", 
  "expires_in": 7200,
  "error": 0
}
```

### Response Error
```json
{
  "error": -14002,
  "error_description": "Invalid appId",
  "message": "Invalid appId"
}
```

## 🔄 Refresh Token Flow

### API Endpoint
```
POST https://oauth.zaloapp.com/v4/oa/access_token
```

### Request Format
```bash
curl -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'secret_key: <your_app_secret>' \
  --data-urlencode 'app_id=<your_app_id>' \
  --data-urlencode 'grant_type=refresh_token' \
  --data-urlencode 'refresh_token=<your_refresh_token>' \
  'https://oauth.zaloapp.com/v4/oa/access_token'
```

### Parameters cho Refresh
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `app_id` | string | Yes | ID của ứng dụng |
| `grant_type` | string | Yes | `refresh_token` |
| `refresh_token` | string | Yes | Refresh token từ response trước |

## 🛠️ NestJS Implementation

### Service Method (Updated)
```typescript
async getOAAccessToken(): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}> {
  try {
    const appId = this.configService.get<string>('ZALO_APP_ID');
    const appSecret = this.configService.get<string>('ZALO_APP_SECRET');

    // Tạo form data theo chuẩn x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('app_id', appId);
    formData.append('grant_type', 'client_credentials');

    // Gọi API theo tài liệu chính thức
    const response = await axios.post(
      'https://oauth.zaloapp.com/v4/oa/access_token', 
      formData, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': appSecret  // Secret trong header
        }
      }
    );

    if (response.data.error !== 0) {
      return {
        success: false,
        error: response.data.error_description || response.data.message
      };
    }

    return {
      success: true,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };

  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error_description || error.message
    };
  }
}
```

### Environment Variables
```bash
# .env
ZALO_APP_ID=your_app_id_here
ZALO_APP_SECRET=your_app_secret_here
```

## ⚠️ Common Issues

### 1. Invalid App ID (-14002)
- **Nguyên nhân**: App ID không tồn tại hoặc không active
- **Giải pháp**: Kiểm tra App ID trong Zalo Developer Console

### 2. Invalid Secret Key
- **Nguyên nhân**: Secret key sai hoặc không khớp với App ID
- **Giải pháp**: Verify secret key trong Developer Console

### 3. Content-Type Issues
- **Nguyên nhân**: Sử dụng `application/json` thay vì `application/x-www-form-urlencoded`
- **Giải pháp**: Đảm bảo dùng đúng Content-Type và URLSearchParams

## 🧪 Testing Commands

### Test với cURL
```bash
curl -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'secret_key: YOUR_SECRET_HERE' \
  --data-urlencode 'app_id=YOUR_APP_ID_HERE' \
  --data-urlencode 'grant_type=client_credentials' \
  'https://oauth.zaloapp.com/v4/oa/access_token'
```

### Test với Postman
1. **Method**: POST
2. **URL**: `https://oauth.zaloapp.com/v4/oa/access_token`
3. **Headers**:
   - `Content-Type: application/x-www-form-urlencoded`
   - `secret_key: YOUR_SECRET`
4. **Body** (x-www-form-urlencoded):
   - `app_id: YOUR_APP_ID`
   - `grant_type: client_credentials`

## 📊 Token Lifecycle

1. **Request OA Token** → Access Token (2h) + Refresh Token (30 ngày)
2. **Token gần hết hạn** → Dùng Refresh Token để lấy token mới
3. **Refresh Token hết hạn** → Phải request OA Token từ đầu

## 🔗 Related Documentation
- **Zalo OA API**: https://developers.zalo.me/docs/official-account
- **Mini App Integration**: https://developers.zalo.me/docs/mini-app
- **Authentication Flow**: https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new

## ✅ Implementation Checklist
- [ ] Sử dụng `application/x-www-form-urlencoded` Content-Type
- [ ] Đưa `secret_key` vào header, không phải body
- [ ] Dùng `URLSearchParams` cho form data
- [ ] Handle cả success và error cases
- [ ] Implement refresh token logic
- [ ] Add proper logging và error handling
- [ ] Test với credentials thực tế
