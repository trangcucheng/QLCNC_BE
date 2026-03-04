# Elasticsearch Quick Reference - Báo Cáo CDCS

## 🚀 Quick Start

```bash
# 1. Fix TypeScript errors (if any)
.\fix-elasticsearch-errors.ps1

# OR install dependencies manually
npm uninstall @nestjs/elasticsearch
npm install @nestjs/elasticsearch@^10.0.1
npm install

# 2. Start app (creates index automatically)
npm run start:dev

# 3. Sync all data
curl -X POST http://localhost:3000/bao-cao-doan-so-theo-ky/syncBaoCao \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bao-cao-doan-so-theo-ky/syncBaoCao` | Đồng bộ tất cả báo cáo |
| POST | `/bao-cao-doan-so-theo-ky/indicesBaoCao` | Xóa index |
| POST | `/bao-cao-doan-so-theo-ky/setMaxBaoCao` | Đặt max window |
| GET | `/bao-cao-doan-so-theo-ky/search-bao-cao` | Tìm kiếm |

## 🔍 Search Examples

```bash
# Basic search
GET /bao-cao-doan-so-theo-ky/search-bao-cao?search=báo%20cáo

# With pagination
GET /bao-cao-doan-so-theo-ky/search-bao-cao?search=test&page=2&limit=20

# Filter by type
GET /bao-cao-doan-so-theo-ky/search-bao-cao?filters[baoCao_loaiBaoCao]=dinh_ky

# Filter by status
GET /bao-cao-doan-so-theo-ky/search-bao-cao?filters[baoCao_trangThaiPheDuyet]=cho_phe_duyet

# Multiple filters
GET /bao-cao-doan-so-theo-ky/search-bao-cao?filters[baoCao_loaiBaoCao]=dinh_ky&filters[baoCao_organizationId]=1848

# Search with sorting
GET /bao-cao-doan-so-theo-ky/search-bao-cao?search=test&sortField=baoCao_createdAt&sortOrder=desc
```

## 📊 Available Filters

```javascript
filters: {
  baoCao_loaiBaoCao: "dinh_ky" | "dot_xuat",
  baoCao_trangThaiPheDuyet: "cho_phe_duyet" | "da_phe_duyet" | "tu_choi",
  baoCao_organizationId: number,
  baoCao_xaPhuongId: number,
  baoCao_cumKhuCnId: number,
  baoCao_thoiGianCapNhatDoanSoId: number,
  thoiGian_loaiKy: "hang_thang" | "hang_quy" | "hang_nam" | "dot_xuat"
}
```

## 🔎 Searchable Fields

- baoCao_tenBaoCao
- baoCao_noiDung
- baoCao_ghiChu
- thoiGian_ten
- thoiGian_moTa
- nguoiBaoCao_fullName
- nguoiBaoCao_email
- organization_name

## 📝 Response Format

```json
{
  "data": [
    {
      "_id": "32822",
      "baoCao_id": 32822,
      "baoCao_tenBaoCao": "Báo cáo",
      "baoCao_loaiBaoCao": "dinh_ky",
      "baoCao_trangThaiPheDuyet": "cho_phe_duyet",
      "baoCao_organizationId": 1848,
      "organization_name": "CĐCS TT kiểm soát bệnh tật tỉnh Bắc Ninh",
      "thoiGian_ten": "[ĐỘT XUẤT] Báo cáo tình hình đoàn viên dịp cuối năm",
      "nguoiBaoCao_fullName": "Nguyễn Khắc Từ"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

## ⚙️ Environment Variables

```env
ELASTICSEARCH_URL=http://localhost:9200
```

## 🔧 Maintenance Commands

```bash
# Delete index and recreate
POST /bao-cao-doan-so-theo-ky/indicesBaoCao
# Then restart app

# Full resync
POST /bao-cao-doan-so-theo-ky/syncBaoCao

# Set max result window
POST /bao-cao-doan-so-theo-ky/setMaxBaoCao
```

## 📂 File Structure

```
CDCS/
├── src/
│   ├── elastic/
│   │   ├── dto/
│   │   │   └── elastic.dto.ts
│   │   ├── mapping/
│   │   │   └── baoCao.mapping.ts
│   │   ├── elastic.constants.ts
│   │   ├── elastic.module.ts
│   │   └── elastic.service.ts
│   ├── HeThong/
│   │   └── bao-cao-doan-so-theo-ky/
│   │       ├── bao-cao-doan-so-theo-ky.controller.ts  ✅ Updated
│   │       ├── bao-cao-doan-so-theo-ky.service.ts     ✅ Updated
│   │       └── bao-cao-doan-so-theo-ky.module.ts      ✅ Updated
│   └── app.module.ts  ✅ Updated
├── elasticsearch/
│   └── mapping.json  ✅ Updated
└── package.json  ✅ Updated
```

## ✅ Implementation Checklist

- [x] Install @nestjs/elasticsearch
- [x] Create ElasticModule, ElasticService
- [x] Create baoCao.mapping.ts
- [x] Update mapping.json with missing fields
- [x] Add ElasticService to BaoCaoDoanSoTheoKyService
- [x] Implement sync methods
- [x] Add controller endpoints
- [x] Import ElasticModule in app.module.ts
- [x] Import ElasticModule in bao-cao-doan-so-theo-ky.module.ts

## 🎯 Next Steps (Optional)

1. **Auto-sync on CRUD**: Integrate Elasticsearch insert/update/delete in create/update/remove methods
2. **Export to Excel**: Use `dataExport()` method for Excel export
3. **Advanced Aggregations**: Implement facet/statistics APIs similar to QLKT
4. **Performance Monitoring**: Add logging and metrics

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| TypeScript compilation errors | Run `.\fix-elasticsearch-errors.ps1` |
| apache-arrow/flatbuffers errors | Update to @nestjs/elasticsearch@10.0.1 |
| Index not found | Restart app or call indicesBaoCao then syncBaoCao |
| Max window error | Call setMaxBaoCao endpoint |
| Connection refused | Check ELASTICSEARCH_URL in .env |
| Empty results | Run syncBaoCao to populate data |

### TypeScript Errors Fix

If you see errors like:
```
node_modules/apache-arrow/Arrow.d.ts:54:1 - error TS1383
node_modules/flatbuffers/js/utils.d.ts:1:29 - error TS2315
```

**Solution:**
```powershell
# Quick fix
.\fix-elasticsearch-errors.ps1

# Or manual fix
npm uninstall @nestjs/elasticsearch
npm install @nestjs/elasticsearch@^10.0.1
Remove-Item -Recurse -Force node_modules
npm install
```

## 📚 Documentation

See `ELASTICSEARCH_IMPLEMENTATION.md` for full documentation.
