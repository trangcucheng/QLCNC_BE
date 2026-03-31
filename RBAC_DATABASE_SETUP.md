// CẤU TRÚC DATABASE CHO RBAC

## Backend cần có các bảng sau (đã có trong schema.prisma):

### 1. NguoiDung (Users)
```prisma
model NguoiDung {
  id                String
  hoTen             String
  email             String
  matKhau           String
  loaiNguoiDung     LoaiNguoiDung  // CAN_BO_NGHIEP_VU | LANH_DAO | QUAN_TRI_VIEN
  trangThaiHoatDong Boolean
  
  vaiTroNguoiDung   VaiTroNguoiDung[]  // Many-to-Many với VaiTro
}
```

### 2. VaiTro (Roles)
```prisma
model VaiTro {
  id          String
  tenVaiTro   String  // "Admin", "Quản lý", "Cán bộ", etc.
  moTa        String?
  
  vaiTroNguoiDung VaiTroNguoiDung[]
  vaiTroQuyen     VaiTroQuyen[]
}
```

### 3. Quyen (Permissions)
```prisma
model Quyen {
  id       String
  tenQuyen String  // "ho-so-doi-tuong:read", "ho-so-doi-tuong:create", etc.
  moTa     String?
  
  vaiTroQuyen VaiTroQuyen[]
}
```

### 4. VaiTroNguoiDung (User-Role Junction)
```prisma
model VaiTroNguoiDung {
  nguoiDungId String
  vaiTroId    String
  
  nguoiDung NguoiDung @relation(...)
  vaiTro    VaiTro    @relation(...)
}
```

### 5. VaiTroQuyen (Role-Permission Junction)
```prisma
model VaiTroQuyen {
  vaiTroId String
  quyenId  String
  
  vaiTro VaiTro @relation(...)
  quyen  Quyen  @relation(...)
}
```

---

## SEED DATA MẪU

### 1. Tạo Permissions (Quyền)

```typescript
const permissions = [
  // Đối tượng
  { tenQuyen: 'ho-so-doi-tuong:read', moTa: 'Xem danh sách đối tượng' },
  { tenQuyen: 'ho-so-doi-tuong:create', moTa: 'Tạo đối tượng mới' },
  { tenQuyen: 'ho-so-doi-tuong:update', moTa: 'Chỉnh sửa đối tượng' },
  { tenQuyen: 'ho-so-doi-tuong:delete', moTa: 'Xóa đối tượng' },
  
  // Vụ việc
  { tenQuyen: 'ho-so-vu-viec:read', moTa: 'Xem danh sách vụ việc' },
  { tenQuyen: 'ho-so-vu-viec:create', moTa: 'Tạo vụ việc mới' },
  { tenQuyen: 'ho-so-vu-viec:update', moTa: 'Chỉnh sửa vụ việc' },
  { tenQuyen: 'ho-so-vu-viec:delete', moTa: 'Xóa vụ việc' },
  
  // Báo cáo
  { tenQuyen: 'bao-cao:read', moTa: 'Xem báo cáo' },
  { tenQuyen: 'bao-cao:export', moTa: 'Xuất báo cáo' },
  
  // Người dùng
  { tenQuyen: 'users:read', moTa: 'Xem danh sách người dùng' },
  { tenQuyen: 'users:create', moTa: 'Tạo người dùng mới' },
  { tenQuyen: 'users:update', moTa: 'Chỉnh sửa người dùng' },
  { tenQuyen: 'users:delete', moTa: 'Xóa người dùng' },
  
  // Vai trò
  { tenQuyen: 'roles:read', moTa: 'Xem vai trò' },
  { tenQuyen: 'roles:create', moTa: 'Tạo vai trò' },
  { tenQuyen: 'roles:update', moTa: 'Sửa vai trò' },
  { tenQuyen: 'roles:delete', moTa: 'Xóa vai trò' },
  
  // Backup
  { tenQuyen: 'backup:read', moTa: 'Xem backup' },
  { tenQuyen: 'backup:create', moTa: 'Tạo backup' },
  { tenQuyen: 'backup:restore', moTa: 'Khôi phục backup' },
  
  // Settings
  { tenQuyen: 'settings:read', moTa: 'Xem cấu hình' },
  { tenQuyen: 'settings:update', moTa: 'Sửa cấu hình' },
];
```

### 2. Tạo Roles (Vai trò)

```typescript
const roles = [
  {
    tenVaiTro: 'Admin',
    moTa: 'Quản trị viên - Full quyền',
    permissions: [
      // Tất cả permissions
      'ho-so-doi-tuong:read', 'ho-so-doi-tuong:create', 'ho-so-doi-tuong:update', 'ho-so-doi-tuong:delete',
      'ho-so-vu-viec:read', 'ho-so-vu-viec:create', 'ho-so-vu-viec:update', 'ho-so-vu-viec:delete',
      'bao-cao:read', 'bao-cao:export',
      'users:read', 'users:create', 'users:update', 'users:delete',
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      'backup:read', 'backup:create', 'backup:restore',
      'settings:read', 'settings:update',
    ],
  },
  {
    tenVaiTro: 'Lãnh đạo',
    moTa: 'Lãnh đạo - Chỉ xem và xuất báo cáo',
    permissions: [
      'ho-so-doi-tuong:read',
      'ho-so-vu-viec:read',
      'bao-cao:read',
      'bao-cao:export',
    ],
  },
  {
    tenVaiTro: 'Cán bộ nghiệp vụ',
    moTa: 'Cán bộ nghiệp vụ - CRUD đối tượng và vụ việc',
    permissions: [
      'ho-so-doi-tuong:read', 'ho-so-doi-tuong:create', 'ho-so-doi-tuong:update', 'ho-so-doi-tuong:delete',
      'ho-so-vu-viec:read', 'ho-so-vu-viec:create', 'ho-so-vu-viec:update', 'ho-so-vu-viec:delete',
      'bao-cao:read',
    ],
  },
];
```

### 3. Tạo Users mẫu

```typescript
const users = [
  {
    hoTen: 'Admin Hệ thống',
    email: 'admin@qlcnc.vn',
    matKhau: 'admin123', // Hash trong thực tế
    loaiNguoiDung: 'QUAN_TRI_VIEN',
    roles: ['Admin'],
  },
  {
    hoTen: 'Lãnh đạo Phòng',
    email: 'lanhdao@qlcnc.vn',
    matKhau: 'lanhdao123',
    loaiNguoiDung: 'LANH_DAO',
    roles: ['Lãnh đạo'],
  },
  {
    hoTen: 'Cán bộ Nghiệp vụ',
    email: 'canbo@qlcnc.vn',
    matKhau: 'canbo123',
    loaiNguoiDung: 'CAN_BO_NGHIEP_VU',
    roles: ['Cán bộ nghiệp vụ'],
  },
];
```

---

## BACKEND API CẦN TRẢ VỀ

### Endpoint: POST /auth/login

Response phải bao gồm đầy đủ thông tin roles và permissions:

```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-123",
      "hoTen": "Nguyễn Văn A",
      "email": "canbo@qlcnc.vn",
      "loaiNguoiDung": "CAN_BO_NGHIEP_VU",
      "trangThaiHoatDong": true,
      "vaiTroNguoiDung": [
        {
          "id": "vtn-uuid",
          "vaiTro": {
            "id": "role-uuid",
            "tenVaiTro": "Cán bộ nghiệp vụ",
            "moTa": "Cán bộ nghiệp vụ - CRUD đối tượng và vụ việc",
            "vaiTroQuyen": [
              {
                "id": "vtq-1",
                "quyen": {
                  "id": "perm-1",
                  "tenQuyen": "ho-so-doi-tuong:read",
                  "moTa": "Xem danh sách đối tượng"
                }
              },
              {
                "id": "vtq-2",
                "quyen": {
                  "id": "perm-2",
                  "tenQuyen": "ho-so-doi-tuong:create",
                  "moTa": "Tạo đối tượng mới"
                }
              },
              {
                "id": "vtq-3",
                "quyen": {
                  "id": "perm-3",
                  "tenQuyen": "ho-so-doi-tuong:update",
                  "moTa": "Chỉnh sửa đối tượng"
                }
              },
              {
                "id": "vtq-4",
                "quyen": {
                  "id": "perm-4",
                  "tenQuyen": "ho-so-doi-tuong:delete",
                  "moTa": "Xóa đối tượng"
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

### Endpoint: GET /auth/profile

Trả về cùng structure như login để verify token:

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-123",
    "hoTen": "Nguyễn Văn A",
    ...
    "vaiTroNguoiDung": [...]
  }
}
```

---

## PRISMA QUERY MẪU CHO BACKEND

### Khi login:

```typescript
const user = await prisma.nguoiDung.findUnique({
  where: { email },
  include: {
    vaiTroNguoiDung: {
      include: {
        vaiTro: {
          include: {
            vaiTroQuyen: {
              include: {
                quyen: true,
              },
            },
          },
        },
      },
    },
  },
});
```

### Khi tạo user mới với role:

```typescript
await prisma.nguoiDung.create({
  data: {
    hoTen,
    email,
    matKhau: hashedPassword,
    loaiNguoiDung,
    vaiTroNguoiDung: {
      create: {
        vaiTroId: roleId, // ID của vai trò được gán
      },
    },
  },
});
```

---

## TEST ACCOUNTS

Để test RBAC, tạo 3 tài khoản:

```
1. Admin
   Email: admin@qlcnc.vn
   Password: admin123
   Role: QUAN_TRI_VIEN
   
2. Lãnh đạo
   Email: lanhdao@qlcnc.vn
   Password: lanhdao123
   Role: LANH_DAO
   
3. Cán bộ
   Email: canbo@qlcnc.vn  
   Password: canbo123
   Role: CAN_BO_NGHIEP_VU
```

Login lần lượt từng tài khoản để thấy sự khác biệt về menu và quyền!
