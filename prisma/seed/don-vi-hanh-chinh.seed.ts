import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDonViHanhChinh() {
  console.log('🌱 Seeding Đơn vị hành chính...');

  // Xóa dữ liệu cũ (nếu có)
  await prisma.donViHanhChinh.deleteMany({});

  // TỈNH/THÀNH PHỐ (Cấp 1)
  const tinhThanhPho = [
    { id: 'tp-danang', ma: 'DN', ten: 'Đà Nẵng', loai: 'Thành phố' },
    { id: 'tp-quangnam', ma: 'QN', ten: 'Quảng Nam', loai: 'Tỉnh' },
    { id: 'tp-hcm', ma: 'HCM', ten: 'Hồ Chí Minh', loai: 'Thành phố' },
    { id: 'tp-hanoi', ma: 'HN', ten: 'Hà Nội', loai: 'Thành phố' },
    { id: 'tp-haiphong', ma: 'HP', ten: 'Hải Phòng', loai: 'Thành phố' },
    { id: 'tp-cantho', ma: 'CT', ten: 'Cần Thơ', loai: 'Thành phố' },
  ];

  for (const tp of tinhThanhPho) {
    await prisma.donViHanhChinh.create({
      data: {
        id: tp.id,
        ma: tp.ma,
        ten: tp.ten,
        cap: 1,
        loai: tp.loai,
        trangThai: true,
      },
    });
  }

  console.log('✅ Đã tạo', tinhThanhPho.length, 'Tỉnh/Thành phố');

  // XÃ/PHƯỜNG theo từng tỉnh/thành phố
  const xaPhuong = [
    // Đà Nẵng
    { ma: 'DN-P001', ten: 'Phường Hòa Thuận Tây', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-P002', ten: 'Phường Hòa Minh', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-X001', ten: 'Xã Hòa Phước', loai: 'Xã', tinhId: 'tp-danang' },
    { ma: 'DN-P003', ten: 'Phường Thanh Khê', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-P004', ten: 'Phường Hải Châu I', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-P005', ten: 'Phường Hải Châu II', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-P006', ten: 'Phường Thạch Thang', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-P007', ten: 'Phường Phước Ninh', loai: 'Phường', tinhId: 'tp-danang' },
    { ma: 'DN-X002', ten: 'Xã Hòa Bắc', loai: 'Xã', tinhId: 'tp-danang' },
    { ma: 'DN-X003', ten: 'Xã Hòa Liên', loai: 'Xã', tinhId: 'tp-danang' },

    // Quảng Nam
    { ma: 'QN-P001', ten: 'Phường Điện Ngọc', loai: 'Phường', tinhId: 'tp-quangnam' },
    { ma: 'QN-X001', ten: 'Xã Điện Phương', loai: 'Xã', tinhId: 'tp-quangnam' },
    { ma: 'QN-X002', ten: 'Xã Hội An', loai: 'Xã', tinhId: 'tp-quangnam' },
    { ma: 'QN-P002', ten: 'Phường Cẩm Phô', loai: 'Phường', tinhId: 'tp-quangnam' },
    { ma: 'QN-X003', ten: 'Xã Tam Kỳ', loai: 'Xã', tinhId: 'tp-quangnam' },
    { ma: 'QN-X004', ten: 'Xã Điện Bàn', loai: 'Xã', tinhId: 'tp-quangnam' },
    { ma: 'QN-P003', ten: 'Phường Cửa Đại', loai: 'Phường', tinhId: 'tp-quangnam' },
    { ma: 'QN-X005', ten: 'Xã Duy Xuyên', loai: 'Xã', tinhId: 'tp-quangnam' },

    // TP. Hồ Chí Minh
    { ma: 'HCM-P001', ten: 'Phường Bến Nghé', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-P002', ten: 'Phường Nguyễn Thái Bình', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-P003', ten: 'Phường Bến Thành', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-X001', ten: 'Xã Bình Hưng Hòa', loai: 'Xã', tinhId: 'tp-hcm' },
    { ma: 'HCM-P004', ten: 'Phường Tân Định', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-P005', ten: 'Phường Đa Kao', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-P006', ten: 'Phường Tân Sơn Nhì', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-X002', ten: 'Xã Phú Xuân', loai: 'Xã', tinhId: 'tp-hcm' },
    { ma: 'HCM-P007', ten: 'Phường Thảo Điền', loai: 'Phường', tinhId: 'tp-hcm' },
    { ma: 'HCM-P008', ten: 'Phường An Phú', loai: 'Phường', tinhId: 'tp-hcm' },

    // Hà Nội
    { ma: 'HN-P001', ten: 'Phường Láng Hạ', loai: 'Phường', tinhId: 'tp-hanoi' },
    { ma: 'HN-P002', ten: 'Phường Thành Công', loai: 'Phường', tinhId: 'tp-hanoi' },
    { ma: 'HN-X001', ten: 'Xã Đông Anh', loai: 'Xã', tinhId: 'tp-hanoi' },
    { ma: 'HN-P003', ten: 'Phường Cầu Giấy', loai: 'Phường', tinhId: 'tp-hanoi' },
    { ma: 'HN-P004', ten: 'Phường Dịch Vọng', loai: 'Phường', tinhId: 'tp-hanoi' },
    { ma: 'HN-X002', ten: 'Xã Sóc Sơn', loai: 'Xã', tinhId: 'tp-hanoi' },
    { ma: 'HN-P005', ten: 'Phường Hoàng Cầu', loai: 'Phường', tinhId: 'tp-hanoi' },
    { ma: 'HN-P006', ten: 'Phường Ô Chợ Dừa', loai: 'Phường', tinhId: 'tp-hanoi' },
    { ma: 'HN-X003', ten: 'Xã Thanh Trì', loai: 'Xã', tinhId: 'tp-hanoi' },

    // Hải Phòng
    { ma: 'HP-P001', ten: 'Phường Lê Chân', loai: 'Phường', tinhId: 'tp-haiphong' },
    { ma: 'HP-P002', ten: 'Phường Đằng Giang', loai: 'Phường', tinhId: 'tp-haiphong' },
    { ma: 'HP-X001', ten: 'Xã An Dương', loai: 'Xã', tinhId: 'tp-haiphong' },
    { ma: 'HP-P003', ten: 'Phường Cát Bi', loai: 'Phường', tinhId: 'tp-haiphong' },
    { ma: 'HP-X002', ten: 'Xã Tiên Lãng', loai: 'Xã', tinhId: 'tp-haiphong' },

    // Cần Thơ
    { ma: 'CT-P001', ten: 'Phường Xuân Khánh', loai: 'Phường', tinhId: 'tp-cantho' },
    { ma: 'CT-P002', ten: 'Phường An Hòa', loai: 'Phường', tinhId: 'tp-cantho' },
    { ma: 'CT-X001', ten: 'Xã Thới Lai', loai: 'Xã', tinhId: 'tp-cantho' },
    { ma: 'CT-P003', ten: 'Phường Tân An', loai: 'Phường', tinhId: 'tp-cantho' },
    { ma: 'CT-X002', ten: 'Xã Phong Điền', loai: 'Xã', tinhId: 'tp-cantho' },
  ];

  let count = 0;
  for (const xp of xaPhuong) {
    await prisma.donViHanhChinh.create({
      data: {
        ma: xp.ma,
        ten: xp.ten,
        cap: 2,
        loai: xp.loai,
        tinhThanhPhoId: xp.tinhId,
        trangThai: true,
      },
    });
    count++;
  }

  console.log('✅ Đã tạo', count, 'Xã/Phường');
  console.log('🎉 Hoàn thành seed Đơn vị hành chính!');
}
