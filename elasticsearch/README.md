# Elasticsearch Setup cho Báo Cáo Đoàn Số Theo Kỳ

## Cấu trúc Index

Index name: `bao_cao_doan_so_theo_ky`

## Khởi động Elasticsearch và Kibana

```bash
# Khởi động tất cả services
docker-compose up -d

# Kiểm tra trạng thái
docker-compose ps

# Xem logs
docker-compose logs -f elasticsearch
docker-compose logs -f kibana
```

## Tạo Index và Mapping

### Cách 1: Sử dụng script tự động (Linux/Mac)

```bash
chmod +x elasticsearch/create-index.sh
./elasticsearch/create-index.sh
```

### Cách 2: Sử dụng PowerShell (Windows)

```powershell
# Đợi Elasticsearch khởi động
Start-Sleep -Seconds 30

# Xóa index cũ (nếu có)
Invoke-WebRequest -Uri "http://localhost:9200/bao_cao_doan_so_theo_ky" -Method DELETE

# Tạo index mới với mapping
$mapping = Get-Content -Path "elasticsearch/mapping.json" -Raw
Invoke-WebRequest -Uri "http://localhost:9200/bao_cao_doan_so_theo_ky" `
  -Method PUT `
  -ContentType "application/json" `
  -Body $mapping
```

### Cách 3: Sử dụng curl

```bash
# Xóa index cũ
curl -X DELETE "http://localhost:9200/bao_cao_doan_so_theo_ky?ignore_unavailable=true"

# Tạo index mới
curl -X PUT "http://localhost:9200/bao_cao_doan_so_theo_ky" \
  -H 'Content-Type: application/json' \
  -d @elasticsearch/mapping.json
```

## Kiểm tra Index

```bash
# Xem thông tin index
curl http://localhost:9200/bao_cao_doan_so_theo_ky

# Xem mapping
curl http://localhost:9200/bao_cao_doan_so_theo_ky/_mapping

# Xem settings
curl http://localhost:9200/bao_cao_doan_so_theo_ky/_settings
```

## Truy cập Kibana

URL: http://localhost:5601

### Tạo Index Pattern trong Kibana

1. Truy cập Kibana UI
2. Vào **Management > Stack Management > Index Patterns**
3. Click **Create index pattern**
4. Nhập: `bao_cao_doan_so_theo_ky`
5. Chọn time field: `createdAt`
6. Click **Create index pattern**

## Mapping Fields Chi Tiết

### Fields Chính

| Field | Type | Description |
|-------|------|-------------|
| id | integer | ID báo cáo |
| tenBaoCao | text | Tên báo cáo (có keyword subfield) |
| loaiBaoCao | keyword | Loại: dinh_ky hoặc dot_xuat |
| thoiGianCapNhatDoanSoId | integer | ID thời gian cập nhật |
| nguoiBaoCaoId | keyword | ID người báo cáo |
| organizationId | integer | ID tổ chức |
| xaPhuongId | integer | ID xã phường |
| cumKhuCnId | integer | ID cụm khu công nghiệp |
| soLuongDoanVienNam | integer | Số đoàn viên nam |
| soLuongDoanVienNu | integer | Số đoàn viên nữ |
| soLuongCNVCLDNam | integer | Số CNVCLĐ nam |
| soLuongCNVCLDNu | integer | Số CNVCLĐ nữ |
| tongSoCongDoan | integer | Tổng số công đoàn |
| tongSoCnvcld | integer | Tổng số CNVCLĐ |
| noiDung | text | Nội dung báo cáo |
| trangThaiPheDuyet | keyword | Trạng thái: cho_phe_duyet, da_phe_duyet, tu_choi |
| ghiChu | text | Ghi chú |
| nguoiPheDuyetId | keyword | ID người phê duyệt |
| ngayPheDuyet | date | Ngày phê duyệt |
| createdAt | date | Ngày tạo |
| updatedAt | date | Ngày cập nhật |

### Nested Objects

#### thoiGian
- id (integer)
- ten (text with keyword)
- thoiGianBatDau (date)
- thoiGianKetThuc (date)
- moTa (text)
- loaiKy (keyword)

#### nguoiBaoCao
- id (keyword)
- fullName (text with keyword)
- email (keyword)

#### organization
- id (integer)
- name (text with keyword)

## Query Examples

### Tìm kiếm báo cáo theo tên

```json
GET /bao_cao_doan_so_theo_ky/_search
{
  "query": {
    "match": {
      "tenBaoCao": "báo cáo tháng 11"
    }
  }
}
```

### Lọc theo trạng thái

```json
GET /bao_cao_doan_so_theo_ky/_search
{
  "query": {
    "term": {
      "trangThaiPheDuyet": "cho_phe_duyet"
    }
  }
}
```

### Tìm kiếm full-text

```json
GET /bao_cao_doan_so_theo_ky/_search
{
  "query": {
    "multi_match": {
      "query": "công đoàn",
      "fields": ["tenBaoCao", "noiDung", "ghiChu", "organization.name"]
    }
  }
}
```

### Aggregation theo organization

```json
GET /bao_cao_doan_so_theo_ky/_search
{
  "size": 0,
  "aggs": {
    "by_organization": {
      "terms": {
        "field": "organization.name.keyword"
      }
    }
  }
}
```

## Troubleshooting

### Elasticsearch không khởi động
```bash
# Kiểm tra logs
docker-compose logs elasticsearch

# Tăng memory nếu cần
# Sửa ES_JAVA_OPTS trong docker-compose.yml
```

### Không thể tạo index
```bash
# Kiểm tra Elasticsearch đã sẵn sàng
curl http://localhost:9200/_cluster/health

# Xem tất cả indices
curl http://localhost:9200/_cat/indices?v
```

### Kibana không kết nối được Elasticsearch
```bash
# Kiểm tra network
docker network inspect cdcs_network

# Restart Kibana
docker-compose restart kibana
```

## Dừng Services

```bash
# Dừng tất cả
docker-compose down

# Dừng và xóa volumes (⚠️ mất data)
docker-compose down -v
```
