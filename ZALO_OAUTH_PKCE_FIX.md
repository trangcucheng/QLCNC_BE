# Zalo OAuth PKCE Integration Guide

## ✅ Fix Đã Thực Hiện

### 1. **Single Instance Mode**
- Chuyển từ cluster mode sang single instance
- File: `ecosystem.config.js`
- Lý do: PKCE state lưu trong memory, cluster mode gây mất state giữa các process

### 2. **Remove Mock Code Verifier**
- Reject ngay nếu không tìm thấy state
- File: `src/HeThong/auth/zalo.service.ts`
- Đảm bảo PKCE security đúng chuẩn

### 3. **Complete OAuth Flow**
- Generate state, code_verifier, code_challenge đúng
- One-time use: xóa state sau khi dùng
- Proper error handling

## 🚀 Deploy Steps

### Trên Local:
```bash
git add .
git commit -m "fix: implement proper PKCE OAuth flow for Zalo OA"
git push origin cdhy
```

### Trên Server:
```bash
cd /root/QLCD
bash deploy-zalo-oauth-fix.sh
```

Hoặc manual:
```bash
git pull origin cdhy
pm2 delete qlcd-api
pm2 start ecosystem.config.js
pm2 save
```

## 📝 Test Flow

### 1. Generate Authorization URL
```bash
GET https://api.cdhy.com.vn/api/v1/zalo/auth-url
```

**Response:**
```json
{
  "success": true,
  "data": {
    "state": "ABC123...",
    "code_challenge": "xyz789...",
    "code_verifier": "verifier123..." 
  },
  "authorization_url": "https://oauth.zaloapp.com/v4/oa/permission?app_id=...",
  "instructions": {
    "step1": "Copy authorization_url và mở trong browser",
    "step2": "Đăng nhập Zalo và cấp quyền",
    "step3": "Zalo sẽ redirect về callback URL",
    "step4": "API tự động exchange code thành access_token"
  }
}
```

### 2. Authorize
- Copy `authorization_url` 
- Mở trong browser
- Đăng nhập Zalo và cấp quyền

### 3. Callback (Automatic)
Zalo redirect về:
```
https://api.cdhy.com.vn/api/v1/zalo/callback?code=XXX&state=ABC123
```

API tự động:
- Lấy state từ query
- Tìm code_verifier trong memory
- Exchange code → access_token
- Lưu token vào database

**Success Response:**
```json
{
  "message": "Lấy access_token thành công",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 86400
  }
}
```

## 🔍 Verify

### Check PM2 instances:
```bash
pm2 list
# Should show only 1 instance
```

### Check logs:
```bash
pm2 logs qlcd-api --lines 50
```

Look for:
- ✅ `Saved to memory: { state: ..., mapSize: 1 }`
- ✅ `Found code_verifier for state: ...`
- ❌ NOT: `State not found, using mock`

## ⚠️ Troubleshooting

### Lỗi: "Invalid OAuth state"
**Nguyên nhân:** State bị mất (server restart hoặc vẫn cluster mode)

**Fix:**
1. Verify single instance: `pm2 list` (chỉ 1 process)
2. Gọi `/auth-url` MỚI
3. Không dùng lại state cũ

### Lỗi: "Invalid code verifier"  
**Nguyên nhân:** Code verifier không khớp

**Fix:**
1. Kiểm tra `ZALO_APP_ID` và `ZALO_APP_SECRET` đúng
2. Kiểm tra `ZALO_REDIRECT_URI` khớp với Zalo Developer Console
3. Gọi `/auth-url` mới, không dùng lại

### Lỗi: Multiple processes
**Fix:**
```bash
pm2 delete qlcd-api
pm2 start ecosystem.config.js
pm2 list  # Verify chỉ 1 process
```

## 📋 Environment Variables

Cần có trong `.env.production`:
```bash
ZALO_APP_ID=3362418229677906906
ZALO_APP_SECRET=UrUD244w5M4Kv6P41S2T
ZALO_REDIRECT_URI=https://api.cdhy.com.vn/api/v1/zalo/callback
```

## 🎯 PKCE Flow Summary

```
1. Client calls /auth-url
   ↓
2. Server generates:
   - state (random)
   - code_verifier (random)
   - code_challenge = SHA256(code_verifier)
   ↓
3. Server stores: state → code_verifier (in memory)
   ↓
4. Client redirects user to Zalo with state + code_challenge
   ↓
5. User authorizes on Zalo
   ↓
6. Zalo redirects to callback with code + state
   ↓
7. Server:
   - Gets code_verifier from state
   - Calls Zalo API with code + code_verifier
   - Gets access_token
   - Deletes state (one-time use)
```

## ✅ Checklist

- [x] ecosystem.config.js: instances = 1
- [x] zalo.service.ts: Remove mock code_verifier
- [x] zalo.service.ts: Reject if state not found
- [x] zalo.service.ts: Delete state after use
- [x] .env: Add ZALO_REDIRECT_URI
- [x] zalo.controller.ts: Return full authorization_url
- [ ] Deploy to server
- [ ] Test flow end-to-end
