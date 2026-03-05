import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { Prisma, VaiTro } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(createRoleDTO: CreateRoleDTO) {
    const { name, description, permissionIds } = createRoleDTO;

    return await this.prisma.vaiTro.create({
      data: {
        tenVaiTro: name,
        moTa: description,
        vaiTroQuyen: {
          create: permissionIds.map((pid) => ({
            quyen: { connect: { id: pid } },
          })),
        },
      },
      include: { vaiTroQuyen: { include: { quyen: true } } },
    });
  }

  async updateRole(id: string, dto: UpdateRoleDTO) {
    const role = await this.prisma.vaiTro.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    // Xóa hết permission cũ
    await this.prisma.vaiTroQuyen.deleteMany({
      where: { vaiTroId: id },
    });

    // Cập nhật role + permission mới
    return await this.prisma.vaiTro.update({
      where: { id },
      data: {
        tenVaiTro: dto.name,
        moTa: dto.description,
        vaiTroQuyen: {
          create: (dto.permissionIds ?? []).map((pid) => ({
            quyen: { connect: { id: pid } },
          })),
        },
      },
      include: { vaiTroQuyen: { include: { quyen: true } } },
    });
  }

  // async getAllRoles() {
  //   return await this.prisma.vaiTro.findMany({
  //     include: {
  //       vaiTroQuyen: { include: { quyen: true } },
  //     },
  //   });
  // }

  async getAllRoles(
    params: {
      page?: number;
      pageSize?: number;
      where?: Prisma.VaiTroWhereInput;
      orderBy?: Prisma.VaiTroOrderByWithRelationInput;
    } = {},
  ): Promise<VaiTro[]> {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    // findMany không hỗ trợ phân trang trực tiếp, nên ta sẽ sử dụng skip và take (tức là không dùng được page và pageSize)
    return await this.prisma.vaiTro.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        vaiTroQuyen: { include: { quyen: true } },
      },
    });
  }

  async deleteRole(id: string) {
    return await this.prisma.vaiTro.delete({ where: { id } });
  }

  async getRoleById(id: string): Promise<VaiTro | null> {
    return await this.prisma.vaiTro.findUnique({
      where: { id },
      include: { vaiTroQuyen: { include: { quyen: true } } },
    });
  }
}
