import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SignupResponse } from 'src/module/nguoiDung/user';
import { CreateUserDTO } from 'src/module/nguoiDung/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { isValidEmail } from 'src/helper/util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }
  async signup(payload: CreateUserDTO): Promise<SignupResponse> {
    if (!payload.email || payload.email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    if (!isValidEmail(payload.email)) {
      throw new BadRequestException('Invalid email format');
    }
    // Tìm role USER trước
    const userRole = await this.prisma.vaiTro.findUnique({
      where: { tenVaiTro: 'USER' },
    });

    if (!userRole) {
      throw new Error('Default USER role not found');
    }
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

    return await this.prisma.nguoiDung.create({
      data: {
        hoTen: payload.hoTen,
        email: payload.email,
        matKhau: hash,
        soDienThoai: payload.soDienThoai || null,
        loaiNguoiDung: payload.loaiNguoiDung,
        trangThaiHoatDong: payload.trangThaiHoatDong !== undefined ? payload.trangThaiHoatDong : true,
        vaiTroNguoiDung: {
          create: [
            {
              vaiTro: {
                connect: { id: userRole.id },
              },
            },
          ],
        },
      },
      include: { vaiTroNguoiDung: true },
    });
  }

  async login(
    loginDTO: LoginDTO,
    req: Request,
  ): Promise<{ accessToken: string }> {
    // find user based on email
    const user = await this.prisma.nguoiDung.findFirst({
      where: {
        email: loginDTO.email,
      },
      include: {
        vaiTroNguoiDung: {
          include: {
            vaiTro: true, // lấy thông tin role từ VaiTroNguoiDung -> VaiTro_
          },
        },
      },
    });

    if (!user || user.trangThaiHoatDong) {
      throw new UnauthorizedException('User not found or blocked');
    }

    // check password
    const isMatched = await this.decryptPassword(
      loginDTO.password,
      user.matKhau,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid password');
    }

    // Lấy danh sách role name của user
    const roles = user.vaiTroNguoiDung.map((ur) => ur.vaiTro.tenVaiTro);

    // generate JWT token
    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
        roles, // đưa mảng roles vào token
        jti: uuidv4(),
      },
      { expiresIn: '15m' },
    );

    // ✅ Save login history
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';
    await this.prisma.lichSuDangNhap.create({
      data: {
        nguoiDungId: user.id,
        diaChiIP: ip,
        trinh_duyet: req.headers['user-agent'],
        thietBi: this.detectDevice(req.headers['user-agent']),
        viTri: null, // nếu có tích hợp IP geo service,
      },
    });

    return { accessToken };
  }

  private detectDevice(userAgent: string | undefined): string {
    if (!userAgent) return 'unknown';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  async encryptPassword(plainText: any, saltRounds: any) {
    return await bcrypt.hash(plainText, saltRounds);
  }

  async decryptPassword(plainText: any, hash: any) {
    return await bcrypt.compare(plainText, hash);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate JWT reset token (expires in 1h)
    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'reset-secret',
      { expiresIn: '1h' },
    );

    return {
      resetToken: resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'reset-secret',
      );

      const user = await this.prisma.nguoiDung.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const hashed = await this.encryptPassword(newPassword, 10);

      await this.prisma.nguoiDung.update({
        where: { email: decoded.email },
        data: { matKhau: hashed },
      });

      return 'Password has been reset successfully';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDTO: ChangePasswordDTO,
  ): Promise<string> {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatched = await this.decryptPassword(
      changePasswordDTO.oldPassword,
      user.matKhau,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    const hashedNewPassword = await this.encryptPassword(
      changePasswordDTO.newPassword,
      10,
    );
    await this.prisma.nguoiDung.update({
      where: { id: userId },
      data: { matKhau: hashedNewPassword },
    });
    return 'Password changed successfully';
  }

  async logout(userId: string, token: string) {
    if (!userId || !token) {
      throw new BadRequestException(
        'User ID and token are required for logout',
      );
    }

    const decoded = this.jwtService.decode(token) as any;
    if (!decoded?.jti || !decoded?.exp) {
      throw new BadRequestException('Invalid token');
    }

    await this.prisma.danhSachDen.create({
      data: {
        token: decoded.jti,
        hetHan: new Date(decoded.exp * 1000),
      },
    });

    return { message: 'Logged out successfully' };
  }

  async validateUser(payload: any) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: payload.id },
      include: {
        vaiTroNguoiDung: {
          include: {
            vaiTro: {
              include: {
                vaiTroQuyen: {
                  include: {
                    quyen: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const roles = user.vaiTroNguoiDung.map((ur) => ur.vaiTro.tenVaiTro);
    const permissions = user.vaiTroNguoiDung.flatMap((ur) =>
      ur.vaiTro.vaiTroQuyen.map((rp) => rp.quyen.tenQuyen),
    );

    return {
      ...user,
      roles,
      permissions,
    };
  }
}
