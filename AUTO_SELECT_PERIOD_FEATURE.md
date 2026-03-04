# Tính Năng Tự Động Chọn Kỳ Báo Cáo

## 📋 Tổng Quan

Thay vì user phải chọn `thoiGianCapNhatDoanSoId` cụ thể, giờ chỉ cần chọn **loại kỳ báo cáo**, hệ thống sẽ **tự động tìm và gán** kỳ phù hợp với thời gian hiện tại.

---

## 🎯 Thay Đổi API

### ❌ Cách Cũ (Phức Tạp)

User phải:
1. Biết ID của kỳ báo cáo
2. Tự kiểm tra kỳ nào đang mở
3. Gửi request với `thoiGianCapNhatDoanSoId`

```json
POST /bao-cao-doan-so-theo-ky/create
{
  "tenBaoCao": "Báo cáo tháng 10",
  "thoiGianCapNhatDoanSoId": 15,  // Phải biết ID này
  "soLuongDoanVienNam": 50,
  "soLuongDoanVienNu": 30
}
```

### ✅ Cách Mới (Đơn Giản)

User chỉ cần:
1. Chọn loại kỳ (hàng tháng/quý/năm/đột xuất)
2. Hệ thống tự động tìm kỳ phù hợp với thời gian hiện tại

```json
POST /bao-cao-doan-so-theo-ky/create
{
  "tenBaoCao": "Báo cáo tháng 10",
  "loaiKy": "hang_thang",  // Chỉ cần chọn loại
  "soLuongDoanVienNam": 50,
  "soLuongDoanVienNu": 30
}
```

**Hệ thống tự động:**
- Tìm kỳ báo cáo hàng tháng đang mở
- Kiểm tra ngày hiện tại có trong thời gian báo cáo không
- Gán `thoiGianCapNhatDoanSoId` tự động

---

## 🔧 Chi Tiết Thay Đổi

### 1. DTO Mới

**File:** `bao-cao-doan-so-theo-ky.dto.ts`

```typescript
export class CreateBaoCaoDoanSoTheoKyDto {
  @ApiProperty({ description: 'Tên báo cáo' })
  tenBaoCao: string;

  @ApiProperty({ 
    description: 'Loại kỳ báo cáo: hang_thang, hang_quy, hang_nam, dot_xuat',
    enum: LoaiKyBaoCao
  })
  loaiKy: LoaiKyBaoCao;  // ✅ REQUIRED - Chọn loại kỳ

  @ApiPropertyOptional({ 
    description: 'ID thời gian cập nhật đoàn số cụ thể (tùy chọn)' 
  })
  thoiGianCapNhatDoanSoId?: number;  // ✅ OPTIONAL - Chỉ dùng khi muốn chỉ định cụ thể
  
  // ... các trường khác
}
```

**Enum LoaiKyBaoCao:**
```typescript
export enum LoaiKyBaoCao {
  HANG_THANG = 'hang_thang',
  HANG_QUY = 'hang_quy',
  HANG_NAM = 'hang_nam',
  DOT_XUAT = 'dot_xuat'
}
```

---

### 2. Logic Tự Động Tìm Kỳ

**Method:** `timKyBaoCaoPhuHop(loaiKy: string)`

**Thuật toán:**

```typescript
1. Lấy thời gian hiện tại: năm, tháng, ngày
2. Tìm tất cả kỳ báo cáo với:
   - loaiKy = loaiKy user chọn
   - isActive = true
3. Lọc theo từng loại:
   
   📅 HÀNG THÁNG:
   - Kiểm tra: ngayHienTai >= ngayBatDauTrongThang 
              AND ngayHienTai <= ngayKetThucTrongThang
   - VD: Ngày 3/10 → OK với kỳ "1-5 hàng tháng"
   
   📅 HÀNG QUÝ:
   - Kiểm tra: thangHienTai IN cacThangApDung
              AND ngayHienTai trong khoảng ngày báo cáo
   - VD: Tháng 10, ngày 5 → OK với kỳ quý [1,4,7,10] từ 1-15
   
   📅 HÀNG NĂM:
   - Kiểm tra: thangHienTai = thangBatDau
              AND ngayHienTai trong khoảng ngày báo cáo
   - VD: Tháng 12, ngày 25 → OK với kỳ năm tháng 12, ngày 20-31
   
   📅 ĐỘT XUẤT:
   - Kiểm tra: now >= thoiGianBatDau AND now <= thoiGianKetThuc
   - VD: 15/05/2024 → OK với kỳ 10/05 - 20/05

4. Trả về kỳ đầu tiên phù hợp
```

---

## 📊 Ví Dụ Hoạt Động

### Scenario 1: Tạo Báo Cáo Hàng Tháng

**Cấu hình kỳ trong database:**
```sql
id=10, ten="Báo cáo đầu tháng", loaiKy="hang_thang", 
ngayBatDauTrongThang=1, ngayKetThucTrongThang=5, 
namBatDau=2024, isActive=true
```

**Test Case:**

| Thời gian hiện tại | Request | Kết quả |
|-------------------|---------|---------|
| **03/10/2024** | `{ loaiKy: "hang_thang" }` | ✅ Tự động chọn kỳ ID=10<br>Message: "✅ Tự động chọn kỳ báo cáo: Báo cáo đầu tháng (ID: 10)" |
| **10/10/2024** | `{ loaiKy: "hang_thang" }` | ❌ Từ chối<br>Error: "Hiện tại không trong thời gian báo cáo. Kỳ hiện tại: Tháng 10/2024 (01/10/2024 - 05/10/2024)" |

---

### Scenario 2: Tạo Báo Cáo Hàng Quý

**Cấu hình kỳ:**
```sql
id=20, ten="Báo cáo đầu quý", loaiKy="hang_quy",
ngayBatDauTrongThang=1, ngayKetThucTrongThang=15,
cacThangApDung=[1,4,7,10], namBatDau=2024, isActive=true
```

**Test Case:**

| Thời gian hiện tại | Request | Kết quả |
|-------------------|---------|---------|
| **05/10/2024** (Quý 4) | `{ loaiKy: "hang_quy" }` | ✅ Chọn kỳ ID=20 |
| **05/11/2024** (Giữa quý) | `{ loaiKy: "hang_quy" }` | ❌ "Không tìm thấy kỳ báo cáo Hàng quý đang hoạt động" |

---

### Scenario 3: Chỉ Định Cụ Thể (Override)

Nếu user muốn **chỉ định kỳ cụ thể** (bypass auto-select):

```json
{
  "tenBaoCao": "Báo cáo đặc biệt",
  "loaiKy": "hang_thang",
  "thoiGianCapNhatDoanSoId": 25,  // Chỉ định cụ thể kỳ ID=25
  "soLuongDoanVienNam": 40
}
```

**Hệ thống sẽ:**
1. Sử dụng `thoiGianCapNhatDoanSoId = 25`
2. Kiểm tra kỳ ID=25 có phải loại `hang_thang` không
3. Nếu không khớp → Lỗi: "Loại kỳ báo cáo không khớp"

---

## 🔍 Validation Logic

### 1. Kiểm tra Loại Kỳ Khớp

```typescript
if (createDto.thoiGianCapNhatDoanSoId && 
    thoiGianCapNhat.loaiKy !== createDto.loaiKy) {
  throw new BadRequestException(
    `Loại kỳ báo cáo không khớp. 
     Kỳ này là ${getTenLoaiKy(thoiGianCapNhat.loaiKy)}, 
     bạn đang chọn ${getTenLoaiKy(createDto.loaiKy)}`
  );
}
```

### 2. Kiểm tra Thời Gian Hợp Lệ

**Với kỳ định kỳ:**
```typescript
const kyHienTai = tinhKyBaoCaoHienTai(thoiGianCapNhat);
if (now < kyHienTai.thoiGianBatDau || now > kyHienTai.thoiGianKetThuc) {
  throw new BadRequestException(
    `Hiện tại không trong thời gian báo cáo. 
     Kỳ hiện tại: ${kyHienTai.tenKy} 
     (${formatDate(kyHienTai.thoiGianBatDau)} - ${formatDate(kyHienTai.thoiGianKetThuc)})`
  );
}
```

**Với kỳ đột xuất:**
```typescript
if (now < thoiGianCapNhat.thoiGianBatDau || 
    now > thoiGianCapNhat.thoiGianKetThuc) {
  throw new BadRequestException(
    `Hiện tại không trong thời gian cập nhật đoàn số 
     (${formatDate(thoiGianBatDau)} - ${formatDate(thoiGianKetThuc)})`
  );
}
```

---

## 📈 Ưu Điểm

| Cách Cũ | Cách Mới |
|---------|----------|
| ❌ User phải biết ID kỳ báo cáo | ✅ Chỉ cần chọn loại |
| ❌ Phải gọi API riêng để lấy danh sách kỳ | ✅ Tự động tìm kỳ phù hợp |
| ❌ Dễ chọn nhầm kỳ | ✅ Hệ thống đảm bảo đúng kỳ |
| ❌ Phức tạp với user | ✅ Đơn giản, trực quan |
| ❌ Frontend phải xử lý logic phức tạp | ✅ Backend xử lý tất cả |

---

## 🔄 Tương Thích Ngược

**100% tương thích** với code cũ:

1. **Nếu frontend gửi `thoiGianCapNhatDoanSoId`**: Vẫn hoạt động như cũ
2. **Nếu frontend gửi `loaiKy`**: Dùng logic mới tự động tìm kỳ
3. **Nếu gửi cả 2**: Ưu tiên `thoiGianCapNhatDoanSoId`, validate `loaiKy` khớp

---

## 🧪 Test Cases

### TC1: Tự Động Chọn Kỳ Hàng Tháng

**Setup:**
- Kỳ: "Báo cáo đầu tháng", loaiKy=hang_thang, ngày 1-5
- Thời gian: 03/10/2024

**Input:**
```json
{ "loaiKy": "hang_thang", "tenBaoCao": "Test" }
```

**Expected:**
- ✅ Tự động gán `thoiGianCapNhatDoanSoId`
- ✅ Console log: "✅ Tự động chọn kỳ báo cáo: Báo cáo đầu tháng (ID: X)"
- ✅ Tạo báo cáo thành công

---

### TC2: Ngoài Thời Gian Báo Cáo

**Setup:**
- Kỳ: "Báo cáo đầu tháng", loaiKy=hang_thang, ngày 1-5
- Thời gian: 10/10/2024 (ngoài khoảng 1-5)

**Input:**
```json
{ "loaiKy": "hang_thang", "tenBaoCao": "Test" }
```

**Expected:**
- ❌ Error 400: "Hiện tại không trong thời gian báo cáo. Kỳ hiện tại: Tháng 10/2024 (01/10/2024 - 05/10/2024)"

---

### TC3: Không Có Kỳ Phù Hợp

**Setup:**
- Không có kỳ hang_quy nào active
- Thời gian: 05/10/2024

**Input:**
```json
{ "loaiKy": "hang_quy", "tenBaoCao": "Test" }
```

**Expected:**
- ❌ Error 404: "Không tìm thấy kỳ báo cáo Hàng quý đang hoạt động hoặc chưa được cấu hình"

---

### TC4: Chỉ Định Kỳ Không Khớp Loại

**Setup:**
- Kỳ ID=10: loaiKy=hang_thang
- User chọn: loaiKy=hang_quy, thoiGianCapNhatDoanSoId=10

**Input:**
```json
{ 
  "loaiKy": "hang_quy", 
  "thoiGianCapNhatDoanSoId": 10,
  "tenBaoCao": "Test" 
}
```

**Expected:**
- ❌ Error 400: "Loại kỳ báo cáo không khớp. Kỳ này là Hàng tháng, bạn đang chọn Hàng quý"

---

## 📝 Migration Guide

### Frontend Update

**Cũ:**
```typescript
// Phải lấy danh sách kỳ trước
const periods = await fetchPeriods();
const currentPeriod = periods.find(p => p.isActive);

await createReport({
  thoiGianCapNhatDoanSoId: currentPeriod.id,
  tenBaoCao: "..."
});
```

**Mới:**
```typescript
// Chỉ cần chọn loại
await createReport({
  loaiKy: "hang_thang",  // Từ dropdown select
  tenBaoCao: "..."
});
```

**Form UI:**
```html
<select name="loaiKy">
  <option value="hang_thang">Báo cáo hàng tháng</option>
  <option value="hang_quy">Báo cáo hàng quý</option>
  <option value="hang_nam">Báo cáo hàng năm</option>
  <option value="dot_xuat">Báo cáo đột xuất</option>
</select>
```

---

## 🎯 Files Changed

1. **DTO:** `src/HeThong/bao-cao-doan-so-theo-ky/dto/bao-cao-doan-so-theo-ky.dto.ts`
   - Import `LoaiKyBaoCao`
   - Thay đổi `thoiGianCapNhatDoanSoId` → optional
   - Thêm `loaiKy` → required

2. **Service:** `src/HeThong/bao-cao-doan-so-theo-ky/bao-cao-doan-so-theo-ky.service.ts`
   - Sửa method `create()`: Tự động tìm kỳ
   - Thêm method `timKyBaoCaoPhuHop()`: Logic tìm kỳ
   - Thêm method `getTenLoaiKy()`: Helper hiển thị tên

---

## 🚀 Deploy Checklist

- [ ] Chạy migration (nếu có)
- [ ] Test tất cả 4 loại kỳ
- [ ] Update Swagger documentation
- [ ] Update frontend form
- [ ] Test backward compatibility
- [ ] Update user guide

---

## 💡 Tips

1. **Multiple Active Periods:** Nếu có nhiều kỳ cùng loại đang active, hệ thống chọn kỳ **đầu tiên** tìm thấy
2. **Priority:** Nếu gửi cả `loaiKy` và `thoiGianCapNhatDoanSoId`, sẽ ưu tiên `thoiGianCapNhatDoanSoId`
3. **Validation:** Luôn kiểm tra thời gian hiện tại có trong kỳ báo cáo không
4. **Error Messages:** Hiển thị thời gian kỳ rõ ràng để user biết khi nào có thể báo cáo
