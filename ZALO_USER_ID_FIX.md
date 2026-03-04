# 🔧 ZaloUser userId Field Type Fix

## ❌ **Vấn đề:**
- `users.id` trong database có kiểu `string` (mặc dù sử dụng auto-increment)
- `zalo_users.userId` được tạo với kiểu `int` → **Không khớp!**
- Foreign key constraint sẽ lỗi vì kiểu dữ liệu không tương thích

## ✅ **Đã sửa:**

### **1. Migration File:** `1758875312637-CreateZaloUserTable.ts`
```sql
-- Trước:
`userId` int NULL COMMENT 'Liên kết với user hệ thống'

-- Sau:  
`userId` varchar(255) NULL COMMENT 'Liên kết với user hệ thống'
```

### **2. Entity File:** `ZaloUser.entity.ts`
```typescript
// Trước:
@Column({ type: 'int', nullable: true, comment: 'Liên kết với user hệ thống' })
userId: number;

// Sau:
@Column({ type: 'varchar', length: 255, nullable: true, comment: 'Liên kết với user hệ thống' })
userId: string;
```

### **3. Service File:** `zalo.service.ts`
```typescript
// Trước:
async linkZaloUserWithSystemUser(zaloId: string, systemUserId: number): Promise<ZaloUser>

// Sau:
async linkZaloUserWithSystemUser(zaloId: string, systemUserId: string): Promise<ZaloUser>

// Và sửa return type:
// Trước: 
id: zaloUser.user?.id?.toString() || zaloUser.id.toString()

// Sau:
id: zaloUser.user?.id || zaloUser.id.toString()
```

### **4. Controller File:** `zalo.controller.ts`
```typescript
// Trước:
@Param('systemUserId', ParseIntPipe) systemUserId: number

// Sau:  
@Param('systemUserId') systemUserId: string
```

## 🗄️ **Database Schema sau khi sửa:**

```sql
-- Bảng users
CREATE TABLE `users` (
    `id` varchar(36) PRIMARY KEY,  -- String ID (UUID hoặc auto-generated)
    -- ... other fields
);

-- Bảng zalo_users
CREATE TABLE `zalo_users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) NULL,     -- ✅ Khớp với users.id
    -- ... other fields
    CONSTRAINT `FK_zalo_users_userId` 
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
);
```

## 🎯 **Kết quả:**
- ✅ **Foreign key constraint** sẽ hoạt động đúng
- ✅ **TypeORM relationships** không bị lỗi  
- ✅ **API endpoints** nhận đúng kiểu dữ liệu
- ✅ **JWT payload** trả về đúng format

## 🚀 **Test sau khi sửa:**

### **1. Chạy migration:**
```bash
npm run migration:run
```

### **2. Test API liên kết user:**
```bash
POST /zalo/login
# Nhận JWT token

PATCH /zalo/link-user/user_id_string_here
Authorization: Bearer <zalo_jwt_token>
```

### **3. Kiểm tra database:**
```sql
SELECT * FROM zalo_users WHERE userId IS NOT NULL;
-- userId sẽ là string, không phải number
```

## ⚠️ **Lỗi và cách sửa:**

### **Lỗi 1: TypeORM Entity Validation**
```
Column userId of Entity ZaloUser does not support length property
```
**Giải pháp:** Xóa `length: 255` trong `@Column()` decorator của entity

### **Lỗi 2: Foreign Key Reference** 
```
Failed to open the referenced table 'users'
```
**Giải pháp:** Sửa `REFERENCES \`users\`` thành `REFERENCES \`user\`` trong migration

### **Lỗi 3: Tên bảng không đúng**
- Migration ban đầu reference `users` table
- Nhưng database thực tế có tên bảng là `user`
- **Đã sửa:** `REFERENCES \`user\`` trong migration file

## ✅ **Trạng thái hiện tại:**
- ✅ **Migration đã chạy thành công** 
- ✅ **Bảng `zalo_users` đã được tạo**
- ✅ **Foreign key constraint hoạt động đúng**
- ✅ **TypeORM relationships không bị lỗi**

🎉 **ZaloUser userId field type đã được sửa và migration hoàn tất!**
