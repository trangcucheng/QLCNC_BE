# Elasticsearch Implementation for Báo Cáo Công Đoàn Cơ Sở

## Tổng Quan

Đã tích hợp Elasticsearch vào hệ thống báo cáo công đoàn cơ sở (CDCS) tương tự như project QLKT_BE.

## Các Thay Đổi Đã Thực Hiện

### 1. Cập Nhật Mapping (elasticsearch/mapping.json)
✅ Đã thêm các trường còn thiếu:
- `loaiBaoCao` (keyword) - Loại báo cáo (dinh_ky, dot_xuat)
- `xaPhuongId` (integer)
- `cumKhuCnId` (integer)
- Các trường khác đã có sẵn: tongSoCongDoan, tongSoCnvcld, nguoiPheDuyetId, ngayPheDuyet

### 2. Cài Đặt Dependencies
✅ Đã thêm `@nestjs/elasticsearch` version 10.0.1 vào package.json (tương thích với NestJS 8.x)

### 3. TypeScript Configuration
✅ Đã cập nhật tsconfig.json:
- Thêm `skipLibCheck: true`
- Thêm `skipDefaultLibCheck: true`

### 4. Cấu Trúc Elasticsearch Module

Đã tạo các file trong `src/elastic/`:

```
src/elastic/
├── dto/
│   └── elastic.dto.ts          # DTO cho search và export
├── mapping/
│   └── baoCao.mapping.ts       # Mapping cho báo cáo
├── elastic.constants.ts         # Constants (ELASTIC_INDEX)
├── elastic.module.ts            # Module config
└── elastic.service.ts           # Service với các methods
```

### 4. Mapping Báo Cáo (baoCao.mapping.ts)

Mapping đầy đủ cho tất cả fields trong API response:

```typescript
baoCao_id, baoCao_tenBaoCao, baoCao_thoiGianCapNhatDoanSoId,
baoCao_nguoiBaoCaoId, baoCao_organizationId, baoCao_xaPhuongId,
baoCao_cumKhuCnId, baoCao_soLuongDoanVienNam, baoCao_soLuongDoanVienNu,
baoCao_soLuongCNVCLDNam, baoCao_soLuongCNVCLDNu, baoCao_tongSoCongDoan,
baoCao_tongSoCnvcld, baoCao_noiDung, baoCao_loaiBaoCao,
baoCao_trangThaiPheDuyet, baoCao_ghiChu, baoCao_createdAt,
baoCao_updatedAt, thoiGian_*, nguoiBaoCao_*, organization_*
```

## API Endpoints Mới

### 1. Đồng Bộ Dữ Liệu

**POST** `/bao-cao-doan-so-theo-ky/syncBaoCao`
- Đồng bộ tất cả báo cáo vào Elasticsearch
- Tự động phân trang (1000 records/lần)
- Authorization: Bearer Token required

```bash
curl -X POST http://localhost:3000/bao-cao-doan-so-theo-ky/syncBaoCao \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Xóa và Tạo Lại Index

**POST** `/bao-cao-doan-so-theo-ky/indicesBaoCao`
- Xóa index hiện tại
- Cần chạy lại syncBaoCao sau khi xóa index

```bash
curl -X POST http://localhost:3000/bao-cao-doan-so-theo-ky/indicesBaoCao \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Đặt Max Result Window

**POST** `/bao-cao-doan-so-theo-ky/setMaxBaoCao`
- Đặt max_result_window = 600,000
- Cho phép tìm kiếm số lượng lớn documents

```bash
curl -X POST http://localhost:3000/bao-cao-doan-so-theo-ky/setMaxBaoCao \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Tìm Kiếm Báo Cáo

**GET** `/bao-cao-doan-so-theo-ky/search-bao-cao`

Query Parameters:
- `search` (optional): Từ khóa tìm kiếm
- `page` (optional, default: 1): Số trang
- `limit` (optional, default: 10): Số records/trang
- `filters` (optional): Object chứa các filter
- `sortField` (optional): Trường sắp xếp
- `sortOrder` (optional): asc/desc

```bash
# Tìm kiếm cơ bản
curl -X GET "http://localhost:3000/bao-cao-doan-so-theo-ky/search-bao-cao?search=báo%20cáo&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Tìm kiếm với filters
curl -X GET "http://localhost:3000/bao-cao-doan-so-theo-ky/search-bao-cao?filters[baoCao_loaiBaoCao]=dinh_ky&filters[baoCao_trangThaiPheDuyet]=cho_phe_duyet" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response Format:
```json
{
  "data": [
    {
      "_id": "32822",
      "baoCao_id": 32822,
      "baoCao_tenBaoCao": "Báo cáo",
      "baoCao_loaiBaoCao": "dinh_ky",
      "baoCao_trangThaiPheDuyet": "cho_phe_duyet",
      ...
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Service Methods

### BaoCaoDoanSoTheoKyService

```typescript
// Lấy dữ liệu theo trang để sync
async getDataPage(skip: number, take: number)

// Đồng bộ tất cả báo cáo
async syncBaoCao()

// Xóa index
async indicesBaoCao()

// Đặt max result window
async setMaxBaoCao()

// Tìm kiếm
async searchBaoCao(payload: ElasticSearchDto)
```

## ElasticService Methods

```typescript
// Core methods
async insert(index, entity, id)
async update(index, id, data)
async delete(index, id)
async bulkInsert(index, data, getId)

// Index management
async createIndexIfNotExist(index, mapping)
async indicesIndex(index)
async setMax(index, maxResultWindow)

// Sync
async syncIncrementalToElastic(indexName, getDataPage, getId, transform, pageSize)

// Search
async searchElasticTable(index, dto, searchFields, sortField, sortOrder)
async dataExport(index, dto, sortField, sortOrder)
```

## Cấu Hình Elasticsearch

Thêm vào `.env`:
```env
ELASTICSEARCH_URL=http://localhost:9200
```

## Hướng Dẫn Sử Dụng

### 1. Cài Đặt Dependencies

**Quick Fix (nếu gặp lỗi TypeScript):**
```powershell
.\fix-elasticsearch-errors.ps1
```

**Hoặc thủ công:**
```bash
cd "f:\DUAN\Quản lý công đoàn cơ sở\Code\CDCS"

# Uninstall old version (if exists)
npm uninstall @nestjs/elasticsearch

# Install compatible version
npm install @nestjs/elasticsearch@^10.0.1

# Clear and rebuild
npm run prebuild
npm install
```

**Lưu ý:** Đã cập nhật `tsconfig.json` với:
- `skipLibCheck: true` - Bỏ qua kiểm tra type trong node_modules
- `skipDefaultLibCheck: true` - Bỏ qua kiểm tra default lib files

### 2. Khởi Động Elasticsearch

Đảm bảo Elasticsearch đang chạy tại `http://localhost:9200`

### 3. Khởi Động Application

```bash
npm run start:dev
```

Khi app khởi động, index `bao-cao-doan-so` sẽ tự động được tạo.

### 4. Đồng Bộ Dữ Liệu Lần Đầu

```bash
# Gọi API sync
POST /bao-cao-doan-so-theo-ky/syncBaoCao

# Đặt max result window (optional)
POST /bao-cao-doan-so-theo-ky/setMaxBaoCao
```

### 5. Sử Dụng Tìm Kiếm

```bash
GET /bao-cao-doan-so-theo-ky/search-bao-cao?search=keyword&page=1&limit=10
```

## Search Fields

Các trường có thể tìm kiếm:
- baoCao_tenBaoCao
- baoCao_noiDung
- baoCao_ghiChu
- thoiGian_ten
- thoiGian_moTa
- nguoiBaoCao_fullName
- nguoiBaoCao_email
- organization_name

## Filter Fields

Có thể filter theo:
- baoCao_loaiBaoCao (dinh_ky, dot_xuat)
- baoCao_trangThaiPheDuyet (cho_phe_duyet, da_phe_duyet, tu_choi)
- baoCao_organizationId
- baoCao_xaPhuongId
- baoCao_cumKhuCnId
- baoCao_thoiGianCapNhatDoanSoId
- thoiGian_loaiKy

## So Sánh Với QLKT_BE

| Feature | QLKT_BE (ThietBi) | CDCS (BaoCao) |
|---------|-------------------|----------------|
| Index Name | `thiet-bi` | `bao-cao-doan-so` |
| Sync Method | `syncAmThietBi()` | `syncBaoCao()` |
| Index Method | `indicesThietBi()` | `indicesBaoCao()` |
| Search Method | `searchAmThietBi()` | `searchBaoCao()` |
| Mapping File | `amThietBi.mapping.ts` | `baoCao.mapping.ts` |

## Lưu Ý

1. **Vietnamese Analyzer**: Tất cả text fields sử dụng `vietnamese_analyzer` cho tìm kiếm tiếng Việt tốt hơn

2. **Keyword Fields**: Các trường có `.keyword` subfield để exact matching và sorting

3. **Date Format**: Hỗ trợ `strict_date_optional_time` và `epoch_millis`

4. **Auto-sync**: Không có auto-sync. Cần gọi API sync thủ công sau khi thêm/sửa/xóa dữ liệu (hoặc tích hợp vào service methods create/update/delete)

## Tích Hợp Auto-sync (Tùy Chọn)

Nếu muốn tự động sync sau mỗi thao tác CRUD, thêm vào các methods trong service:

```typescript
// Trong create()
const saved = await this.baoCaoDoanSoTheoKyRepository.save(...);
await this.elasticService.insert(ELASTIC_INDEX.BAO_CAO, fullData, saved.id);

// Trong update()
await this.baoCaoDoanSoTheoKyRepository.update(...);
await this.elasticService.update(ELASTIC_INDEX.BAO_CAO, id, fullData);

// Trong delete()
await this.baoCaoDoanSoTheoKyRepository.delete(id);
await this.elasticService.delete(ELASTIC_INDEX.BAO_CAO, id.toString());
```

## Troubleshooting

### Index không tồn tại
```bash
POST /bao-cao-doan-so-theo-ky/indicesBaoCao  # Xóa index cũ
# Restart app để tạo index mới
POST /bao-cao-doan-so-theo-ky/syncBaoCao     # Sync lại data
```

### Max result window error
```bash
POST /bao-cao-doan-so-theo-ky/setMaxBaoCao
```

### Elasticsearch không kết nối được
Kiểm tra `ELASTICSEARCH_URL` trong `.env` và đảm bảo Elasticsearch đang chạy
