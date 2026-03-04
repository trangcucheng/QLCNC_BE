# ZMP (Zalo Mini Program) Notification System

## Tổng quan

Do tài khoản Zalo OA cá nhân không hỗ trợ API gửi push message của OA (chỉ dành cho OA doanh nghiệp), chúng ta đã chuyển từ hệ thống OA push messages sang ZMP SDK notifications.

## Kiến trúc mới

### 1. Database-driven Notifications
Thay vì gửi push message qua OA API, hệ thống sẽ:
- Tạo thông báo trong database (`thong_bao` và `user_thong_bao`)
- Mini App sẽ poll/query để lấy thông báo mới
- Sử dụng ZMP SDK để hiển thị local notifications

### 2. Luồng hoạt động

```
Backend System -> Create Notification in DB -> Mini App Polls -> ZMP SDK Local Notification
```

## API Endpoints mới

### ZaloZMPNotificationController (`/zalo-zmp`)

#### 1. `GET /zalo-zmp/notifications`
- Lấy danh sách thông báo cho user hiện tại
- Query params: `page`, `limit`, `unreadOnly`
- Trả về: Danh sách notifications với format ZMP

#### 2. `GET /zalo-zmp/notifications/unread-count`
- Đếm số thông báo chưa đọc
- Dùng để hiển thị badge số trên Mini App

#### 3. `POST /zalo-zmp/test-notification`
- Tạo thông báo test
- Body: `{ zaloUserId?: string }` (optional)

#### 4. `POST /zalo-zmp/notifications/:id/mark-read`
- Đánh dấu thông báo đã đọc

#### 5. `POST /zalo-zmp/notifications/mark-all-read`
- Đánh dấu tất cả thông báo đã đọc

## ZaloPushNotificationService - Phương thức mới

### 1. `createZMPNotification()`
```typescript
async createZMPNotification(
  zaloUserId: string,
  notificationType: 'approved' | 'rejected' | 'reminder' | 'system',
  data: {
    title: string;
    message: string;
    relatedId?: number;
    additionalData?: any;
  }
): Promise<{ success: boolean; notificationId?: number; error?: string }>
```

### 2. `sendApprovalNotification()`
```typescript
async sendApprovalNotification(zaloUserId: string, approval: {
  reportId: number;
  reportType: string;
  status: 'approved' | 'rejected';
  reason?: string;
}): Promise<{ success: boolean; notificationId?: number; error?: string }>
```

### 3. `getZMPNotifications()`
```typescript
async getZMPNotifications(zaloUserId: string, options?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{
  success: boolean;
  data?: ZMPNotificationData[];
  total?: number;
  error?: string;
}>
```

## ZMPNotificationData Interface

```typescript
interface ZMPNotificationData {
  type: 'system_notification' | 'approval_update' | 'event_notification' | 'reminder';
  id: string;
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  userId?: number;
}
```

## Tích hợp với workflow phê duyệt

### BaoCaoDoanSoTheoKyService
Đã cập nhật method `sendApprovalNotification()` để sử dụng:
- `zaloPushService.sendApprovalNotification()` thay vì `sendPushNotification()`
- Hỗ trợ các trạng thái: `approved`, `rejected` với lý do từ chối

```typescript
const zmpResult = await this.zaloPushService.sendApprovalNotification(
  zaloUser.zaloId,
  {
    reportId: baoCao.id,
    reportType: 'Báo cáo đoàn số theo kỳ',
    status: trangThaiPheDuyet === TrangThaiPheDuyet.DA_PHE_DUYET ? 'approved' : 'rejected',
    reason: ghiChu || undefined
  }
);
```

## Cấu hình Mini App

### 1. Polling notifications
Mini App nên poll notifications mỗi 30-60 giây:
```javascript
// Polling mỗi 30 giây
setInterval(async () => {
  const response = await api.get('/zalo-zmp/notifications', {
    params: { page: 1, limit: 20, unreadOnly: true }
  });
  
  if (response.data.success && response.data.data.length > 0) {
    // Hiển thị notifications mới bằng ZMP SDK
    showLocalNotifications(response.data.data);
  }
}, 30000);
```

### 2. ZMP SDK Local Notifications
Sử dụng ZMP SDK để hiển thị thông báo:
```javascript
import { showNotification } from 'zmp-sdk';

function showLocalNotifications(notifications) {
  notifications.forEach(notification => {
    showNotification({
      message: notification.title,
      description: notification.message,
      type: 'info'
    });
  });
}
```

### 3. Badge đếm thông báo chưa đọc
```javascript
async function updateNotificationBadge() {
  const response = await api.get('/zalo-zmp/notifications/unread-count');
  if (response.data.success) {
    // Cập nhật badge số trên tab notifications
    updateBadge(response.data.unreadCount);
  }
}
```

## Migration từ OA Push Messages

### Thay đổi code:
1. **AuthModule**: Đã thêm `ZaloPushNotificationService` và `ZaloZMPNotificationController`
2. **ZaloPushNotificationService**: Chuyển từ OA API calls sang database operations
3. **BaoCaoDoanSoTheoKyService**: Sử dụng `sendApprovalNotification()` thay vì `sendPushNotification()`

### Dependency changes:
- Thêm `ThongBaoModule` vào `AuthModule`
- `ZaloPushNotificationService` inject `ThongBaoService`
- Remove dependency với `ZaloOATokenService` (không cần thiết cho ZMP)

## Testing

### 1. Test tạo notification
```bash
POST /zalo-zmp/test-notification
Authorization: Bearer <zalo_token>
```

### 2. Test lấy notifications
```bash
GET /zalo-zmp/notifications?page=1&limit=10
Authorization: Bearer <zalo_token>
```

### 3. Test approval workflow
1. Tạo báo cáo bằng Zalo account đã liên kết
2. Admin phê duyệt/từ chối báo cáo
3. Kiểm tra notification được tạo trong database
4. Test API `/zalo-zmp/notifications` để lấy notification

## Lưu ý quan trọng

1. **Không có real-time push**: Do không dùng OA push API, Mini App cần polling để lấy notifications mới
2. **ZMP SDK Local Notifications**: Chỉ hiển thị khi user đang mở Mini App
3. **Battery optimization**: Điều chỉnh tần suất polling phù hợp để không ảnh hưởng pin
4. **Offline handling**: Khi Mini App offline, notifications sẽ được lấy khi online trở lại

## Environment Variables

Không cần các biến môi trường OA push messages nữa:
- ~~`ZALO_OA_ACCESS_TOKEN`~~ (không dùng)
- ~~`ZALO_OA_NOTIFICATION_URL`~~ (không dùng)

Vẫn cần:
- `ZALO_APP_ID`: Cho Mini App authentication
- `ZALO_APP_SECRET`: Cho token validation

## Kết luận

Hệ thống ZMP notifications cung cấp giải pháp thay thế hiệu quả cho OA push messages khi sử dụng tài khoản OA cá nhân. Tuy không có real-time push, nhưng với polling hợp lý và UX tốt, trải nghiệm người dùng vẫn được đảm bảo.
