# Hướng Dẫn Cài Đặt và Chạy Backend - Hệ Thống QLCNC

## Yêu Cầu Hệ Thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

## Bước 1: Cài Đặt Dependencies

```bash
cd QLCNC_BE
npm install

# Cài thêm package thiếu (nếu chưa có)
npm install class-transformer
```

## Bước 2: Cấu Hình Database

Tạo file `.env` trong thư mục QLCNC_BE:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/qlcnc_db"

# JWT Secret
JWT_SECRET="your-secret-key-here-change-in-production"
JWT_EXPIRATION="7d"

# Server
PORT=3000
```

## Bước 3: Chạy Migration Database

```bash
# Tạo database và chạy migration
npx prisma migrate dev --name init

# Hoặc nếu đã có migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Bước 4: Seed Data Mẫu

```bash
# Import dữ liệu mẫu (admin, roles, permissions)
npx prisma db seed
```

Thông tin đăng nhập mặc định:
- Email: `admin@gmail.com`
- Password: `admin`

## Bước 5: Chạy Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server sẽ chạy tại: http://localhost:3000

## API Endpoints Chính

### Authentication
- POST `/auth/login` - Đăng nhập
- POST `/auth/logout` - Đăng xuất
- GET `/auth/profile` - Lấy thông tin profile

### Quản Lý Đối Tượng
- GET `/ho-so-doi-tuong` - Danh sách đối tượng (có tìm kiếm, phân trang)
- GET `/ho-so-doi-tuong/:id` - Chi tiết đối tượng
- POST `/ho-so-doi-tuong` - Tạo mới đối tượng
- PATCH `/ho-so-doi-tuong/:id` - Cập nhật đối tượng
- DELETE `/ho-so-doi-tuong/:id` - Xóa đối tượng
- GET `/ho-so-doi-tuong/thong-ke/khu-vuc` - Thống kê theo khu vực
- GET `/ho-so-doi-tuong/thong-ke/trang-thai` - Thống kê theo trạng thái

### Quản Lý Vụ Việc
- GET `/ho-so-vu-viec` - Danh sách vụ việc (có tìm kiếm, phân trang)
- GET `/ho-so-vu-viec/:id` - Chi tiết vụ việc
- POST `/ho-so-vu-viec` - Tạo mới vụ việc
- PATCH `/ho-so-vu-viec/:id` - Cập nhật vụ việc
- PATCH `/ho-so-vu-viec/:id/trang-thai` - Cập nhật trạng thái vụ việc
- DELETE `/ho-so-vu-viec/:id` - Xóa vụ việc
- GET `/ho-so-vu-viec/thong-ke/muc-do` - Thống kê theo mức độ
- GET `/ho-so-vu-viec/thong-ke/trang-thai` - Thống kê theo trạng thái
- GET `/ho-so-vu-viec/thong-ke/khu-vuc` - Thống kê theo khu vực
- GET `/ho-so-vu-viec/thong-ke/toim-danh` - Thống kê theo tội danh

### Quản Lý Tài Liệu
- POST `/tai-lieu/doi-tuong` - Upload tài liệu cho đối tượng
- GET `/tai-lieu/doi-tuong/:doiTuongId` - Lấy tài liệu của đối tượng
- DELETE `/tai-lieu/doi-tuong/:id` - Xóa tài liệu đối tượng
- POST `/tai-lieu/vu-viec` - Upload tài liệu cho vụ việc
- GET `/tai-lieu/vu-viec/:vuViecId` - Lấy tài liệu của vụ việc
- DELETE `/tai-lieu/vu-viec/:id` - Xóa tài liệu vụ việc
- GET `/tai-lieu/thong-ke` - Thống kê tài liệu

### Báo Cáo & Thống Kê (Dashboard)
- GET `/bao-cao/dashboard` - Dashboard tổng quan
- GET `/bao-cao/khu-vuc` - Báo cáo theo địa bàn
- GET `/bao-cao/toim-danh` - Báo cáo theo tội danh
- GET `/bao-cao/xu-huong` - Báo cáo xu hướng theo thời gian
- GET `/bao-cao/tien-do` - Báo cáo tiến độ xử lý
- GET `/bao-cao/tong-hop` - Xuất báo cáo tổng hợp

### Quản Lý Người Dùng (Admin)
- GET `/users` - Danh sách người dùng
- POST `/users` - Tạo người dùng mới
- PATCH `/users/:id` - Cập nhật người dùng
- DELETE `/users/:id` - Xóa người dùng

### Quản Lý Danh Mục
- GET `/don-vi-hanh-chinh` - Danh sách đơn vị hành chính
- GET `/toim-danh` - Danh sách tội danh
- GET `/quan-he-xa-hoi` - Danh sách quan hệ xã hội
- GET `/thong-bao` - Thông báo hệ thống
- GET `/cau-hinh-he-thong` - Cấu hình hệ thống

## Tính Năng Đã Triển Khai

✅ **Module Quản Lý Đối Tượng**
- CRUD đầy đủ
- Tìm kiếm đa tiêu chí (họ tên, CMND, giới tính, địa chỉ, nghề nghiệp...)
- Phân trang
- Thống kê theo khu vực và trạng thái
- Quản lý quan hệ giữa các đối tượng

✅ **Module Quản Lý Vụ Việc**
- CRUD đầy đủ
- Tìm kiếm theo số hồ sơ, tên vụ việc, trạng thái, mức độ...
- Liên kết với đối tượng và tội danh
- Lịch sử xử lý vụ việc
- Cập nhật trạng thái theo quy trình
- Thống kê đa chiều

✅ **Module Quản Lý Tài Liệu**
- Upload file (hình ảnh, video, tài liệu, chứng cứ)
- Quản lý tài liệu cho đối tượng
- Quản lý tài liệu cho vụ việc
- Xóa file vật lý khi xóa record

✅ **Module Báo Cáo & Thống Kê**
- Dashboard tổng quan
- Báo cáo theo địa bàn
- Báo cáo theo tội danh
- Báo cáo xu hướng theo thời gian
- Báo cáo tiến độ xử lý
- Xuất báo cáo tổng hợp

✅ **Module Quản Lý Danh Mục**
- Đơn vị hành chính (2 cấp)
- Tội danh
- Quan hệ xã hội
- Thông báo hệ thống
- Cấu hình hệ thống

✅ **Authentication & Authorization**
- JWT authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Login history tracking
- Token blacklist

## Cấu Trúc Thư Mục

```
src/
├── auth/               # Authentication module
├── backup/             # Backup module
├── decorator/          # Custom decorators
├── guard/              # Guards (auth, roles, permissions)
├── helper/             # Helper utilities
├── log/                # Logging modules
├── module/
│   ├── baoCao/         # Báo cáo & thống kê ⭐ MỚI
│   ├── bieuMau/        # Biểu mẫu
│   ├── cauHinhHeThong/ # Cấu hình hệ thống
│   ├── donVi/          # Đơn vị (phòng ban)
│   ├── donViHanhChinh/ # Đơn vị hành chính
│   ├── exports_/       # Export data
│   ├── hoSoDoiTuong/   # Quản lý đối tượng ⭐ MỚI
│   ├── hoSoVuViec/     # Quản lý vụ việc ⭐ MỚI
│   ├── kyHieu/         # Ký hiệu
│   ├── lichSuDangNhap/ # Lịch sử đăng nhập
│   ├── nguoiDung/      # Quản lý người dùng
│   ├── quanHeXaHoi/    # Quan hệ xã hội
│   ├── quyen/          # Quyền hạn
│   ├── taiLieu/        # Quản lý tài liệu ⭐ MỚI
│   ├── thongBao/       # Thông báo
│   ├── toimDanh/       # Tội danh
│   └── vaiTro/         # Vai trò
├── app.module.ts
├── main.ts
└── prisma.service.ts
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Lưu Ý Quan Trọng

1. **Bảo mật**: Trong production, cần thay đổi JWT_SECRET và password admin mặc định
2. **Upload Files**: Thư mục `uploads/` cần được tạo và có quyền ghi
3. **CORS**: Cấu hình CORS phù hợp trong `main.ts` khi deploy
4. **Environment**: Không commit file `.env` vào git

## Các Bước Tiếp Theo

1. ✅ Đã hoàn thành Backend API
2. 🚧 Xây dựng Frontend (React/Next.js)
3. 🔲 Tích hợp Chatbot AI
4. 🔲 Deploy lên server

## Liên Hệ & Hỗ Trợ

Nếu có vấn đề, liên hệ team phát triển.
