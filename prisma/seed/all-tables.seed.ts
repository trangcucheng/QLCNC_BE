import { PrismaClient, GioiTinh, TrangThaiDoiTuong, LoaiTaiLieu, MucDoViPham, TrangThaiHoSo } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============== QUAN HỆ XÃ HỘI ==============
export async function seedQuanHeXaHoi() {
  console.log('👨‍👩‍👧‍👦 Seeding Quan hệ xã hội...');

  const quanHe = [
    { tenQuanHe: 'Cha', moTa: 'Cha đẻ, cha nuôi' },
    { tenQuanHe: 'Mẹ', moTa: 'Mẹ đẻ, mẹ nuôi' },
    { tenQuanHe: 'Vợ', moTa: 'Vợ (đã đăng ký kết hôn)' },
    { tenQuanHe: 'Chồng', moTa: 'Chồng (đã đăng ký kết hôn)' },
    { tenQuanHe: 'Con trai', moTa: 'Con trai (ruột hoặc nuôi)' },
    { tenQuanHe: 'Con gái', moTa: 'Con gái (ruột hoặc nuôi)' },
    { tenQuanHe: 'Anh trai', moTa: 'Anh trai ruột' },
    { tenQuanHe: 'Chị gái', moTa: 'Chị gái ruột' },
    { tenQuanHe: 'Em trai', moTa: 'Em trai ruột' },
    { tenQuanHe: 'Em gái', moTa: 'Em gái ruột' },
    { tenQuanHe: 'Ông nội', moTa: 'Cha của cha' },
    { tenQuanHe: 'Bà nội', moTa: 'Mẹ của cha' },
    { tenQuanHe: 'Ông ngoại', moTa: 'Cha của mẹ' },
    { tenQuanHe: 'Bà ngoại', moTa: 'Mẹ của mẹ' },
    { tenQuanHe: 'Chú', moTa: 'Em trai của cha' },
    { tenQuanHe: 'Bác', moTa: 'Anh chị của cha/mẹ' },
    { tenQuanHe: 'Cậu', moTa: 'Anh em trai của mẹ' },
    { tenQuanHe: 'Dì', moTa: 'Em gái của mẹ' },
    { tenQuanHe: 'Cô', moTa: 'Chị em gái của cha' },
    { tenQuanHe: 'Bạn', moTa: 'Bạn bè thân thiết' },
  ];

  for (const qh of quanHe) {
    await prisma.quanHeXaHoi.upsert({
      where: { tenQuanHe: qh.tenQuanHe },
      update: {},
      create: qh,
    });
  }

  console.log(`✅ Đã tạo ${quanHe.length} quan hệ xã hội`);
}

// ============== TỘI DANH ==============
export async function seedToimDanh() {
  console.log('⚖️ Seeding Tội danh...');

  const toimDanh = [
    { ma: 'TD001', ten: 'Giết người', moTa: 'Cố ý tước đoạt mạng sống của người khác', khungHinhPhat: '12 năm tù - Tử hình' },
    { ma: 'TD002', ten: 'Cố ý gây thương tích', moTa: 'Cố ý gây tổn hại cho sức khỏe người khác', khungHinhPhat: '6 tháng - 20 năm tù' },
    { ma: 'TD003', ten: 'Trộm cắp tài sản', moTa: 'Chiếm đoạt tài sản của người khác trái phép', khungHinhPhat: '6 tháng - 20 năm tù' },
    { ma: 'TD004', ten: 'Cướp tài sản', moTa: 'Dùng vũ lực hoặc đe dọa dùng vũ lực chiếm đoạt tài sản', khungHinhPhat: '3 năm - Tử hình' },
    { ma: 'TD005', ten: 'Cướp giật tài sản', moTa: 'Công khai chiếm đoạt tài sản bằng cách giật, chộp', khungHinhPhat: '6 tháng - 20 năm tù' },
    { ma: 'TD006', ten: 'Hiếp dâm', moTa: 'Giao cấu với người khác trái với ý muốn', khungHinhPhat: '2 năm - Tử hình' },
    { ma: 'TD007', ten: 'Mua bán ma túy', moTa: 'Mua bán, vận chuyển trái phép chất ma túy', khungHinhPhat: '2 năm - Tử hình' },
    { ma: 'TD008', ten: 'Tàng trữ ma túy', moTa: 'Tàng trữ trái phép chất ma túy', khungHinhPhat: '1 năm - Tử hình' },
    { ma: 'TD009', ten: 'Lừa đảo chiếm đoạt tài sản', moTa: 'Dùng thủ đoạn gian dối chiếm đoạt tài sản', khungHinhPhat: '6 tháng - 20 năm tù' },
    { ma: 'TD010', ten: 'Cưỡng đoạt tài sản', moTa: 'Dùng vũ lực, đe dọa buộc người khác giao tài sản', khungHinhPhat: '6 tháng - 20 năm tù' },
    { ma: 'TD011', ten: 'Đánh bạc', moTa: 'Tham gia đánh bạc hoặc tổ chức đánh bạc', khungHinhPhat: 'Phạt tiền - 7 năm tù' },
    { ma: 'TD012', ten: 'Chứa mại dâm', moTa: 'Tổ chức, chứa chấp hoạt động mại dâm', khungHinhPhat: '1 năm - 15 năm tù' },
    { ma: 'TD013', ten: 'Môi giới mại dâm', moTa: 'Làm trung gian môi giới hoạt động mại dâm', khungHinhPhat: '1 năm - 10 năm tù' },
    { ma: 'TD014', ten: 'Đe dọa giết người', moTa: 'Đe dọa sẽ giết người khác', khungHinhPhat: 'Phạt tiền - 5 năm tù' },
    { ma: 'TD015', ten: 'Cưỡng đoạt tài sản', moTa: 'Chiếm đoạt tài sản bằng cách uy hiếp', khungHinhPhat: '6 tháng - 20 năm tù' },
    { ma: 'TD016', ten: 'Hủy hoại tài sản', moTa: 'Phá hủy, làm hư hỏng tài sản của người khác', khungHinhPhat: 'Phạt tiền - 15 năm tù' },
    { ma: 'TD017', ten: 'Tổ chức đánh bạc', moTa: 'Tổ chức, điều hành sòng bạc', khungHinhPhat: '3 năm - 15 năm tù' },
    { ma: 'TD018', ten: 'Chống người thi hành công vụ', moTa: 'Cản trở, chống đối người đang thi hành công vụ', khungHinhPhat: '6 tháng - 7 năm tù' },
    { ma: 'TD019', ten: 'Làm giả tài liệu', moTa: 'Làm giả con dấu, tài liệu của cơ quan, tổ chức', khungHinhPhat: '1 năm - 20 năm tù' },
    { ma: 'TD020', ten: 'Sử dụng tài liệu giả', moTa: 'Sử dụng tài liệu giả của cơ quan, tổ chức', khungHinhPhat: 'Phạt tiền - 15 năm tù' },
    { ma: 'TD021', ten: 'Làm nhục người khác', moTa: 'Xúc phạm nghiêm trọng danh dự, nhân phẩm người khác', khungHinhPhat: 'Phạt tiền - 3 năm tù' },
    { ma: 'TD022', ten: 'Trộm cắp điện', moTa: 'Ăn cắp điện năng', khungHinhPhat: 'Phạt tiền - 7 năm tù' },
    { ma: 'TD023', ten: 'Làm rối loạn trật tự công cộng', moTa: 'Gây rối, làm mất trật tự nơi công cộng', khungHinhPhat: 'Phạt tiền - 3 năm tù' },
    { ma: 'TD024', ten: 'Tàng trữ vũ khí trái phép', moTa: 'Tàng trữ vũ khí quân dụng không được phép', khungHinhPhat: '1 năm - 15 năm tù' },
    { ma: 'TD025', ten: 'Buôn lậu', moTa: 'Vận chuyển hàng hóa qua biên giới trái phép', khungHinhPhat: 'Phạt tiền - 20 năm tù' },
  ];

  for (const td of toimDanh) {
    await prisma.toimDanh.upsert({
      where: { ma: td.ma },
      update: {},
      create: td,
    });
  }

  console.log(`✅ Đã tạo ${toimDanh.length} tội danh`);
}

// ============== ĐƠN VỊ (Phòng ban) ==============
export async function seedDonVi() {
  console.log('🏢 Seeding Đơn vị...');

  // Cấp 1 - Các phòng chính
  const phongChinh = [
    { ma: 'PC01', ten: 'Phòng Cảnh sát Hình sự', moTa: 'Điều tra các vụ án hình sự' },
    { ma: 'PC02', ten: 'Phòng Cảnh sát Kinh tế', moTa: 'Điều tra án kinh tế' },
    { ma: 'PC03', ten: 'Phòng Cảnh sát Ma túy', moTa: 'Điều tra án ma túy' },
    { ma: 'PC04', ten: 'Phòng Cảnh sát Giao thông', moTa: 'Quản lý trật tự giao thông' },
    { ma: 'PC05', ten: 'Phòng Cảnh sát PCCC', moTa: 'Phòng cháy chữa cháy' },
  ];

  for (const phong of phongChinh) {
    await prisma.donVi.upsert({
      where: { ma: phong.ma },
      update: {},
      create: phong,
    });
  }

  // Lấy phòng cảnh sát hình sự để tạo đơn vị con
  const phongHinhSu = await prisma.donVi.findUnique({ where: { ma: 'PC01' } });

  // Cấp 2 - Các đội thuộc Phòng Hình sự
  const doiThuocPhong = [
    { ma: 'D01', ten: 'Đội Điều tra trọng án', moTa: 'Điều tra các vụ án nghiêm trọng', donViChaId: phongHinhSu!.id },
    { ma: 'D02', ten: 'Đội Điều tra cướp, cướp giật', moTa: 'Chuyên điều tra án cướp', donViChaId: phongHinhSu!.id },
    { ma: 'D03', ten: 'Đội Điều tra trộm cắp', moTa: 'Chuyên điều tra án trộm cắp', donViChaId: phongHinhSu!.id },
    { ma: 'D04', ten: 'Đội Điều tra lừa đảo', moTa: 'Chuyên điều tra án lừa đảo', donViChaId: phongHinhSu!.id },
    { ma: 'D05', ten: 'Đội Tuần tra kiểm soát', moTa: 'Tuần tra, kiểm soát địa bàn', donViChaId: phongHinhSu!.id },
  ];

  for (const doi of doiThuocPhong) {
    await prisma.donVi.upsert({
      where: { ma: doi.ma },
      update: {},
      create: doi,
    });
  }

  console.log(`✅ Đã tạo ${phongChinh.length + doiThuocPhong.length} đơn vị`);
}

// ============== BIỂU MẪU ==============
export async function seedBieuMau() {
  console.log('📝 Seeding Biểu mẫu...');

  const bieuMau = [
    { ten: 'Biên bản khám nghiệm hiện trường', moTa: 'Mẫu biên bản khám nghiệm hiện trường vụ án', duongDan: '/bieu-mau/BB01.docx', phienBan: 'v1.0' },
    { ten: 'Biên bản lấy lời khai', moTa: 'Mẫu biên bản lấy lời khai đối tượng', duongDan: '/bieu-mau/BB02.docx', phienBan: 'v1.0' },
    { ten: 'Lệnh bắt giữ người phạm tội', moTa: 'Mẫu lệnh bắt giữ', duongDan: '/bieu-mau/LENH01.docx', phienBan: 'v1.0' },
    { ten: 'Lệnh khám xét', moTa: 'Mẫu lệnh khám xét', duongDan: '/bieu-mau/LENH02.docx', phienBan: 'v1.0' },
    { ten: 'Quyết định tạm giữ', moTa: 'Mẫu quyết định tạm giữ đối tượng', duongDan: '/bieu-mau/QD001.docx', phienBan: 'v1.0' },
    { ten: 'Quyết định khởi tố vụ án', moTa: 'Mẫu quyết định khởi tố vụ án hình sự', duongDan: '/bieu-mau/QD002.docx', phienBan: 'v1.0' },
    { ten: 'Quyết định khởi tố bị can', moTa: 'Mẫu quyết định khởi tố bị can', duongDan: '/bieu-mau/QD003.docx', phienBan: 'v1.0' },
    { ten: 'Bản kê biên tài sản', moTa: 'Mẫu bản kê biên thu giữ tài sản', duongDan: '/bieu-mau/KB01.docx', phienBan: 'v1.0' },
    { ten: 'Giấy triệu tập', moTa: 'Mẫu giấy triệu tập người có liên quan', duongDan: '/bieu-mau/GT01.docx', phienBan: 'v1.0' },
    { ten: 'Bản tự khai', moTa: 'Mẫu bản khai tự khai của đối tượng', duongDan: '/bieu-mau/TK01.docx', phienBan: 'v1.0' },
  ];

  for (const bm of bieuMau) {
    await prisma.bieuMau.create({ data: bm });
  }

  console.log(`✅ Đã tạo ${bieuMau.length} biểu mẫu`);
}

// ============== CẤU HÌNH HỆ THỐNG ==============
export async function seedCauHinhHeThong() {
  console.log('⚙️ Seeding Cấu hình hệ thống...');

  const cauHinh = [
    { khoa: 'TEN_DON_VI', giaTri: 'Công an Thành phố Đà Nẵng', moTa: 'Tên đơn vị sử dụng hệ thống' },
    { khoa: 'DIA_CHI', giaTri: '96 Lê Duẩn, Q. Hải Châu, TP. Đà Nẵng', moTa: 'Địa chỉ trụ sở' },
    { khoa: 'DIEN_THOAI', giaTri: '0236.3822.179', moTa: 'Số điện thoại liên hệ' },
    { khoa: 'EMAIL', giaTri: 'caqldanang@gmail.com', moTa: 'Email liên hệ' },
    { khoa: 'WEBSITE', giaTri: 'https://cadn.gov.vn', moTa: 'Website đơn vị' },
    { khoa: 'LOGO_URL', giaTri: '/images/logo-ca-danang.png', moTa: 'Đường dẫn logo' },
    { khoa: 'SO_NGAY_LUU_LOG', giaTri: '90', moTa: 'Số ngày lưu trữ log hệ thống' },
    { khoa: 'SO_BAN_GHI_MOI_TRANG', giaTri: '20', moTa: 'Số bản ghi mặc định mỗi trang' },
    { khoa: 'SESSION_TIMEOUT', giaTri: '30', moTa: 'Thời gian timeout phiên làm việc (phút)' },
    { khoa: 'MAX_FILE_UPLOAD_SIZE', giaTri: '10485760', moTa: 'Kích thước file upload tối đa (bytes) - 10MB' },
    { khoa: 'ALLOWED_FILE_TYPES', giaTri: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,mp4', moTa: 'Các loại file được phép upload' },
    { khoa: 'ENABLE_EMAIL_NOTIFICATION', giaTri: 'true', moTa: 'Bật/tắt thông báo qua email' },
    { khoa: 'SMTP_HOST', giaTri: 'smtp.gmail.com', moTa: 'SMTP server' },
    { khoa: 'SMTP_PORT', giaTri: '587', moTa: 'SMTP port' },
    { khoa: 'BAO_CAO_HEADER', giaTri: 'CÔNG AN THÀNH PHỐ ĐÀ NẴNG', moTa: 'Header cho báo cáo' },
  ];

  for (const ch of cauHinh) {
    await prisma.cauHinhHeThong.upsert({
      where: { khoa: ch.khoa },
      update: {},
      create: ch,
    });
  }

  console.log(`✅ Đã tạo ${cauHinh.length} cấu hình hệ thống`);
}

// ============== THÔNG BÁO ==============
export async function seedThongBao() {
  console.log('🔔 Seeding Thông báo...');

  const thongBao = [
    { tieuDe: 'Hướng dẫn sử dụng hệ thống QLCNC', noiDung: 'Tài liệu hướng dẫn chi tiết sử dụng hệ thống quản lý đối tượng vi phạm pháp luật', loaiThongBao: 'HUONG_DAN', uu_tien: 3, trangThai: true },
    { tieuDe: 'Quy định về bảo mật thông tin', noiDung: 'Các quy định về bảo mật thông tin trong quá trình sử dụng hệ thống', loaiThongBao: 'QUY_DINH', uu_tien: 3, trangThai: true },
    { tieuDe: 'Nâng cấp hệ thống ngày 15/04/2026', noiDung: 'Hệ thống sẽ nâng cấp vào lúc 22:00 ngày 15/04/2026, thời gian dự kiến 2 giờ', loaiThongBao: 'THONG_BAO', uu_tien: 2, trangThai: true },
    { tieuDe: 'Bảo trì hệ thống định kỳ', noiDung: 'Hệ thống sẽ bảo trì định kỳ vào cuối tuần, từ 23:00 thứ 7 đến 6:00 chủ nhật', loaiThongBao: 'THONG_BAO', uu_tien: 1, trangThai: true },
    { tieuDe: 'Quy trình nhập dữ liệu hồ sơ đối tượng', noiDung: 'Hướng dẫn chi tiết quy trình nhập, cập nhật thông tin hồ sơ đối tượng', loaiThongBao: 'HUONG_DAN', uu_tien: 2, trangThai: true },
    { tieuDe: 'Quy trình xử lý hồ sơ vụ việc', noiDung: 'Hướng dẫn quy trình tạo mới, cập nhật và xử lý hồ sơ vụ việc', loaiThongBao: 'HUONG_DAN', uu_tien: 2, trangThai: true },
    { tieuDe: 'Quy định về backup dữ liệu', noiDung: 'Hệ thống tự động backup dữ liệu hàng ngày lúc 2:00 AM', loaiThongBao: 'QUY_DINH', uu_tien: 2, trangThai: true },
    { tieuDe: 'Chính sách mật khẩu', noiDung: 'Mật khẩu phải từ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt', loaiThongBao: 'QUY_DINH', uu_tien: 2, trangThai: true },
    { tieuDe: 'Hotline hỗ trợ kỹ thuật', noiDung: 'Liên hệ: 0236.3822.179 (giờ hành chính) để được hỗ trợ kỹ thuật', loaiThongBao: 'THONG_BAO', uu_tien: 1, trangThai: true },
    { tieuDe: 'Khóa đào tạo sử dụng hệ thống', noiDung: 'Khóa đào tạo sử dụng hệ thống sẽ được tổ chức vào ngày 20/04/2026', loaiThongBao: 'THONG_BAO', uu_tien: 2, trangThai: true },
  ];

  for (const tb of thongBao) {
    await prisma.thongBao.create({ data: tb });
  }

  console.log(`✅ Đã tạo ${thongBao.length} thông báo`);
}

// ============== HỒ SƠ ĐỐI TƯỢNG ==============
export async function seedHoSoDoiTuong() {
  console.log('👤 Seeding Hồ sơ đối tượng...');

  // Xóa dữ liệu cũ trước
  await prisma.hoSoDoiTuong.deleteMany({});

  const adminUser = await prisma.nguoiDung.findUnique({ where: { email: 'admin@qlcnc.vn' } });
  const danang = await prisma.donViHanhChinh.findFirst({ where: { ma: 'DN' } });
  const hoaThuan = await prisma.donViHanhChinh.findFirst({ where: { ma: 'DN-P001' } });
  const hcm = await prisma.donViHanhChinh.findFirst({ where: { ma: 'HCM' } });
  const benNghe = await prisma.donViHanhChinh.findFirst({ where: { ma: 'HCM-P001' } });

  const doiTuong = [
    {
      hoTen: 'Nguyễn Văn An',
      tenGoiKhac: 'An Béo',
      gioiTinh: GioiTinh.NAM,
      ngaySinh: new Date('1990-05-15'),
      noiSinh: 'Đà Nẵng',
      quocTich: 'Việt Nam',
      danToc: 'Kinh',
      tonGiao: 'Không',
      soCMND_CCCD: '201234567890',
      ngayCapCMND: new Date('2020-01-10'),
      noiCapCMND: 'Cục Cảnh sát ĐKQL cư trú & DLQG về dân cư',
      trinhDoHocVan: 'Trung học phổ thông',
      ngheNghiep: 'Thợ hàn',
      noiLamViec: 'Công ty TNHH Cơ khí Đà Nẵng',
      queQuanId: danang?.id,
      diaChiQueQuan: 'Hòa Khánh Nam, Liên Chiểu, Đà Nẵng',
      noiThuongTruId: hoaThuan?.id,
      diaChiThuongTru: '123 Nguyễn Lương Bằng, P. Hòa Thuận Tây, Q. Hải Châu',
      noiOHienTaiId: hoaThuan?.id,
      diaChiHienTai: '123 Nguyễn Lương Bằng, P. Hòa Thuận Tây, Q. Hải Châu',
      tienAn: '1 tiền án về tội trộm cắp tài sản năm 2015',
      tienSu: '2 tiền sự về đánh bạc năm 2012, 2014',
      trangThai: TrangThaiDoiTuong.DANG_THEO_DOI,
      ghiChu: 'Đối tượng có biểu hiện nghi vấn, cần theo dõi chặt chẽ',
      anhDaiDien: '/uploads/avatar/nguyen-van-an.jpg',
      fileAnh: JSON.stringify(['/uploads/doi-tuong/an-1.jpg', '/uploads/doi-tuong/an-2.jpg']),
      nguoiTaoId: adminUser!.id,
    },
    {
      hoTen: 'Trần Thị Bình',
      gioiTinh: GioiTinh.NU,
      ngaySinh: new Date('1995-08-20'),
      noiSinh: 'TP. Hồ Chí Minh',
      quocTich: 'Việt Nam',
      danToc: 'Kinh',
      soCMND_CCCD: '209876543210',
      ngayCapCMND: new Date('2021-03-15'),
      noiCapCMND: 'Cục Cảnh sát ĐKQL cư trú & DLQG về dân cư',
      trinhDoHocVan: 'Cao đẳng',
      ngheNghiep: 'Nhân viên bán hàng',
      queQuanId: hcm?.id,
      diaChiQueQuan: 'Quận 1, TP. Hồ Chí Minh',
      noiThuongTruId: benNghe?.id,
      diaChiThuongTru: '456 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
      noiOHienTaiId: hoaThuan?.id,
      diaChiHienTai: '789 Hùng Vương, P. Hòa Thuận Tây, Đà Nẵng',
      trangThai: TrangThaiDoiTuong.DANG_THEO_DOI,
      ghiChu: 'Di chuyển từ TP.HCM lên Đà Nẵng sinh sống',
      anhDaiDien: '/uploads/avatar/tran-thi-binh.jpg',
      nguoiTaoId: adminUser!.id,
    },
    {
      hoTen: 'Lê Minh Cường',
      tenGoiKhac: 'Cường Cut',
      gioiTinh: GioiTinh.NAM,
      ngaySinh: new Date('1988-12-05'),
      noiSinh: 'Quảng Nam',
      quocTich: 'Việt Nam',
      danToc: 'Kinh',
      tonGiao: 'Phật giáo',
      soCMND_CCCD: '205555666677',
      ngayCapCMND: new Date('2019-07-20'),
      noiCapCMND: 'Cục Cảnh sát ĐKQL cư trú & DLQG về dân cư',
      trinhDoHocVan: 'Trung học cơ sở',
      ngheNghiep: 'Tự do',
      queQuanId: danang?.id,
      noiThuongTruId: hoaThuan?.id,
      diaChiThuongTru: '321 Ông Ích Khiêm, P. Hòa Thuận Tây, Đà Nẵng',
      noiOHienTaiId: hoaThuan?.id,
      diaChiHienTai: '321 Ông Ích Khiêm, P. Hòa Thuận Tây, Đà Nẵng',
      tienAn: '2 tiền án về tội cướp giật (2010), tội đánh bạc (2016)',
      tienSu: 'Nhiều tiền sự về gây rối trật tự công cộng',
      trangThai: TrangThaiDoiTuong.DANG_THEO_DOI,
      ghiChu: 'Đối tượng nguy hiểm, có biểu hiện tái phạm',
      anhDaiDien: '/uploads/avatar/le-minh-cuong.jpg',
      fileAnh: JSON.stringify(['/uploads/doi-tuong/cuong-1.jpg', '/uploads/doi-tuong/cuong-2.jpg', '/uploads/doi-tuong/cuong-3.jpg']),
      nguoiTaoId: adminUser!.id,
    },
  ];

  const createdDoiTuong: any[] = [];
  for (const dt of doiTuong) {
    const created = await prisma.hoSoDoiTuong.create({ data: dt });
    createdDoiTuong.push(created);
  }

  console.log(`✅ Đã tạo ${doiTuong.length} hồ sơ đối tượng`);
  return createdDoiTuong;
}

// ============== HỒ SƠ VỤ VIỆC ==============
export async function seedHoSoVuViec(doiTuongList: any[]) {
  console.log('📁 Seeding Hồ sơ vụ việc...');

  // Xóa dữ liệu cũ trước
  await prisma.hoSoVuViec.deleteMany({});

  const adminUser = await prisma.nguoiDung.findUnique({ where: { email: 'admin@qlcnc.vn' } });
  const hoaThuan = await prisma.donViHanhChinh.findFirst({ where: { ma: 'DN-P001' } });
  const benNghe = await prisma.donViHanhChinh.findFirst({ where: { ma: 'HCM-P001' } });

  const vuViec = [
    {
      soHoSo: 'HS2026-001',
      tenVuViec: 'Vụ trộm cắp xe máy tại chợ Hòa Khánh',
      moTaVuViec: 'Đối tượng trộm 3 xe máy tại bãi giữ xe chợ Hòa Khánh vào lúc 15h ngày 01/04/2026',
      ngayXayRa: new Date('2026-04-01T15:00:00'),
      diaChiXayRa: 'Chợ Hòa Khánh, P. Hòa Khánh Nam, Q. Liên Chiểu, Đà Nẵng',
      donViHanhChinhId: hoaThuan?.id,
      mucDoViPham: MucDoViPham.NONG,
      trangThai: TrangThaiHoSo.DANG_XU_LY,
      donViXuLy: 'Phòng Cảnh sát Hình sự',
      canBoXuLy: 'Thượng úy Nguyễn Văn A',
      ngayBatDauXuLy: new Date('2026-04-01T16:00:00'),
      ghiChu: 'Đã trích xuất camera an ninh',
      nguoiTaoId: adminUser!.id,
    },
    {
      soHoSo: 'HS2026-002',
      tenVuViec: 'Vụ đánh nhau gây thương tích tại quán nhậu',
      moTaVuViec: '2 nhóm đối tượng xô xát, đánh nhau gây thương tích tại quán nhậu trên đường Ông Ích Khiêm',
      ngayXayRa: new Date('2026-04-02T22:30:00'),
      diaChiXayRa: '456 Ông Ích Khiêm, P. Hòa Thuận Tây, Q. Hải Châu, Đà Nẵng',
      donViHanhChinhId: hoaThuan?.id,
      mucDoViPham: MucDoViPham.RAT_NONG,
      trangThai: TrangThaiHoSo.DANG_XU_LY,
      donViXuLy: 'Đội Điều tra trọng án',
      canBoXuLy: 'Đại úy Trần Văn B',
      ngayBatDauXuLy: new Date('2026-04-02T23:00:00'),
      ghiChu: 'Có 3 người bị thương, đã lấy lời khai nhân chứng',
      nguoiTaoId: adminUser!.id,
    },
    {
      soHoSo: 'HS2026-003',
      tenVuViec: 'Vụ lừa đảo chiếm đoạt tài sản qua mạng',
      moTaVuViec: 'Đối tượng giả danh nhân viên ngân hàng lừa đảo chiếm đoạt 500 triệu đồng của nạn nhân',
      ngayXayRa: new Date('2026-03-28T10:00:00'),
      diaChiXayRa: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      donViHanhChinhId: benNghe?.id,
      mucDoViPham: MucDoViPham.DAC_BIET_NONG,
      trangThai: TrangThaiHoSo.DANG_XU_LY,
      donViXuLy: 'Phòng Cảnh sát Kinh tế',
      canBoXuLy: 'Thượng úy Lê Văn C',
      ngayBatDauXuLy: new Date('2026-03-29T08:00:00'),
      ghiChu: 'Đang phối hợp với ngân hàng truy vết giao dịch',
      nguoiTaoId: adminUser!.id,
    },
  ];

  const createdVuViec: any[] = [];
  for (const vv of vuViec) {
    const created = await prisma.hoSoVuViec.create({ data: vv });
    createdVuViec.push(created);
  }

  console.log(`✅ Đã tạo ${vuViec.length} hồ sơ vụ việc`);
  return createdVuViec;
}

// ============== QUAN HỆ ĐỐI TƯỢNG ==============
export async function seedQuanHeDoiTuong(doiTuongList: any[]) {
  if (doiTuongList.length < 2) return;

  console.log('🔗 Seeding Quan hệ đối tượng...');

  const quanHeCha = await prisma.quanHeXaHoi.findUnique({ where: { tenQuanHe: 'Cha' } });
  const quanHeVo = await prisma.quanHeXaHoi.findUnique({ where: { tenQuanHe: 'Vợ' } });
  const quanHeBan = await prisma.quanHeXaHoi.findUnique({ where: { tenQuanHe: 'Bạn' } });

  const quanHe = [
    {
      doiTuongChinh: doiTuongList[0].id,
      doiTuongLienQuan: doiTuongList[2].id,
      quanHeId: quanHeBan!.id,
      moTa: 'Bạn thân từ nhỏ, thường xuyên gặp mặt',
    },
    {
      doiTuongChinh: doiTuongList[2].id,
      doiTuongLienQuan: doiTuongList[0].id,
      quanHeId: quanHeBan!.id,
      moTa: 'Bạn thân, cùng tham gia các hoạt động',
    },
  ];

  for (const qh of quanHe) {
    await prisma.quanHeDoiTuong.create({ data: qh });
  }

  console.log(`✅ Đã tạo ${quanHe.length} quan hệ đối tượng`);
}

// ============== VỤ VIỆC - ĐỐI TƯỢNG ==============
export async function seedVuViecDoiTuong(vuViecList: any[], doiTuongList: any[]) {
  console.log('🔗 Seeding Vụ việc - Đối tượng...');

  const data = [
    { vuViecId: vuViecList[0].id, doiTuongId: doiTuongList[0].id, vaiTro: 'Chủ mưu', moTa: 'Đối tượng trực tiếp thực hiện hành vi trộm cắp' },
    { vuViecId: vuViecList[1].id, doiTuongId: doiTuongList[2].id, vaiTro: 'Chủ mưu', moTa: 'Đối tượng khởi xướng và trực tiếp tham gia đánh nhau' },
    { vuViecId: vuViecList[1].id, doiTuongId: doiTuongList[0].id, vaiTro: 'Đồng phạm', moTa: 'Tham gia đánh nhau cùng nhóm' },
    { vuViecId: vuViecList[2].id, doiTuongId: doiTuongList[1].id, vaiTro: 'Chủ mưu', moTa: 'Đối tượng trực tiếp thực hiện hành vi lừa đảo' },
  ];

  for (const item of data) {
    await prisma.vuViecDoiTuong.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} liên kết vụ việc - đối tượng`);
}

// ============== VỤ VIỆC - TỘI DANH ==============
export async function seedVuViecToimDanh(vuViecList: any[]) {
  console.log('⚖️ Seeding Vụ việc - Tội danh...');

  const tromCap = await prisma.toimDanh.findUnique({ where: { ma: 'TD003' } });
  const gayThuongTich = await prisma.toimDanh.findUnique({ where: { ma: 'TD002' } });
  const luaDao = await prisma.toimDanh.findUnique({ where: { ma: 'TD009' } });
  const grayRoi = await prisma.toimDanh.findUnique({ where: { ma: 'TD023' } });

  const data = [
    { vuViecId: vuViecList[0].id, toimDanhId: tromCap!.id, moTa: 'Trộm 3 xe máy trị giá khoảng 60 triệu đồng' },
    { vuViecId: vuViecList[1].id, toimDanhId: gayThuongTich!.id, moTa: 'Gây thương tích cho 3 nạn nhân' },
    { vuViecId: vuViecList[1].id, toimDanhId: grayRoi!.id, moTa: 'Gây rối trật tự công cộng tại quán nhậu' },
    { vuViecId: vuViecList[2].id, toimDanhId: luaDao!.id, moTa: 'Lừa đảo chiếm đoạt 500 triệu đồng qua hình thức giả danh ngân hàng' },
  ];

  for (const item of data) {
    await prisma.vuViecToimDanh.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} liên kết vụ việc - tội danh`);
}

// ============== LỊCH SỬ XỬ LÝ VỤ VIỆC ==============
export async function seedLichSuXuLyVuViec(vuViecList: any[]) {
  console.log('📜 Seeding Lịch sử xử lý vụ việc...');

  const data = [
    {
      vuViecId: vuViecList[0].id,
      trangThaiCu: null,
      trangThaiMoi: TrangThaiHoSo.DANG_XU_LY,
      lyDo: 'Khởi tạo hồ sơ vụ việc',
      nguoiThucHien: 'Thượng úy Nguyễn Văn A',
      ngayThucHien: new Date('2026-04-01T16:00:00'),
    },
    {
      vuViecId: vuViecList[1].id,
      trangThaiCu: null,
      trangThaiMoi: TrangThaiHoSo.DANG_XU_LY,
      lyDo: 'Tiếp nhận hồ sơ vụ việc mới',
      nguoiThucHien: 'Đại úy Trần Văn B',
      ngayThucHien: new Date('2026-04-02T23:00:00'),
    },
    {
      vuViecId: vuViecList[2].id,
      trangThaiCu: null,
      trangThaiMoi: TrangThaiHoSo.DANG_XU_LY,
      lyDo: 'Tiếp nhận đơn tố cáo từ nạn nhân',
      nguoiThucHien: 'Thượng úy Lê Văn C',
      ngayThucHien: new Date('2026-03-29T08:00:00'),
    },
  ];

  for (const item of data) {
    await prisma.lichSuXuLyVuViec.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} lịch sử xử lý vụ việc`);
}

// ============== TÀI LIỆU ĐỐI TƯỢNG ==============
export async function seedTaiLieuDoiTuong(doiTuongList: any[]) {
  console.log('📄 Seeding Tài liệu đối tượng...');

  const data = [
    { doiTuongId: doiTuongList[0].id, tenTaiLieu: 'Ảnh chụp CCCD', loaiTaiLieu: LoaiTaiLieu.HINH_ANH, duongDan: '/uploads/tai-lieu/cccd-nguyen-van-an.jpg', kichThuoc: 524288, moTa: 'Ảnh chụp CCCD 2 mặt' },
    { doiTuongId: doiTuongList[0].id, tenTaiLieu: 'Biên bản lấy lời khai', loaiTaiLieu: LoaiTaiLieu.TAI_LIEU, duongDan: '/uploads/tai-lieu/bb-loi-khai-an.pdf', kichThuoc: 1048576, moTa: 'Biên bản lấy lời khai lần 1' },
    { doiTuongId: doiTuongList[1].id, tenTaiLieu: 'Ảnh chụp CCCD', loaiTaiLieu: LoaiTaiLieu.HINH_ANH, duongDan: '/uploads/tai-lieu/cccd-tran-thi-binh.jpg', kichThuoc: 512000 },
    { doiTuongId: doiTuongList[2].id, tenTaiLieu: 'Video camera an ninh', loaiTaiLieu: LoaiTaiLieu.VIDEO, duongDan: '/uploads/tai-lieu/camera-cuong.mp4', kichThuoc: 10485760, moTa: 'Video ghi hình tại hiện trường' },
    { doiTuongId: doiTuongList[2].id, tenTaiLieu: 'Bản án năm 2016', loaiTaiLieu: LoaiTaiLieu.CHUNG_CU_SO, duongDan: '/uploads/tai-lieu/ban-an-cuong-2016.pdf', kichThuoc: 2097152 },
  ];

  for (const item of data) {
    await prisma.taiLieuDoiTuong.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} tài liệu đối tượng`);
}

// ============== TÀI LIỆU VỤ VIỆC ==============
export async function seedTaiLieuVuViec(vuViecList: any[]) {
  console.log('📄 Seeding Tài liệu vụ việc...');

  const data = [
    { vuViecId: vuViecList[0].id, tenTaiLieu: 'Video camera bãi xe', loaiTaiLieu: LoaiTaiLieu.VIDEO, duongDan: '/uploads/tai-lieu/camera-bai-xe.mp4', kichThuoc: 15728640, moTa: 'Video camera ghi hình toàn cảnh vụ trộm' },
    { vuViecId: vuViecList[0].id, tenTaiLieu: 'Biên bản khám nghiệm hiện trường', loaiTaiLieu: LoaiTaiLieu.TAI_LIEU, duongDan: '/uploads/tai-lieu/bb-kham-nghiem-hs001.pdf', kichThuoc: 1572864 },
    { vuViecId: vuViecList[1].id, tenTaiLieu: 'Ảnh hiện trường', loaiTaiLieu: LoaiTaiLieu.HINH_ANH, duongDan: '/uploads/tai-lieu/hien-truong-danh-nhau.jpg', kichThuoc: 819200 },
    { vuViecId: vuViecList[1].id, tenTaiLieu: 'Giấy xác nhận thương tích', loaiTaiLieu: LoaiTaiLieu.CHUNG_CU_SO, duongDan: '/uploads/tai-lieu/xac-nhan-thuong-tich.pdf', kichThuoc: 524288 },
    { vuViecId: vuViecList[2].id, tenTaiLieu: 'Sao kê giao dịch ngân hàng', loaiTaiLieu: LoaiTaiLieu.CHUNG_CU_SO, duongDan: '/uploads/tai-lieu/sao-ke-ngan-hang.pdf', kichThuoc: 2097152, moTa: 'Sao kê tài khoản nạn nhân và đối tượng' },
  ];

  for (const item of data) {
    await prisma.taiLieuVuViec.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} tài liệu vụ việc`);
}

// ============== LỊCH SỬ ĐĂNG NHẬP ==============
export async function seedLichSuDangNhap() {
  console.log('🔐 Seeding Lịch sử đăng nhập...');

  const adminUser = await prisma.nguoiDung.findUnique({ where: { email: 'admin@qlcnc.vn' } });
  const lanhDaoUser = await prisma.nguoiDung.findUnique({ where: { email: 'lanhdao@qlcnc.vn' } });
  const canBoUser = await prisma.nguoiDung.findUnique({ where: { email: 'canbo@qlcnc.vn' } });

  const data = [
    { nguoiDungId: adminUser!.id, diaChiIP: '192.168.1.100', thietBi: 'Windows 10', trinh_duyet: 'Chrome 120', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-03T08:00:00') },
    { nguoiDungId: adminUser!.id, diaChiIP: '192.168.1.100', thietBi: 'Windows 10', trinh_duyet: 'Chrome 120', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-02T08:15:00') },
    { nguoiDungId: adminUser!.id, diaChiIP: '192.168.1.100', thietBi: 'Windows 10', trinh_duyet: 'Chrome 120', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-01T07:45:00') },
    { nguoiDungId: lanhDaoUser!.id, diaChiIP: '192.168.1.50', thietBi: 'MacOS', trinh_duyet: 'Safari 17', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-03T09:00:00') },
    { nguoiDungId: lanhDaoUser!.id, diaChiIP: '192.168.1.50', thietBi: 'MacOS', trinh_duyet: 'Safari 17', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-02T09:30:00') },
    { nguoiDungId: lanhDaoUser!.id, diaChiIP: '192.168.1.50', thietBi: 'iPhone', trinh_duyet: 'Safari Mobile', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-01T14:00:00') },
    { nguoiDungId: canBoUser!.id, diaChiIP: '192.168.1.75', thietBi: 'Windows 11', trinh_duyet: 'Edge 120', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-03T08:30:00') },
    { nguoiDungId: canBoUser!.id, diaChiIP: '192.168.1.75', thietBi: 'Windows 11', trinh_duyet: 'Edge 120', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-02T08:00:00') },
    { nguoiDungId: canBoUser!.id, diaChiIP: '192.168.1.75', thietBi: 'Android', trinh_duyet: 'Chrome Mobile', viTri: 'Đà Nẵng', ngayTao: new Date('2026-04-01T16:00:00') },
    { nguoiDungId: canBoUser!.id, diaChiIP: '192.168.1.75', thietBi: 'Windows 11', trinh_duyet: 'Edge 120', viTri: 'Đà Nẵng', ngayTao: new Date('2026-03-30T08:00:00') },
  ];

  for (const item of data) {
    await prisma.lichSuDangNhap.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} lịch sử đăng nhập`);
}

// ============== DANH SÁCH ĐEN (Blacklist) ==============
export async function seedDanhSachDen() {
  console.log('🚫 Seeding Danh sách đen...');

  const data = [
    { token: 'expired-token-abc123xyz', hetHan: new Date('2026-03-01T00:00:00') },
    { token: 'revoked-token-def456uvw', hetHan: new Date('2026-03-15T00:00:00') },
    { token: 'old-session-ghi789rst', hetHan: new Date('2026-02-20T00:00:00') },
  ];

  for (const item of data) {
    await prisma.danhSachDen.create({ data: item });
  }

  console.log(`✅ Đã tạo ${data.length} token blacklist`);
}
