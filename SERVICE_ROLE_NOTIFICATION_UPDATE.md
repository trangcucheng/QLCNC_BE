# Cập nhật Service Layer - Role-based Event Notifications

## Thay đổi đã thực hiện

### 1. Method `guiThongBaoSuKien()` - Hỗ trợ gửi thông báo theo role

#### ✅ **Logic mới:**
```typescript
// TRƯỚC:
const users = await this.userRepository.find({
  where: { id: In(guiThongBaoDto.nguoiNhanIds) }
});

// SAU:
let allUsers: User[] = [];

// 1. Lấy users từ nguoiNhanIds (nếu có)
if (guiThongBaoDto.nguoiNhanIds && guiThongBaoDto.nguoiNhanIds.length > 0) {
  const users = await this.userRepository.find({
    where: { id: In(guiThongBaoDto.nguoiNhanIds) }
  });
  allUsers.push(...users);
}

// 2. Lấy users từ roleIds (nếu có)
if (guiThongBaoDto.roleIds && guiThongBaoDto.roleIds.length > 0) {
  const usersFromRoles = await this.userRepository.find({
    where: { roleId: In(guiThongBaoDto.roleIds) }
  });
  allUsers.push(...usersFromRoles);
}

// 3. Loại bỏ duplicate users
const uniqueUsers = allUsers.filter((user, index, self) => 
  index === self.findIndex(u => u.id === user.id)
);
```

#### ✅ **Tính năng:**
- **Gửi cho users cụ thể**: Sử dụng `nguoiNhanIds` như trước
- **Gửi cho users theo role**: Sử dụng `roleIds` mới
- **Gửi kết hợp**: Cả `nguoiNhanIds` VÀ `roleIds` cùng lúc
- **Loại bỏ duplicate**: Tự động remove user trùng lặp

### 2. Method `guiThongBaoChoTatCa()` - Hỗ trợ filter theo role

#### ✅ **Logic mới:**
```typescript
// TRƯỚC:
const allUsers = await this.userRepository.find({
  select: ['id']
});

// SAU:
let allUsers: User[];
if (guiThongBaoDto.roleIds && guiThongBaoDto.roleIds.length > 0) {
  // Gửi cho các role cụ thể
  allUsers = await this.userRepository.find({
    where: { roleId: In(guiThongBaoDto.roleIds) },
    select: ['id']
  });
} else {
  // Gửi cho tất cả người dùng (như cũ)
  allUsers = await this.userRepository.find({
    select: ['id']
  });
}
```

#### ✅ **Tính năng:**
- **Gửi cho tất cả**: Không cung cấp `roleIds` (behavior cũ)
- **Gửi cho role cụ thể**: Cung cấp `roleIds` để filter

## Các tình huống sử dụng

### 1. Gửi cho users cụ thể (behavior cũ)
```json
POST /nguoi-nhan-su-kien/gui-thong-bao-su-kien
{
  "suKienId": 1,
  "nguoiNhanIds": ["user1", "user2", "user3"],
  "loaiThongBao": "Thông báo sự kiện"
}
```
**Result**: Gửi cho user1, user2, user3

### 2. Gửi cho tất cả users thuộc role (tính năng mới)
```json
POST /nguoi-nhan-su-kien/gui-thong-bao-su-kien
{
  "suKienId": 1,
  "roleIds": [1, 2],
  "loaiThongBao": "Thông báo sự kiện"
}
```
**Result**: Gửi cho tất cả users có roleId = 1 hoặc roleId = 2

### 3. Gửi kết hợp (tính năng mới)
```json
POST /nguoi-nhan-su-kien/gui-thong-bao-su-kien
{
  "suKienId": 1,
  "nguoiNhanIds": ["user1", "user2"],
  "roleIds": [1, 2],
  "loaiThongBao": "Thông báo sự kiện"
}
```
**Result**: Gửi cho user1, user2 + tất cả users có roleId = 1 hoặc 2 (loại bỏ duplicate)

### 4. Gửi cho role cụ thể thay vì tất cả (API riêng)
```json
POST /nguoi-nhan-su-kien/gui-thong-bao-cho-tat-ca
{
  "suKienId": 1,
  "roleIds": [2, 3],
  "loaiThongBao": "Thông báo sự kiện"
}
```
**Result**: Chỉ gửi cho users có roleId = 2 hoặc 3

### 5. Gửi cho tất cả users (behavior cũ)
```json
POST /nguoi-nhan-su-kien/gui-thong-bao-cho-tat-ca
{
  "suKienId": 1,
  "loaiThongBao": "Thông báo sự kiện"
}
```
**Result**: Gửi cho tất cả users trong hệ thống

## Lợi ích

### ✅ **Performance Better**
- Không cần query từng user một
- Bulk operations với `In()` clause
- Loại bỏ duplicate hiệu quả

### ✅ **Flexible & Scalable**  
- Hỗ trợ đa dạng use cases
- Không breaking changes
- Dễ mở rộng cho các requirements mới

### ✅ **Business Logic Friendly**
- Gửi thông báo theo department/role
- Kết hợp gửi cho VIP users + specific roles
- Quản lý permissions dễ dàng

## Database Queries

### Query 1: Lấy users từ IDs
```sql
SELECT * FROM user WHERE id IN ('user1', 'user2', 'user3')
```

### Query 2: Lấy users từ roleIds  
```sql
SELECT * FROM user WHERE roleId IN (1, 2, 3)
```

### Query 3: Lấy users theo role filter (cho API tất cả)
```sql
-- Nếu có roleIds:
SELECT id FROM user WHERE roleId IN (2, 3)

-- Nếu không có roleIds:
SELECT id FROM user
```

## Error Handling

### ✅ **Validation đã handle:**
- Ít nhất một trong `nguoiNhanIds` hoặc `roleIds` phải có (DTO level)
- `notFoundUserIds` chỉ áp dụng cho `nguoiNhanIds` 
- Role không tồn tại sẽ không tạo ra users (safe)

### ✅ **Response format giữ nguyên:**
```typescript
{
  message: string;
  soLuongGui: number;      // Tổng số users đã gửi (sau khi loại duplicate)
  daGuiCho: string[];      // Danh sách user IDs đã gửi
  loi: string[];           // Lỗi cho nguoiNhanIds không tồn tại
  downloadLinks: string[]; // Links download files
}
```

## Status: ✅ HOÀN THÀNH

Service layer đã được cập nhật để hỗ trợ đầy đủ role-based event notifications với khả năng tương thích ngược!