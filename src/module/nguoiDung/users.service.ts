import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { SignupResponse } from './user';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, NguoiDung } from '@prisma/client';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as jwt from 'jsonwebtoken';
import { AssignRoleDTO } from './dto/assign-role.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }
  async getAllUsers(params: {
    page: number;
    pageSize: number;
    orderBy?: Prisma.NguoiDungOrderByWithRelationInput;
    role?: string;
  }): Promise<NguoiDung[]> {
    const { page, pageSize, orderBy, role } = params;

    return this.prisma.nguoiDung.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      where: {
        ...(role
          ? {
            vaiTroNguoiDung: {
              some: {
                vaiTro: {
                  tenVaiTro: role,
                },
              },
            },
          }
          : {}),
      },
      include: {
        vaiTroNguoiDung: {
          include: {
            vaiTro: true,
          },
        },
      },
    });
  }

  async createUser(payload: CreateUserDTO): Promise<SignupResponse> {
    const existingUser = await this.prisma.nguoiDung.findFirst({
      where: {
        email: payload.email,
      },
    });
    if (existingUser) {
      throw new BadRequestException(
        'User created with the email you provided',
        {
          cause: new Error(),
          description: 'user is already registered',
        },
      );
    }
    const hash = await this.encryptPassword(payload.matKhau, 10);
    payload.matKhau = hash;
    return await this.prisma.nguoiDung.create({
      data: payload,
      select: {
        email: true,
        id: true,
      },
    });
  }

  async updateUser(
    params: {
      where: Prisma.NguoiDungWhereUniqueInput;
    },
    updateUserDto: UpdateUserDTO,
  ): Promise<NguoiDung> {
    const { where } = params;
    return this.prisma.nguoiDung.update({
      where,
      data: {
        ...updateUserDto,
      },
    });
  }

  async deleteUser(where: Prisma.NguoiDungWhereUniqueInput): Promise<NguoiDung> {
    return this.prisma.nguoiDung.delete({
      where,
    });
  }

  async getUserById(id: string): Promise<NguoiDung | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<NguoiDung | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  async blockUser(userId: string): Promise<NguoiDung> {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const updatedUser = await this.prisma.nguoiDung.update({
      where: { id: userId },
      data: { trangThaiHoatDong: !user.trangThaiHoatDong },
    });

    return updatedUser;
  }

  async assignRole(dto: AssignRoleDTO) {
    const { userId, roleId } = dto;

    // Kiểm tra user
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Kiểm tra role
    const role = await this.prisma.vaiTro.findUnique({
      where: { id: roleId },
    });
    if (!role) throw new NotFoundException('Role not found');

    // Gán role cho user
    return await this.prisma.vaiTroNguoiDung.upsert({
      where: {
        nguoiDungId_vaiTroId: { nguoiDungId: userId, vaiTroId: roleId },
      },
      update: {},
      create: { nguoiDungId: userId, vaiTroId: roleId },
    });
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<NguoiDung> {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Note: avatarUrl field doesn't exist in schema yet
    // You may need to add it to the NguoiDung model if needed
    return this.prisma.nguoiDung.update({
      where: { id: userId },
      data: {
        // avatarUrl: avatarUrl 
        // Temporarily removing this until schema is updated
      },
    });
  }

  async encryptPassword(plainText: any, saltRounds: any) {
    return await bcrypt.hash(plainText, saltRounds);
  }

  async decryptPassword(plainText: any, hash: any) {
    return await bcrypt.compare(plainText, hash);
  }
}
