# Hướng dẫn cập nhật trường fileAnh cho HoSoDoiTuong

## Các thay đổi đã thực hiện

### Backend
1. **Prisma Schema** (`prisma/schema.prisma`):
   - Thêm trường `fileAnh String[] @default([])` vào model `HoSoDoiTuong`
   - Trường này lưu mảng đường dẫn ảnh của đối tượng

2. **Migration** (`prisma/migrations/20260402000000_them_truong_file_anh/migration.sql`):
   - Tạo migration SQL để thêm cột `fileAnh` vào table `HoSoDoiTuong`
   - Mặc định là mảng rỗng cho các bản ghi hiện tại

3. **DTO**:
   - `dto/create-ho-so-doi-tuong.dto.ts`: Thêm `fileAnh?: string[]`
   - `dto/update-ho-so-doi-tuong.dto.ts`: Tự động kế thừa từ CreateDTO

4. **Controller** (`ho-so-doi-tuong.controller.ts`):
   - Thêm endpoint `POST /:id/upload-anh` để upload nhiều ảnh
   - Sử dụng `FilesInterceptor` với max 10 files
   - Giới hạn: 5MB/file, định dạng: jpg, png, webp
   - Lưu vào thư mục `uploads/doi-tuong/`

5. **Service** (`ho-so-doi-tuong.service.ts`):
   - Thêm method `uploadAnh(id, fileUrls)`: Append ảnh mới vào mảng hiện tại
   - Không ghi đè ảnh cũ

### Frontend
1. **API Client** (`src/lib/api.ts`):
   - Thêm method `hoSoDoiTuongApi.uploadAnh(id, files[])`
   - Sử dụng FormData để upload

2. **Types** (`src/types/index.ts`):
   - Thêm `fileAnh?: string[]` vào interface `HoSoDoiTuong`

3. **Trang thêm mới** (`src/app/admin/doi-tuong/them-moi/page.tsx`):
   - Thêm Ant Design Upload component
   - Upload tối đa 10 ảnh
   - Sau khi tạo đối tượng thành công, tự động upload ảnh

4. **Trang chi tiết** (`src/app/admin/doi-tuong/[id]/page.tsx`):
   - Hiển thị gallery ảnh dạng grid 4 cột
   - Nút "Thêm ảnh" để upload thêm
   - Click ảnh để xem full size

## Các bước để chạy

### 1. Chạy migration database
\`\`\`bash
cd QLCNC_BE
npx prisma migrate deploy
# Hoặc để tạo migration mới (development):
npx prisma migrate dev
\`\`\`

### 2. Generate Prisma Client
\`\`\`bash
npx prisma generate
\`\`\`

**Lưu ý**: Bước này RẤT QUAN TRỌNG để TypeScript types được cập nhật!

### 3. Tạo thư mục uploads
Thư mục `uploads/doi-tuong/` đã được tạo với file `.gitkeep`

### 4. Khởi động lại servers
\`\`\`bash
# Backend
cd QLCNC_BE
npm run start:dev

# Frontend
cd QLCNC_FE
npm run dev
\`\`\`

## Kiểm tra lỗi TypeScript

Sau khi chạy `prisma generate`, các lỗi TypeScript trong `ho-so-doi-tuong.service.ts` sẽ tự động biến mất vì Prisma sẽ generate types cho trường `fileAnh`.

## Sử dụng

### Upload ảnh khi thêm đối tượng mới:
1. Vào trang `/admin/doi-tuong/them-moi`
2. Điền thông tin đối tượng
3. Ở section "Ảnh đối tượng", click vào ô upload hoặc kéo thả ảnh
4. Chọn tối đa 10 ảnh
5. Click "Thêm đối tượng"

### Upload thêm ảnh cho đối tượng hiện tại:
1. Vào trang chi tiết đối tượng `/admin/doi-tuong/[id]`
2. Tìm section "Ảnh đối tượng"
3. Click nút "📷 Thêm ảnh"
4. Chọn ảnh và upload

### API Endpoint:
- **POST** `/ho-so-doi-tuong/:id/upload-anh`
- Body: FormData với key `files` (multiple files)
- Response: Đối tượng đã được cập nhật với mảng `fileAnh` mới

## Lưu ý
- Ảnh sẽ được lưu vào thư mục `uploads/doi-tuong/` với tên file unique
- Mỗi ảnh tối đa 5MB
- Định dạng hỗ trợ: JPG, PNG, WEBP
- Upload tối đa 10 ảnh/lần
- Ảnh cũ không bị xóa khi upload ảnh mới (append mode)
