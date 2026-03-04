# API Kỳ Báo Cáo Định Kỳ - Hướng Dẫn Sử Dụng

## 📌 Tổng Quan

Hệ thống hỗ trợ 4 loại kỳ báo cáo:
- **Hàng tháng** (`hang_thang`): Lặp lại mỗi tháng
- **Hàng quý** (`hang_quy`): Lặp lại mỗi quý (3 tháng)
- **Hàng năm** (`hang_nam`): Lặp lại mỗi năm  
- **Đột xuất** (`dot_xuat`): Chỉ 1 lần

---

## 🚀 API Endpoints

### 1. Tạo Kỳ Báo Cáo

**POST** `/thoi-gian-cap-nhat-doan-so/create`

#### 1.1 Tạo Báo Cáo Hàng Tháng

```json
{
  "ten": "Báo cáo đoàn số đầu tháng",
  "loaiKy": "hang_thang",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 5,
  "namBatDau": 2024,
  "namKetThuc": null,
  "moTa": "Báo cáo từ ngày 1-5 hàng tháng",
  "isActive": true
}
```

**Kết quả:** Mỗi tháng từ ngày 1-5 phải báo cáo

#### 1.2 Tạo Báo Cáo Hàng Quý

```json
{
  "ten": "Báo cáo quý",
  "loaiKy": "hang_quy",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 15,
  "cacThangApDung": [1, 4, 7, 10],
  "namBatDau": 2024,
  "moTa": "Báo cáo đầu quý từ ngày 1-15",
  "isActive": true
}
```

**Kết quả:** 
- Quý 1: 01/01 - 15/01
- Quý 2: 01/04 - 15/04
- Quý 3: 01/07 - 15/07
- Quý 4: 01/10 - 15/10

**Lưu ý:** `cacThangApDung` là tháng đầu tiên của mỗi quý

#### 1.3 Tạo Báo Cáo Cuối Năm

```json
{
  "ten": "Báo cáo tổng kết năm",
  "loaiKy": "hang_nam",
  "ngayBatDauTrongThang": 20,
  "ngayKetThucTrongThang": 31,
  "thangBatDau": 12,
  "namBatDau": 2024,
  "moTa": "Báo cáo cuối năm từ 20/12-31/12",
  "isActive": true
}
```

**Kết quả:** Mỗi năm từ 20/12 - 31/12

#### 1.4 Tạo Báo Cáo Đột Xuất

```json
{
  "ten": "Báo cáo đột xuất tháng 5",
  "loaiKy": "dot_xuat",
  "thoiGianBatDau": "2024-05-15T00:00:00.000Z",
  "thoiGianKetThuc": "2024-05-20T23:59:59.000Z",
  "moTa": "Báo cáo đặc biệt",
  "isActive": true
}
```

**Kết quả:** Chỉ 1 lần từ 15/05/2024 - 20/05/2024

---

### 2. Lấy Kỳ Báo Cáo Hiện Tại

**GET** `/thoi-gian-cap-nhat-doan-so/ky-bao-cao/hien-tai/:id`

**Params:**
- `id`: ID của cấu hình kỳ báo cáo

**Response:**
```json
{
  "id": 1,
  "ten": "Báo cáo đoàn số hàng tháng",
  "loaiKy": "hang_thang",
  "kyHienTai": {
    "tenKy": "Tháng 10/2024",
    "thoiGianBatDau": "2024-10-01T00:00:00.000Z",
    "thoiGianKetThuc": "2024-10-05T23:59:59.000Z",
    "thang": 10,
    "nam": 2024,
    "dangDienRa": true,
    "daQuaHan": false
  }
}
```

**Use case:**
- Hiển thị kỳ báo cáo hiện tại cho user
- Kiểm tra có đang trong thời gian báo cáo không
- Countdown thời gian còn lại

---

### 3. Lấy Tất Cả Kỳ Báo Cáo Trong Năm

**GET** `/thoi-gian-cap-nhat-doan-so/ky-bao-cao/theo-nam`

**Query Params:**
- `thoiGianCapNhatDoanSoId` (required): ID cấu hình
- `nam` (optional): Năm cần lấy (mặc định: năm hiện tại)

**Example:**
```
GET /thoi-gian-cap-nhat-doan-so/ky-bao-cao/theo-nam?thoiGianCapNhatDoanSoId=1&nam=2024
```

**Response:**
```json
{
  "id": 1,
  "ten": "Báo cáo đoàn số hàng tháng",
  "loaiKy": "hang_thang",
  "nam": 2024,
  "cacKyBaoCao": [
    {
      "tenKy": "Tháng 1/2024",
      "thoiGianBatDau": "2024-01-01T00:00:00.000Z",
      "thoiGianKetThuc": "2024-01-05T23:59:59.000Z",
      "thang": 1,
      "nam": 2024,
      "dangDienRa": false,
      "daQuaHan": true
    },
    {
      "tenKy": "Tháng 2/2024",
      "thoiGianBatDau": "2024-02-01T00:00:00.000Z",
      "thoiGianKetThuc": "2024-02-05T23:59:59.000Z",
      "thang": 2,
      "nam": 2024,
      "dangDienRa": false,
      "daQuaHan": true
    },
    // ... 10 kỳ còn lại
  ]
}
```

**Use case:**
- Hiển thị lịch báo cáo cả năm
- Dashboard thống kê các kỳ đã/chưa báo cáo
- Export báo cáo theo từng kỳ trong năm

---

## 📊 Ví Dụ Thực Tế

### Scenario 1: Báo Cáo Hàng Tháng

**Yêu cầu:** Mỗi tháng từ ngày 1-5 phải nộp báo cáo

**1. Tạo cấu hình:**
```bash
POST /thoi-gian-cap-nhat-doan-so/create
{
  "ten": "Báo cáo tháng",
  "loaiKy": "hang_thang",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 5,
  "namBatDau": 2024,
  "isActive": true
}
```

**2. Lấy kỳ hiện tại:**
```bash
GET /thoi-gian-cap-nhat-doan-so/ky-bao-cao/hien-tai/1
# → Tháng 10/2024: 01/10 - 05/10
```

**3. Xem lịch cả năm:**
```bash
GET /thoi-gian-cap-nhat-doan-so/ky-bao-cao/theo-nam?thoiGianCapNhatDoanSoId=1&nam=2024
# → 12 kỳ từ T1-T12/2024
```

---

### Scenario 2: Báo Cáo Hàng Quý (Cuối Quý)

**Yêu cầu:** Cuối mỗi quý từ ngày 25 - cuối tháng phải nộp báo cáo

**1. Tạo cấu hình:**
```bash
POST /thoi-gian-cap-nhat-doan-so/create
{
  "ten": "Báo cáo cuối quý",
  "loaiKy": "hang_quy",
  "ngayBatDauTrongThang": 25,
  "ngayKetThucTrongThang": 31,
  "cacThangApDung": [3, 6, 9, 12],
  "namBatDau": 2024,
  "isActive": true
}
```

**Kết quả:**
- Quý 1: 25/03 - 31/03
- Quý 2: 25/06 - 30/06
- Quý 3: 25/09 - 30/09
- Quý 4: 25/12 - 31/12

---

### Scenario 3: Kết Hợp Nhiều Loại

Một tổ chức có thể có nhiều cấu hình:

```json
[
  {
    "id": 1,
    "ten": "Báo cáo hàng tháng",
    "loaiKy": "hang_thang",
    "ngayBatDauTrongThang": 1,
    "ngayKetThucTrongThang": 5
  },
  {
    "id": 2,
    "ten": "Báo cáo quý",
    "loaiKy": "hang_quy",
    "ngayBatDauTrongThang": 1,
    "ngayKetThucTrongThang": 15,
    "cacThangApDung": [1, 4, 7, 10]
  },
  {
    "id": 3,
    "ten": "Báo cáo tổng kết năm",
    "loaiKy": "hang_nam",
    "thangBatDau": 12,
    "ngayBatDauTrongThang": 20,
    "ngayKetThucTrongThang": 31
  }
]
```

---

## ⚙️ Validation Rules

| Loại | Trường Bắt Buộc | Trường Không Cần |
|------|-----------------|------------------|
| `hang_thang` | `ngayBatDauTrongThang`, `ngayKetThucTrongThang`, `namBatDau` | `thoiGianBatDau`, `thoiGianKetThuc`, `cacThangApDung`, `thangBatDau` |
| `hang_quy` | `ngayBatDauTrongThang`, `ngayKetThucTrongThang`, `cacThangApDung`, `namBatDau` | `thoiGianBatDau`, `thoiGianKetThuc`, `thangBatDau` |
| `hang_nam` | `ngayBatDauTrongThang`, `ngayKetThucTrongThang`, `thangBatDau`, `namBatDau` | `thoiGianBatDau`, `thoiGianKetThuc`, `cacThangApDung` |
| `dot_xuat` | `thoiGianBatDau`, `thoiGianKetThuc` | Tất cả trường định kỳ |

---

## 🔧 Migration

Chạy migration để cập nhật database:

```bash
npm run migration:run
```

---

## 💡 Tips

1. **Năm kết thúc:** Để `null` hoặc không truyền nếu muốn kỳ báo cáo lặp vô thời hạn

2. **Tháng 31 ngày:** Hệ thống tự động xử lý các tháng có ít hơn 31 ngày
   - Tháng 2: Ngày 31 → 28/29
   - Tháng 4,6,9,11: Ngày 31 → 30

3. **Quý tài chính:** Có thể tùy chỉnh `cacThangApDung`
   - Quý dương lịch: `[1,4,7,10]`
   - Quý tài chính: `[4,7,10,1]` (bắt đầu từ tháng 4)
   - Quý tùy chỉnh: `[2,5,8,11]`

4. **Kết hợp tracking:** Dùng với API tracking để biết CĐCS nào đã/chưa báo cáo trong từng kỳ

---

## 🎯 Integration với Tracking API

Sau khi có kỳ báo cáo, dùng tracking API để theo dõi:

```bash
# 1. Lấy kỳ hiện tại
GET /thoi-gian-cap-nhat-doan-so/ky-bao-cao/hien-tai/1
# → kyHienTai.id = "Tháng 10/2024"

# 2. Tracking báo cáo theo kỳ (sử dụng id gốc của cấu hình)
GET /bao-cao-doan-so-theo-ky/tracking/trang-thai?thoiGianCapNhatDoanSoId=1&page=1&limit=20
# → Danh sách CĐCS đã/chưa báo cáo

# 3. Thống kê tổng quan
GET /bao-cao-doan-so-theo-ky/tracking/thong-ke?thoiGianCapNhatDoanSoId=1
# → Số liệu: đã báo cáo, chưa báo cáo, quá hạn, v.v.
```

**Lưu ý:** API tracking vẫn dùng `thoiGianCapNhatDoanSoId` (ID cấu hình), hệ thống tự động tính kỳ hiện tại
