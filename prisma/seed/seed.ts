import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { seedDonViHanhChinh } from './don-vi-hanh-chinh.seed';
import {
  seedQuanHeXaHoi,
  seedToimDanh,
  seedDonVi,
  seedBieuMau,
  seedCauHinhHeThong,
  seedThongBao,
  seedHoSoDoiTuong,
  seedHoSoVuViec,
  seedQuanHeDoiTuong,
  seedVuViecDoiTuong,
  seedVuViecToimDanh,
  seedLichSuXuLyVuViec,
  seedTaiLieuDoiTuong,
  seedTaiLieuVuViec,
  seedLichSuDangNhap,
  seedDanhSachDen,
} from './all-tables.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ========== STEP 1: Load and create permissions ==========
  const permissionsData = await fs.readFile(
    path.join(__dirname, 'permissions.json'),
    'utf-8',
  );
  const permissions = JSON.parse(permissionsData);

  console.log('📋 Seeding permissions...');
  for (const perm of permissions) {
    await prisma.quyen.upsert({
      where: { tenQuyen: perm.name },
      update: { moTa: perm.description },
      create: {
        tenQuyen: perm.name,
        moTa: perm.description,
      },
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // ========== STEP 2: Get all permissions for role assignment ==========
  const allPermissions = await prisma.quyen.findMany();

  // ========== STEP 3: Create Roles with specific permissions ==========

  // 3.1. ADMIN Role - Full quyền
  console.log('👑 Creating Admin role...');
  const adminRole = await prisma.vaiTro.upsert({
    where: { tenVaiTro: 'Admin' },
    update: {},
    create: {
      tenVaiTro: 'Admin',
      moTa: 'Quản trị viên - Full quyền',
    },
  });

  // Gán TẤT CẢ permissions cho Admin
  for (const perm of allPermissions) {
    await prisma.vaiTroQuyen.upsert({
      where: {
        vaiTroId_quyenId: {
          vaiTroId: adminRole.id,
          quyenId: perm.id,
        },
      },
      update: {},
      create: {
        vaiTroId: adminRole.id,
        quyenId: perm.id,
      },
    });
  }
  console.log('✅ Admin role created with full permissions');

  // 3.2. LÃNH ĐẠO Role - Xem danh sách, báo cáo (KHÔNG thêm/sửa/xóa)
  console.log('📊 Creating Lãnh đạo role...');
  const lanhDaoRole = await prisma.vaiTro.upsert({
    where: { tenVaiTro: 'Lãnh đạo' },
    update: {},
    create: {
      tenVaiTro: 'Lãnh đạo',
      moTa: 'Lãnh đạo - Xem danh sách, báo cáo, thống kê',
    },
  });

  // Permissions cho Lãnh đạo - CHỈ XEM (không thêm/sửa/xóa)
  const lanhDaoPermissions = [
    'ho-so-doi-tuong:read',
    'ho-so-vu-viec:read',
    'bao-cao:read',
    'bao-cao:export',
    'danh-muc:read',
    'toi-danh:read',
    'quan-he-xa-hoi:read',
    'don-vi:read',
    'don-vi-to-chuc:read',
    'bieu-mau:read',
    'thong-bao:read',
  ];

  for (const permName of lanhDaoPermissions) {
    const perm = allPermissions.find((p) => p.tenQuyen === permName);
    if (perm) {
      await prisma.vaiTroQuyen.upsert({
        where: {
          vaiTroId_quyenId: {
            vaiTroId: lanhDaoRole.id,
            quyenId: perm.id,
          },
        },
        update: {},
        create: {
          vaiTroId: lanhDaoRole.id,
          quyenId: perm.id,
        },
      });
    }
  }
  console.log('✅ Lãnh đạo role created with read-only permissions');

  // 3.3. CÁN BỘ NGHIỆP VỤ Role - CRUD đối tượng, vụ việc, tài liệu
  console.log('👮 Creating Cán bộ nghiệp vụ role...');
  const canBoRole = await prisma.vaiTro.upsert({
    where: { tenVaiTro: 'Cán bộ nghiệp vụ' },
    update: {},
    create: {
      tenVaiTro: 'Cán bộ nghiệp vụ',
      moTa: 'Cán bộ nghiệp vụ - Quản lý hồ sơ, vụ việc, tài liệu',
    },
  });

  // Permissions cho Cán bộ nghiệp vụ
  const canBoPermissions = [
    'ho-so-doi-tuong:read',
    'ho-so-doi-tuong:create',
    'ho-so-doi-tuong:update',
    'ho-so-doi-tuong:delete',
    'ho-so-vu-viec:read',
    'ho-so-vu-viec:create',
    'ho-so-vu-viec:update',
    'ho-so-vu-viec:delete',
    'tai-lieu:read',
    'tai-lieu:create',
    'bao-cao:read',
    'chatbot:read',
    'chatbot:manage',
    'danh-muc:read',
    'toi-danh:read',
    'toi-danh:create',
    'toi-danh:update',
    'toi-danh:delete',
    'quan-he-xa-hoi:read',
    'quan-he-xa-hoi:create',
    'quan-he-xa-hoi:update',
    'quan-he-xa-hoi:delete',
    'don-vi:read',
    'don-vi:create',
    'don-vi:update',
    'don-vi:delete',
    'don-vi-to-chuc:read',
    'don-vi-to-chuc:create',
    'don-vi-to-chuc:update',
    'don-vi-to-chuc:delete',
    'bieu-mau:read',
    'bieu-mau:create',
    'bieu-mau:update',
    'bieu-mau:delete',
    'thong-bao:read',
    'thong-bao:create',
    'thong-bao:update',
    'thong-bao:delete',
  ];

  for (const permName of canBoPermissions) {
    const perm = allPermissions.find((p) => p.tenQuyen === permName);
    if (perm) {
      await prisma.vaiTroQuyen.upsert({
        where: {
          vaiTroId_quyenId: {
            vaiTroId: canBoRole.id,
            quyenId: perm.id,
          },
        },
        update: {},
        create: {
          vaiTroId: canBoRole.id,
          quyenId: perm.id,
        },
      });
    }
  }
  console.log('✅ Cán bộ nghiệp vụ role created with CRUD permissions');

  // ========== STEP 4: Create Test Users ==========
  console.log('\n👥 Creating test users...');

  const hashedPassword = await bcrypt.hash('123456', 10); // Tất cả user dùng password: 123456

  // 4.1. Admin User
  const adminUser = await prisma.nguoiDung.upsert({
    where: { email: 'admin@qlcnc.vn' },
    update: {},
    create: {
      hoTen: 'Admin Hệ thống',
      email: 'admin@qlcnc.vn',
      matKhau: hashedPassword,
      soDienThoai: '0901234567',
      loaiNguoiDung: 'QUAN_TRI_VIEN',
      trangThaiHoatDong: true,
    },
  });

  await prisma.vaiTroNguoiDung.upsert({
    where: {
      nguoiDungId_vaiTroId: {
        nguoiDungId: adminUser.id,
        vaiTroId: adminRole.id,
      },
    },
    update: {},
    create: {
      nguoiDungId: adminUser.id,
      vaiTroId: adminRole.id,
    },
  });
  console.log('✅ Admin user: admin@qlcnc.vn / 123456');

  // 4.2. Lãnh đạo User
  const lanhDaoUser = await prisma.nguoiDung.upsert({
    where: { email: 'lanhdao@qlcnc.vn' },
    update: {},
    create: {
      hoTen: 'Nguyễn Văn Lãnh Đạo',
      email: 'lanhdao@qlcnc.vn',
      matKhau: hashedPassword,
      soDienThoai: '0901234568',
      loaiNguoiDung: 'LANH_DAO',
      trangThaiHoatDong: true,
    },
  });

  await prisma.vaiTroNguoiDung.upsert({
    where: {
      nguoiDungId_vaiTroId: {
        nguoiDungId: lanhDaoUser.id,
        vaiTroId: lanhDaoRole.id,
      },
    },
    update: {},
    create: {
      nguoiDungId: lanhDaoUser.id,
      vaiTroId: lanhDaoRole.id,
    },
  });
  console.log('✅ Lãnh đạo user: lanhdao@qlcnc.vn / 123456');

  // 4.3. Cán bộ nghiệp vụ User
  const canBoUser = await prisma.nguoiDung.upsert({
    where: { email: 'canbo@qlcnc.vn' },
    update: {},
    create: {
      hoTen: 'Trần Thị Cán Bộ',
      email: 'canbo@qlcnc.vn',
      matKhau: hashedPassword,
      soDienThoai: '0901234569',
      loaiNguoiDung: 'CAN_BO_NGHIEP_VU',
      trangThaiHoatDong: true,
    },
  });

  await prisma.vaiTroNguoiDung.upsert({
    where: {
      nguoiDungId_vaiTroId: {
        nguoiDungId: canBoUser.id,
        vaiTroId: canBoRole.id,
      },
    },
    update: {},
    create: {
      nguoiDungId: canBoUser.id,
      vaiTroId: canBoRole.id,
    },
  });
  console.log('✅ Cán bộ user: canbo@qlcnc.vn / 123456');

  // ========== STEP 5: Seed Categories & Configuration Tables ==========
  console.log('\n📚 Seeding category tables...');
  await seedQuanHeXaHoi();
  await seedToimDanh();
  await seedDonVi();
  await seedBieuMau();
  await seedCauHinhHeThong();
  await seedThongBao();

  // ========== STEP 6: Seed Đơn vị hành chính ==========
  console.log('\n🏛️ Seeding administrative units...');
  await seedDonViHanhChinh();

  // ========== STEP 7: Seed Main Entity Tables ==========
  console.log('\n👥 Seeding main entity tables...');
  const doiTuongList = await seedHoSoDoiTuong();
  const vuViecList = await seedHoSoVuViec(doiTuongList);

  // ========== STEP 8: Seed Relationship Tables ==========
  console.log('\n🔗 Seeding relationship tables...');
  await seedQuanHeDoiTuong(doiTuongList);
  await seedVuViecDoiTuong(vuViecList, doiTuongList);
  await seedVuViecToimDanh(vuViecList);
  await seedLichSuXuLyVuViec(vuViecList);

  // ========== STEP 9: Seed Document Tables ==========
  console.log('\n📄 Seeding document tables...');
  await seedTaiLieuDoiTuong(doiTuongList);
  await seedTaiLieuVuViec(vuViecList);

  // ========== STEP 10: Seed System Tables ==========
  console.log('\n🔒 Seeding system tables...');
  await seedLichSuDangNhap();
  await seedDanhSachDen();

  console.log('\n✅ ========== SEED COMPLETED ==========');
  console.log('\n📊 DATA SUMMARY:');
  console.log('👤 Users: 3 (admin, lanhdao, canbo)');
  console.log('🎭 Roles: 3 (Admin, Lãnh đạo, Cán bộ nghiệp vụ)');
  console.log('🔑 Permissions: 23');
  console.log('🏛️ Administrative Units: 6 tỉnh/TP + 47 xã/phường');
  console.log('👨‍👩‍👧‍👦 Social Relations: 20');
  console.log('⚖️ Crimes: 25');
  console.log('🏢 Departments: 10');
  console.log('📝 Forms: 10');
  console.log('⚙️ System Configs: 15');
  console.log('🔔 Notifications: 10');
  console.log('👤 Subjects: 3');
  console.log('📁 Cases: 3');
  console.log('📄 Documents: ~10');
  console.log('🔐 Login History: 10');
  console.log('\n📝 TEST ACCOUNTS:');
  console.log('1. Admin:     admin@qlcnc.vn    / 123456');
  console.log('2. Lãnh đạo:  lanhdao@qlcnc.vn  / 123456');
  console.log('3. Cán bộ:    canbo@qlcnc.vn    / 123456');
  console.log('\n🔐 All users use password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
