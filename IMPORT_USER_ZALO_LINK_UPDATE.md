# Cập nhật API Import Users với Zalo Link

## Tổng quan
API `POST /user/import-with-zalo-link` đã được cập nhật với logic mới phức tạp hơn, cho phép import user với các tính năng:
- Tự động tạo/cập nhật Organization, Cụm KCN, Xã Phường dựa vào ID hoặc tên
- Tạo username theo vai trò (CV/LD, CDCS, CKCN/XP)
- Không tạo user mới nếu username đã tồn tại, chỉ liên kết Zalo
- Cho phép 1 user liên kết nhiều tài khoản Zalo

## Cấu trúc file Excel Import

### Các cột trong file (13 cột)
| STT | Tên cột | Bắt buộc | Mô tả |
|-----|---------|----------|-------|
| 1 | STT | Không | Số thứ tự |
| 2 | Họ và tên | **Có** | Họ tên đầy đủ của user |
| 3 | Email | **Có** | Email (unique) |
| 4 | SĐT Đăng ký Zalo | Không | SĐT để liên kết Zalo |
| 5 | CMND/CCCD | Không | Số CMND/CCCD |
| 6 | Vai trò | **Có** | Description từ bảng `role` (VD: "Cán bộ", "Lãnh đạo", "CDCS") |
| 7 | Công đoàn cơ sở | Không | Tên công đoàn cơ sở |
| 8 | ID CĐCS | Không | ID của organization (nếu có) |
| 9 | Cụm khu CN | Không | Tên Cụm KCN |
| 10 | ID Cụm KCN | Không | ID của CumKhuCongNghiep (nếu có) |
| 11 | Xã phường | Không | Tên xã phường |
| 12 | ID xã phường | Không | ID của XaPhuong (nếu có) |
| 13 | Tên tài khoản Zalo | Không | Thông tin tham khảo |

## Logic xử lý

### 1. Xử lý Vai trò (Role)
- Tìm role dựa vào cột **Vai trò** = `role.description`
- Nếu không tìm thấy => báo lỗi

### 2. Xử lý Công đoàn cơ sở (Organization)
**Case 1: Có ID CĐCS**
- Kiểm tra ID tồn tại trong DB
  - **Tồn tại**: Sử dụng organization này
  - **Không tồn tại** và có tên CĐCS: Tạo mới organization với tên từ file
  - **Không tồn tại** và không có tên: Báo lỗi

**Case 2: Không có ID nhưng có tên CĐCS**
- Tạo mới organization với tên từ file
- Gán ID mới này cho user

**Case 3: Không có cả ID và tên**
- `organizationId = null`

### 3. Xử lý Cụm KCN và Xã Phường
Áp dụng logic tương tự Organization:
- Có ID => kiểm tra tồn tại, không tồn tại và có tên => tạo mới
- Không có ID nhưng có tên => tạo mới
- Không có cả => null

### 4. Tạo Username theo vai trò

#### CV/LD (Cán bộ, Lãnh đạo)
- Pattern: `_` + họ tên viết tắt
- Ví dụ: "Nguyễn Đức Trường" => `_truongnd`
- Logic:
  ```typescript
  const lastName = 'Trường'
  const firstLetters = 'nd' // Nguyễn Đức
  username = '_truongnd'
  ```

#### CDCS (Công đoàn cơ sở)
- Pattern: `cdcs_` + ID organization
- Ví dụ: Organization ID = 123 => `cdcs_123`
- Yêu cầu: Phải có organizationId, nếu không có => báo lỗi

#### CKCN/XP (Cụm khu công nghiệp / Xã phường / Phường thành)
- Pattern: `pt_` + tên viết tắt (không dấu, không khoảng trắng)
- Ví dụ: 
  - "Phường Thuận Thành" => `pt_phuongthuanthanh`
  - "KCN Đình Trám" => `pt_kčndinhtram` => `pt_kcndinhtram`

### 5. Kiểm tra User tồn tại

**Nếu username đã tồn tại:**
- **KHÔNG** tạo user mới
- Sử dụng user hiện tại
- Chỉ thực hiện liên kết Zalo
- Thêm warning: "User đã tồn tại với username ... Chỉ liên kết Zalo."

**Nếu username chưa tồn tại:**
- Kiểm tra trùng email/SĐT/CMND => nếu trùng => báo lỗi
- Tạo user mới với:
  - Username: theo logic vai trò
  - Password mặc định: `Aabc@123`
  - roleId, organizationId, cumKhuCnId, xaPhuongId
  - isActive: 1

### 6. Liên kết Zalo
- Thực hiện sau khi tạo/lấy user
- Dựa vào **SĐT Đăng ký Zalo**
- Gọi `zaloAccountService.autoLinkByPhoneNumber(userId, sdt)`
- Kết quả:
  - Thành công: Tăng `zaloLinkedCount`, thêm warning thành công
  - Không tìm thấy: Tăng `zaloNotFoundCount`, thêm warning không tìm thấy
  - Lỗi: Tăng `zaloNotFoundCount`, thêm warning lỗi

## Response Format

### Trường hợp thành công hoàn toàn
```json
{
  "message": "Import thành công",
  "data": {
    "successCount": 10,
    "errorCount": 0,
    "errors": {},
    "createdIds": ["uuid1", "uuid2", ...],
    "zaloLinkedCount": 8,
    "zaloNotFoundCount": 2,
    "summary": "Đã tạo 10 tài khoản, liên kết 8 tài khoản Zalo"
  }
}
```

### Trường hợp có lỗi/warning
- HTTP Status: 200 (nếu có dòng thành công) hoặc 400 (nếu tất cả đều lỗi)
- Response: File Excel với cột "Kết quả" chứa thông tin lỗi/warning
- Headers:
  - `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `Content-Disposition`: `attachment; filename=import-users-zalo-warnings.xlsx`
  - `X-Import-Status`: `partial-success` | `all-failed`
  - `X-Success-Count`: số dòng thành công
  - `X-Error-Count`: số dòng lỗi
  - `X-Zalo-Linked`: số tài khoản Zalo đã liên kết
  - `X-Zalo-Not-Found`: số tài khoản Zalo không tìm thấy

## Ví dụ dữ liệu

### Example 1: Cán bộ mới
```
Họ tên: Nguyễn Thị Lan
Vai trò: Cán bộ
Công đoàn: Công đoàn XYZ
ID CĐCS: (trống)
=> Tạo organization mới "Công đoàn XYZ", gán cho user
=> Username: _lannt
=> Password: Aabc@123
```

### Example 2: CDCS đã có organization
```
Họ tên: Trần Văn A
Vai trò: CDCS
Công đoàn: (trống)
ID CĐCS: 123
=> Kiểm tra organization id=123 tồn tại
=> Username: cdcs_123
```

### Example 3: Phường thành
```
Họ tên: Lê Thị B
Vai trò: Phường thành
Xã phường: Phường Thuận Thành
ID xã phường: (trống)
=> Tạo mới xã phường
=> Username: pt_phuongthuanthanh
```

### Example 4: User đã tồn tại
```
Họ tên: Nguyễn Văn C
Vai trò: Cán bộ
=> Username tính được: _cnv
=> Kiểm tra DB: user với username "_cnv" đã tồn tại
=> KHÔNG tạo user mới
=> CHỈ liên kết Zalo nếu có SĐT
```

## Các thay đổi trong code

### Files đã sửa
1. **user.controller.ts**
   - Cập nhật `@ApiOperation` description cho endpoint `import-with-zalo-link`

2. **user.service.ts**
   - Thêm `removeVietnameseTones()`: helper để xóa dấu tiếng Việt
   - Thêm `generateUsernameByRole()`: tạo username theo vai trò
   - Viết lại hoàn toàn `importUsersWithZaloLink()`:
     - Logic xử lý Organization/CumKCN/XaPhuong với ID
     - Logic kiểm tra user tồn tại
     - Logic tạo user mới hoặc chỉ link Zalo
   - Cập nhật `importUsersWithZaloLinkFromExcelFile()`: đọc 13 cột
   - Cập nhật `createZaloLinkErrorExcelFile()`: xuất 13 cột + kết quả

3. **import-user.dto.ts**
   - Thêm 3 fields mới: `idCdcs`, `idCumKcn`, `idXaPhuong`

## Testing

### Test cases cần kiểm tra
1. ✅ Import user mới với vai trò CV/LD
2. ✅ Import user mới với vai trò CDCS (có organization)
3. ✅ Import user mới với vai trò CKCN/XP
4. ✅ Tạo mới Organization khi ID trống nhưng có tên
5. ✅ Tạo mới Organization khi ID không tồn tại nhưng có tên
6. ✅ Sử dụng Organization hiện tại khi ID tồn tại
7. ✅ User đã tồn tại => không tạo mới, chỉ link Zalo
8. ✅ Liên kết Zalo thành công
9. ✅ Liên kết Zalo không tìm thấy account
10. ✅ Validate lỗi: email trùng, SĐT trùng, CMND trùng

## Notes
- Mật khẩu mặc định: `Aabc@123`
- User có thể liên kết nhiều tài khoản Zalo (1-N relationship)
- Username là unique, sử dụng để kiểm tra user tồn tại
- File Excel import phải có đúng 13 cột theo thứ tự đã mô tả
- Row 1-2 là header, data bắt đầu từ row 3
