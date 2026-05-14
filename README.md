# QLCNC Backend - Hệ Thống Quản Lý Đối Tượng Vi Phạm Pháp Luật

> Backend API cho Hệ thống Quản lý Công nghệ Công nghiệp - Đà Nẵng

## 📖 Giới thiệu

Backend API được xây dựng bằng NestJS, Prisma ORM và MySQL, cung cấp các tính năng quản lý đối tượng vi phạm pháp luật, vụ việc, tài liệu, và hệ thống báo cáo toàn diện với RBAC (Role-Based Access Control).

## 🚀 Công nghệ sử dụng

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **ORM**: Prisma 6.10
- **Database**: MySQL 8.0
- **Authentication**: JWT (Passport-JWT)
- **Validation**: class-validator, class-transformer
- **File Processing**: Sharp (images), pdf-parse, mammoth (Word), ExcelJS, XLSX
- **API Documentation**: Swagger/OpenAPI
- **Security**: Throttler, CORS, JWT Blacklist
- **Scheduling**: @nestjs/schedule (Backup tự động)

## 📁 Cấu trúc dự án

```
QLCNC_BE/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed/                   # Seed data
├── src/
│   ├── auth/                   # Authentication module
│   ├── backup/                 # Backup service & cron jobs
│   ├── decorator/              # Custom decorators (@Public, @Roles)
│   ├── guard/                  # Guards (JWT, Roles, Permissions)
│   ├── helper/                 # Helper utilities
│   ├── log/                    # Logging & blacklist
│   │   └── blacklist/          # JWT blacklist management
│   └── module/
│       ├── nguoiDung/          # User management
│       ├── vaiTro/             # Role management
│       ├── quyen/              # Permission management
│       ├── donVi/              # Unit/Department management
│       ├── donViHanhChinh/     # Administrative divisions
│       ├── hoSoDoiTuong/       # Target profile management
│       ├── hoSoVuViec/         # Case management
│       ├── taiLieu/            # Document management
│       ├── baoCao/             # Report & export (Excel, PDF, Word)
│       ├── thongBao/           # Notification system
│       ├── toimDanh/           # Crime categories
│       ├── quanHeXaHoi/        # Social relationships
│       ├── kyHieu/             # Document symbols
│       ├── bieuMau/            # Form templates
│       ├── cauHinhHeThong/     # System configuration
│       ├── lichSuDangNhap/     # Login history
│       └── exports_/           # Export utilities
├── uploads/                    # Uploaded files
│   ├── avatar/                 # User avatars
│   ├── doi-tuong/              # Target photos
│   └── tai-lieu/               # Documents
├── log/backup/                 # Database backups
├── docker-compose.yml          # Docker configuration
└── .env                        # Environment variables
```

## 🔧 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd QLCNC_BE
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình environment

Tạo file `.env` trong thư mục gốc:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/qlcnc_db"

# JWT Configuration
JWT_SECRET="your-secret-key-here-change-in-production"
JWT_EXPIRATION="7d"

# Server
PORT=6062
NODE_ENV=development

# CORS (Frontend URLs)
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

### Bước 4: Setup Database

#### Sử dụng Docker (Khuyến nghị)

```bash
# Start PostgreSQL container (nếu dùng Postgres)
docker-compose up -d

# Hoặc cài MySQL thủ công và tạo database
mysql -u root -p
CREATE DATABASE qlcnc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Chạy migrations

```bash
# Tạo database schema
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

#### Seed dữ liệu mẫu

```bash
# Import roles, permissions, admin user
npx prisma db seed
```

**Tài khoản đăng nhập mặc định:**
- Email: `admin@gmail.com`
- Password: `admin`

### Bước 5: Chạy server

```bash
# Development mode (hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server sẽ chạy tại: **http://localhost:6062**

Swagger UI: **http://localhost:6062/api**

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Đăng nhập | ❌ |
| POST | `/auth/logout` | Đăng xuất | ✅ |
| GET | `/auth/profile` | Lấy thông tin profile | ✅ |
| PATCH | `/auth/profile` | Cập nhật profile | ✅ |
| POST | `/auth/change-password` | Đổi mật khẩu | ✅ |

### Quản lý Đối tượng (HoSoDoiTuong)

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/ho-so-doi-tuong` | Danh sách đối tượng (search, filter, pagination) | `ho-so-doi-tuong:read` |
| GET | `/ho-so-doi-tuong/:id` | Chi tiết đối tượng | `ho-so-doi-tuong:read` |
| POST | `/ho-so-doi-tuong` | Tạo đối tượng mới | `ho-so-doi-tuong:create` |
| PATCH | `/ho-so-doi-tuong/:id` | Cập nhật đối tượng | `ho-so-doi-tuong:update` |
| DELETE | `/ho-so-doi-tuong/:id` | Xóa đối tượng | `ho-so-doi-tuong:delete` |
| POST | `/ho-so-doi-tuong/:id/upload-anh` | Upload ảnh đối tượng | `ho-so-doi-tuong:update` |
| GET | `/ho-so-doi-tuong/thong-ke/khu-vuc` | Thống kê theo khu vực | `ho-so-doi-tuong:read` |
| GET | `/ho-so-doi-tuong/thong-ke/trang-thai` | Thống kê theo trạng thái | `ho-so-doi-tuong:read` |

### Quản lý Vụ việc (HoSoVuViec)

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/ho-so-vu-viec` | Danh sách vụ việc | `ho-so-vu-viec:read` |
| GET | `/ho-so-vu-viec/:id` | Chi tiết vụ việc | `ho-so-vu-viec:read` |
| POST | `/ho-so-vu-viec` | Tạo vụ việc mới | `ho-so-vu-viec:create` |
| PATCH | `/ho-so-vu-viec/:id` | Cập nhật vụ việc | `ho-so-vu-viec:update` |
| DELETE | `/ho-so-vu-viec/:id` | Xóa vụ việc | `ho-so-vu-viec:delete` |
| PATCH | `/ho-so-vu-viec/:id/trang-thai` | Cập nhật trạng thái | `ho-so-vu-viec:update` |
| GET | `/ho-so-vu-viec/thong-ke/muc-do` | Thống kê theo mức độ | `ho-so-vu-viec:read` |
| GET | `/ho-so-vu-viec/thong-ke/trang-thai` | Thống kê theo trạng thái | `ho-so-vu-viec:read` |
| GET | `/ho-so-vu-viec/thong-ke/khu-vuc` | Thống kê theo khu vực | `ho-so-vu-viec:read` |
| GET | `/ho-so-vu-viec/thong-ke/toim-danh` | Thống kê theo tội danh | `ho-so-vu-viec:read` |

### Quản lý Tài liệu

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| POST | `/tai-lieu/doi-tuong` | Upload tài liệu đối tượng | `tai-lieu:create` |
| POST | `/tai-lieu/vu-viec` | Upload tài liệu vụ việc | `tai-lieu:create` |
| GET | `/tai-lieu/download/doi-tuong/:id` | Download tài liệu đối tượng | `tai-lieu:read` |
| GET | `/tai-lieu/download/vu-viec/:id` | Download tài liệu vụ việc | `tai-lieu:read` |
| DELETE | `/tai-lieu/:id` | Xóa tài liệu | `tai-lieu:delete` |

### Báo cáo & Export

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/bao-cao/export/excel` | Export Excel | `bao-cao:export` |
| GET | `/bao-cao/export/pdf` | Export PDF | `bao-cao:export` |
| GET | `/bao-cao/export/word` | Export Word | `bao-cao:export` |
| GET | `/bao-cao/thong-ke/tong-quan` | Thống kê tổng quan | `bao-cao:read` |
| GET | `/bao-cao/thong-ke/bieu-do` | Dữ liệu biểu đồ | `bao-cao:read` |

### Quản lý Users & RBAC

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|---------------------|
| GET | `/users` | Danh sách người dùng | `users:read` |
| POST | `/users` | Tạo người dùng mới | `users:create` |
| PATCH | `/users/:id` | Cập nhật người dùng | `users:update` |
| DELETE | `/users/:id` | Xóa người dùng | `users:delete` |
| GET | `/roles` | Danh sách vai trò | `roles:read` |
| POST | `/roles` | Tạo vai trò mới | `roles:create` |
| GET | `/permissions` | Danh sách quyền | `permissions:read` |

### Danh mục (Categories)

- `/don-vi-hanh-chinh` - Đơn vị hành chính (Tỉnh/Thành phố, Xã/Phường)
- `/toim-danh` - Tội danh
- `/quan-he-xa-hoi` - Quan hệ xã hội
- `/ky-hieu` - Ký hiệu văn bản
- `/bieu-mau` - Biểu mẫu

## 🔒 Hệ thống phân quyền (RBAC)

### 3 Vai trò chính:

1. **QUAN_TRI_VIEN** (Quản trị viên)
   - Full quyền truy cập hệ thống
   - Quản lý users, roles, permissions
   - Cấu hình hệ thống

2. **LANH_DAO** (Lãnh đạo)
   - Xem các báo cáo, thống kê
   - Export dữ liệu
   - Không được chỉnh sửa

3. **CAN_BO_NGHIEP_VU** (Cán bộ nghiệp vụ)
   - CRUD đối tượng và vụ việc
   - Upload tài liệu
   - Xem báo cáo cơ bản

### Cách hoạt động:

```typescript
// Sử dụng decorators
@Roles('QUAN_TRI_VIEN')
@Permissions('ho-so-doi-tuong:create')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
async create(@Body() dto: CreateDto) {
  // ...
}

// Public route (không cần auth)
@Public()
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

## 🗄️ Database Schema

Database được thiết kế với cấu trúc phân cấp rõ ràng:

### Core Tables:
- **NguoiDung** - Người dùng hệ thống
- **VaiTro** - Vai trò
- **Quyen** - Quyền hạn
- **VaiTroQuyen** - Mapping vai trò - quyền
- **VaiTroNguoiDung** - Mapping người dùng - vai trò

### Main Entities:
- **HoSoDoiTuong** - Hồ sơ đối tượng (người)
- **HoSoVuViec** - Hồ sơ vụ việc
- **TaiLieu** - Tài liệu đính kèm
- **QuanHeDoiTuong** - Quan hệ giữa các đối tượng

### Categories:
- **DonViHanhChinh** - Đơn vị hành chính (2 cấp)
- **ToimDanh** - Tội danh
- **QuanHeXaHoi** - Các loại quan hệ
- **BieuMau** - Biểu mẫu
- **DonVi** - Đơn vị, phòng ban

## 🛡️ Bảo mật

- ✅ JWT Authentication với refresh token
- ✅ JWT Blacklist (revoke tokens khi logout)
- ✅ Password hashing với bcrypt
- ✅ Rate limiting (Throttler)
- ✅ Input validation (class-validator)
- ✅ CORS configuration
- ✅ SQL Injection protection (Prisma ORM)
- ✅ XSS protection

## 📦 Tính năng nổi bật

### 1. Backup tự động
- Tự động backup database hàng ngày (5:00 PM)
- Lưu file `.sql` vào `log/backup/`
- Cleanup backups cũ (giữ 30 ngày gần nhất)

### 2. File Processing
- Upload và xử lý nhiều loại file (images, PDF, Word, Excel)
- Resize và optimize ảnh (Sharp)
- Parse nội dung PDF, Word documents
- Export báo cáo Excel, PDF, Word

### 3. Advanced Search & Filter
- Full-text search trên nhiều trường
- Filter theo nhiều tiêu chí
- Pagination với skip/take
- Sort theo nhiều cột

### 4. Logging & Monitoring
- Login history tracking
- JWT blacklist management
- Request/Response logging
- Error tracking

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts

```bash
npm run start          # Start server
npm run start:dev      # Start với hot-reload
npm run start:prod     # Start production build
npm run build          # Build TypeScript
npm run format         # Format code (Prettier)
npm run lint           # Lint code (ESLint)
```

## 🔗 Tài liệu liên quan

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
- [RBAC_DATABASE_SETUP.md](./RBAC_DATABASE_SETUP.md) - Setup RBAC database
- [Swagger UI](http://localhost:6062/api) - API Documentation

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên repository hoặc liên hệ team phát triển.

## 📄 License

UNLICENSED - Private project
