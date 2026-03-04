# Hướng Dẫn Cấu Hình Kỳ Báo Cáo Định Kỳ

## 📋 Tổng Quan

Hệ thống hỗ trợ 4 loại kỳ báo cáo:

| Loại | Giá trị Enum | Mô tả |
|------|-------------|-------|
| **Hàng tháng** | `hang_thang` | Lặp lại mỗi tháng với khoảng ngày cố định |
| **Hàng quý** | `hang_quy` | Lặp lại mỗi quý (3 tháng) với khoảng ngày cố định |
| **Hàng năm** | `hang_nam` | Lặp lại mỗi năm với khoảng ngày cố định |
| **Đột xuất** | `dot_xuat` | Chỉ diễn ra 1 lần trong khoảng thời gian cụ thể |

---

## 🎯 Cấu Trúc Database

### Entity Fields

```typescript
export class ThoiGianCapNhatDoanSo {
  id: number;
  ten: string;                        // Tên kỳ báo cáo
  loaiKy: LoaiKyBaoCao;              // Loại: hang_thang, hang_quy, hang_nam, dot_xuat
  
  // ===== Định kỳ =====
  ngayBatDauTrongThang: number;      // Ngày bắt đầu trong tháng (1-31)
  ngayKetThucTrongThang: number;     // Ngày kết thúc trong tháng (1-31)
  thangBatDau: number;               // Tháng bắt đầu áp dụng (1-12)
  namBatDau: number;                 // Năm bắt đầu
  namKetThuc: number;                // Năm kết thúc (null = vô thời hạn)
  cacThangApDung: number[];          // Các tháng áp dụng (cho hàng quý)
  
  // ===== Đột xuất =====
  thoiGianBatDau: Date;              // Thời gian bắt đầu cụ thể
  thoiGianKetThuc: Date;             // Thời gian kết thúc cụ thể
  
  moTa: string;
  isActive: boolean;
}
```

---

## 💡 Ví Dụ Cấu Hình

### 1. Báo Cáo Hàng Tháng

**Yêu cầu:** Mỗi tháng từ ngày 1-5 phải nộp báo cáo đoàn số

```json
{
  "ten": "Báo cáo đoàn số hàng tháng",
  "loaiKy": "hang_thang",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 5,
  "namBatDau": 2024,
  "namKetThuc": null,
  "isActive": true
}
```

**Kết quả:**
- Tháng 1/2024: 01/01/2024 - 05/01/2024
- Tháng 2/2024: 01/02/2024 - 05/02/2024
- Tháng 3/2024: 01/03/2024 - 05/03/2024
- ... (cứ thế lặp lại mỗi tháng)

---

### 2. Báo Cáo Hàng Quý

**Yêu cầu:** Mỗi quý từ ngày 1-10 của tháng đầu quý phải nộp báo cáo

```json
{
  "ten": "Báo cáo đoàn số hàng quý",
  "loaiKy": "hang_quy",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 10,
  "cacThangApDung": [1, 4, 7, 10],
  "namBatDau": 2024,
  "namKetThuc": null,
  "isActive": true
}
```

**Kết quả:**
- Quý 1/2024: 01/01/2024 - 10/01/2024 (tháng 1)
- Quý 2/2024: 01/04/2024 - 10/04/2024 (tháng 4)
- Quý 3/2024: 01/07/2024 - 10/07/2024 (tháng 7)
- Quý 4/2024: 01/10/2024 - 10/10/2024 (tháng 10)

**Cách hoạt động:**
- `cacThangApDung: [1, 4, 7, 10]` = Áp dụng vào tháng 1, 4, 7, 10
- `ngayBatDauTrongThang: 1` = Ngày 1 của các tháng đó
- `ngayKetThucTrongThang: 10` = Ngày 10 của các tháng đó

---

### 3. Báo Cáo Cuối Năm

**Yêu cầu:** Mỗi năm từ ngày 20/12 đến 31/12 phải nộp báo cáo tổng kết

```json
{
  "ten": "Báo cáo tổng kết cuối năm",
  "loaiKy": "hang_nam",
  "ngayBatDauTrongThang": 20,
  "ngayKetThucTrongThang": 31,
  "thangBatDau": 12,
  "namBatDau": 2024,
  "namKetThuc": null,
  "isActive": true
}
```

**Kết quả:**
- Năm 2024: 20/12/2024 - 31/12/2024
- Năm 2025: 20/12/2025 - 31/12/2025
- Năm 2026: 20/12/2026 - 31/12/2026
- ...

---

### 4. Báo Cáo Đột Xuất

**Yêu cầu:** Một đợt báo cáo đặc biệt từ 15/05/2024 đến 20/05/2024

```json
{
  "ten": "Báo cáo đột xuất tháng 5",
  "loaiKy": "dot_xuat",
  "thoiGianBatDau": "2024-05-15T00:00:00",
  "thoiGianKetThuc": "2024-05-20T23:59:59",
  "isActive": true
}
```

**Kết quả:**
- Chỉ diễn ra 1 lần: 15/05/2024 - 20/05/2024

---

## 🔧 Logic Tính Toán Thời Gian

### Service Method Gợi Ý

```typescript
// Service để tính thời gian báo cáo hiện tại
getCurrentPeriod(thoiGianCapNhat: ThoiGianCapNhatDoanSo, currentDate: Date = new Date()) {
  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.DOT_XUAT) {
    // Đột xuất: Trả về thời gian cố định
    return {
      batDau: thoiGianCapNhat.thoiGianBatDau,
      ketThuc: thoiGianCapNhat.thoiGianKetThuc
    };
  }

  // Định kỳ: Tính toán dựa trên currentDate
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.HANG_THANG) {
    // Hàng tháng
    return {
      batDau: new Date(year, month - 1, thoiGianCapNhat.ngayBatDauTrongThang),
      ketThuc: new Date(year, month - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59)
    };
  }

  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.HANG_QUY) {
    // Hàng quý: Tìm tháng gần nhất trong cacThangApDung
    const thangHienTai = thoiGianCapNhat.cacThangApDung.find(t => t >= month) || thoiGianCapNhat.cacThangApDung[0];
    return {
      batDau: new Date(year, thangHienTai - 1, thoiGianCapNhat.ngayBatDauTrongThang),
      ketThuc: new Date(year, thangHienTai - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59)
    };
  }

  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.HANG_NAM) {
    // Hàng năm
    return {
      batDau: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayBatDauTrongThang),
      ketThuc: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59)
    };
  }
}

// Lấy tất cả kỳ báo cáo đang active trong năm
getActivePeriods(thoiGianCapNhat: ThoiGianCapNhatDoanSo, year: number) {
  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.DOT_XUAT) {
    return [{
      batDau: thoiGianCapNhat.thoiGianBatDau,
      ketThuc: thoiGianCapNhat.thoiGianKetThuc
    }];
  }

  const periods = [];

  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.HANG_THANG) {
    // 12 tháng
    for (let month = 1; month <= 12; month++) {
      periods.push({
        batDau: new Date(year, month - 1, thoiGianCapNhat.ngayBatDauTrongThang),
        ketThuc: new Date(year, month - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59)
      });
    }
  }

  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.HANG_QUY) {
    // Các tháng trong cacThangApDung
    thoiGianCapNhat.cacThangApDung.forEach(month => {
      periods.push({
        batDau: new Date(year, month - 1, thoiGianCapNhat.ngayBatDauTrongThang),
        ketThuc: new Date(year, month - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59)
      });
    });
  }

  if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.HANG_NAM) {
    // 1 kỳ trong năm
    periods.push({
      batDau: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayBatDauTrongThang),
      ketThuc: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59)
    });
  }

  return periods;
}
```

---

## 📊 Ví Dụ Sử dụng API

### Tạo kỳ báo cáo hàng tháng

```bash
POST /api/thoi-gian-cap-nhat-doan-so
{
  "ten": "Báo cáo đoàn số đầu tháng",
  "loaiKy": "hang_thang",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 5,
  "namBatDau": 2024,
  "moTa": "Báo cáo đoàn số từ ngày 1-5 hàng tháng",
  "isActive": true
}
```

### Tạo kỳ báo cáo hàng quý

```bash
POST /api/thoi-gian-cap-nhat-doan-so
{
  "ten": "Báo cáo quý",
  "loaiKy": "hang_quy",
  "ngayBatDauTrongThang": 1,
  "ngayKetThucTrongThang": 15,
  "cacThangApDung": [3, 6, 9, 12],
  "namBatDau": 2024,
  "moTa": "Báo cáo cuối quý từ ngày 1-15 của tháng 3, 6, 9, 12",
  "isActive": true
}
```

---

## ✅ Validation Rules

### Hàng tháng (`hang_thang`)
- **Bắt buộc**: `ngayBatDauTrongThang`, `ngayKetThucTrongThang`, `namBatDau`
- **Không cần**: `thoiGianBatDau`, `thoiGianKetThuc`, `cacThangApDung`
- **Giới hạn**: 1 ≤ ngày ≤ 31

### Hàng quý (`hang_quy`)
- **Bắt buộc**: `ngayBatDauTrongThang`, `ngayKetThucTrongThang`, `cacThangApDung`, `namBatDau`
- **cacThangApDung**: Mảng 3-4 số tháng (VD: [1,4,7,10] hoặc [3,6,9,12])

### Hàng năm (`hang_nam`)
- **Bắt buộc**: `ngayBatDauTrongThang`, `ngayKetThucTrongThang`, `thangBatDau`, `namBatDau`
- **thangBatDau**: 1 ≤ tháng ≤ 12

### Đột xuất (`dot_xuat`)
- **Bắt buộc**: `thoiGianBatDau`, `thoiGianKetThuc`
- **Không cần**: Các trường định kỳ khác

---

## 🚀 Migration

Chạy migration để cập nhật database:

```bash
npm run migration:run
```

Hoặc trên production:

```bash
npm run migration:run -- -d src/orm/ormconfig.ts
```

---

## 📝 Notes

1. **Năm kết thúc** (`namKetThuc`): Để `null` nếu muốn kỳ báo cáo lặp lại vô thời hạn
2. **Tháng áp dụng** (`cacThangApDung`): Chỉ dùng cho báo cáo hàng quý
3. **Ngày trong tháng**: Hệ thống tự động xử lý các tháng có ít hơn 31 ngày
4. **Múi giờ**: Tất cả thời gian lưu theo UTC, hiển thị theo múi giờ local

---

## 🔄 Tương Thích Ngược

- Các kỳ báo cáo cũ (đã có `thoiGianBatDau`, `thoiGianKetThuc`) sẽ tự động có `loaiKy = 'dot_xuat'`
- Hệ thống vẫn hoạt động bình thường với dữ liệu cũ
- Migration không làm mất dữ liệu hiện tại
