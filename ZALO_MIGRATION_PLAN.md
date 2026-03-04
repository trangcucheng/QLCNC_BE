# Plan Migration từ ZaloUser sang ZaloAccount

## Tình trạng hiện tại

### ZaloUser (cần migrate)
- Sử dụng cho Mini App authentication
- Fields: `zaloId`, `name`, `phone`, `avatar`, `userId`
- Relationship: OneToOne với User
- Sử dụng trong: zalo-push.service.ts, nguoi-nhan-su-kien.service.ts

### ZaloAccount (target)
- Sử dụng cho OA webhook và future integrations
- Fields: `userId`, `zaloOaUserId`, `zaloAppUserId`, `displayName`, `avatar`, `isFollowingOa`
- Relationship: ManyToOne với User (1 user có thể có nhiều zalo accounts)
- Sử dụng trong: zalo.controller.ts, thoi-gian-cap-nhat-doan-so.service.ts

## Migration Strategy

### Step 1: Extend ZaloAccount Entity
```sql
ALTER TABLE zalo_accounts ADD COLUMN zalo_mini_app_id VARCHAR(100) NULL COMMENT 'Zalo ID from Mini App login';
ALTER TABLE zalo_accounts ADD COLUMN phone VARCHAR(15) NULL COMMENT 'Phone number';
ALTER TABLE zalo_accounts ADD COLUMN additional_info JSON NULL COMMENT 'Extra info from Zalo';
ALTER TABLE zalo_accounts ADD COLUMN last_login_at DATETIME NULL COMMENT 'Last login time';
ALTER TABLE zalo_accounts ADD COLUMN is_active BOOLEAN DEFAULT 1 COMMENT 'Active status';
```

### Step 2: Data Migration
```sql
-- Migrate data từ zalo_users sang zalo_accounts
INSERT INTO zalo_accounts (
  user_id, 
  zalo_app_user_id,
  zalo_mini_app_id,
  display_name, 
  avatar, 
  phone, 
  additional_info, 
  last_login_at, 
  is_active,
  created_at, 
  updated_at
)
SELECT 
  userId,
  zaloId,
  zaloId,
  name,
  avatar,
  phone,
  additionalInfo,
  lastLoginAt,
  isActive,
  createdAt,
  updatedAt
FROM zalo_users
WHERE userId IS NOT NULL
ON DUPLICATE KEY UPDATE
  zalo_mini_app_id = VALUES(zalo_mini_app_id),
  phone = VALUES(phone),
  additional_info = VALUES(additional_info),
  last_login_at = VALUES(last_login_at);
```

### Step 3: Update Services
1. **zalo-push.service.ts**: Chuyển từ ZaloUser repository sang ZaloAccount
2. **nguoi-nhan-su-kien.service.ts**: Update queries
3. **zalo.service.ts**: Update authentication logic
4. **notification services**: Ensure consistent usage

### Step 4: Update Entity & Logic

#### ZaloAccount.entity.ts - Add new fields
```typescript
@Column({ name: 'zalo_mini_app_id', type: 'varchar', length: 100, nullable: true })
zaloMiniAppId: string; // zaloId từ Mini App login (cũ ZaloUser.zaloId)

@Column({ name: 'phone', type: 'varchar', length: 15, nullable: true })
phone: string;

@Column({ name: 'additional_info', type: 'json', nullable: true })
additionalInfo: any;

@Column({ name: 'last_login_at', type: 'datetime', nullable: true })
lastLoginAt: Date;

@Column({ name: 'is_active', type: 'boolean', default: true })
isActive: boolean;
```

### Step 5: New Unified Logic

#### Mapping Logic:
- **OA Follow** → `zaloOaUserId` populated
- **Mini App Login** → `zaloAppUserId` & `zaloMiniAppId` populated  
- **Manual Link** → Admin creates with `userId` only

#### Service Methods:
```typescript
// Unified search method
async findZaloAccountByAnyZaloId(zaloId: string): Promise<ZaloAccount | null> {
  return await this.zaloAccountRepository.findOne({
    where: [
      { zaloOaUserId: zaloId },
      { zaloAppUserId: zaloId },
      { zaloMiniAppId: zaloId }
    ],
    relations: ['user']
  });
}

// Link web user với zalo account
async linkUserWithZaloAccount(userId: string, zaloAccount: ZaloAccount): Promise<void> {
  zaloAccount.userId = userId;
  await this.zaloAccountRepository.save(zaloAccount);
}

// Create web user from zalo account
async createUserFromZaloAccount(zaloAccountId: number, userData: CreateUserDto): Promise<User> {
  // Create user
  const user = await this.userService.create(userData);
  
  // Link to zalo account
  await this.zaloAccountRepository.update(zaloAccountId, { userId: user.id });
  
  return user;
}
```

### Step 6: API Endpoints

#### Tài khoản Web Management
```typescript
// GET /api/v1/users - List users with zalo link info
// POST /api/v1/users - Create user (optionally link to zalo)
// POST /api/v1/users/:id/link-zalo - Link existing user to zalo account
// DELETE /api/v1/users/:id/unlink-zalo - Unlink zalo account
```

#### Zalo Accounts Management
```typescript
// GET /api/v1/zalo-accounts - List zalo accounts with user info
// POST /api/v1/zalo-accounts/:id/create-user - Create web user from zalo account
// PUT /api/v1/zalo-accounts/:id/link-user/:userId - Link to existing user
```

### Step 7: Frontend Integration

#### Dashboard Zalo Accounts
- Show unlinked zalo accounts với button "Tạo tài khoản"
- Show linked accounts với user info
- Bulk operations

#### User Management
- Show zalo link status
- Quick link/unlink actions
- Import from Zalo feature

## Benefits của việc migration:

1. **Single Source of Truth**: Chỉ 1 bảng cho tất cả Zalo integrations
2. **Flexible Mapping**: 1 User có thể có nhiều Zalo accounts (OA, Mini App, etc.)
3. **Consistent API**: Unified service methods
4. **Better Tracking**: Track follow status, login history, etc.
5. **Future-proof**: Ready for more Zalo integrations

## Timeline:

- **Phase 1** (1-2 days): Entity extension + migration script
- **Phase 2** (2-3 days): Service updates + testing
- **Phase 3** (1-2 days): API endpoints + frontend integration
- **Phase 4** (1 day): Cleanup ZaloUser references

Total: ~7 days
