import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Load permissions from JSON file
  const permissionsData = await fs.readFile(
    path.join(__dirname, 'permissions.json'),
    'utf-8',
  );
  const permissions = JSON.parse(permissionsData);

  // Upsert permissions
  for (const perm of permissions) {
    await prisma.quyen.upsert({
      where: { tenQuyen: perm.name },
      update: {},
      create: {
        tenQuyen: perm.name,
        moTa: perm.description,
      },
    });
  }

  console.log('✅ Seeding permissions complete.');

  // Tạo role Admin và gán toàn bộ permission
  const allPermissions = await prisma.quyen.findMany();

  const adminRole = await prisma.vaiTro.upsert({
    where: { tenVaiTro: 'ADMIN' },
    update: {},
    create: {
      tenVaiTro: 'ADMIN',
      moTa: 'Administrator with all permissions',
      vaiTroQuyen: {
        create: allPermissions.map((p) => ({
          quyen: { connect: { id: p.id } },
        })),
      },
    },
  });

  console.log('✅ Seeding Admin role complete.');

  // Tạo role USER mặc định không gán permission
  await prisma.vaiTro.upsert({
    where: { tenVaiTro: 'USER' },
    update: {},
    create: {
      tenVaiTro: 'USER',
      moTa: 'Default user role with no permissions',
    },
  });

  console.log('✅ Seeding User role complete.');

  // 🔥 Tạo user ADMIN mặc định
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin'; // Production: Lấy từ process.env.ADMIN_PASSWORD

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.nguoiDung.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      hoTen: 'Administrator',
      email: adminEmail,
      matKhau: hashedPassword,
      soDienThoai: null,
      loaiNguoiDung: 'QUAN_TRI_VIEN',
      trangThaiHoatDong: true,
      vaiTroNguoiDung: {
        create: [
          {
            vaiTro: {
              connect: { id: adminRole.id },
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Admin user seeded. Email: ${adminEmail}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
