import {
  BadRequestException,
  Injectable,
  Logger,
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
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { isValidEmail } from 'src/helper/util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
  ): Promise<{
    statusCode: number;
    message: string;
    data: {
      access_token: string;
      user: any;
    };
  }> {
    // Retry logic for database connection
    let retries = 3;
    let user: any = null;
    let lastError: any = null;

    while (retries > 0 && !user) {
      try {
        user = await this.prisma.nguoiDung.findFirst({
          where: {
            email: loginDTO.email,
          },
          select: {
            id: true,
            email: true,
            hoTen: true,
            matKhau: true,
            trangThaiHoatDong: true,
            loaiNguoiDung: true,
            vaiTroNguoiDung: {
              select: {
                vaiTro: {
                  select: {
                    tenVaiTro: true,
                    vaiTroQuyen: {
                      select: {
                        quyen: {
                          select: {
                            tenQuyen: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          this.logger.warn(`Database connection failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
      }
    }

    if (!user && lastError) {
      this.logger.error('Failed to connect to database after retries', lastError);
      throw new UnauthorizedException('Service temporarily unavailable. Please try again.');
    }

    if (!user || !user.trangThaiHoatDong) {
      throw new UnauthorizedException('User not found or blocked');
    }

    const isMatched = await this.decryptPassword(
      loginDTO.password,
      user.matKhau,
    );

    if (!isMatched) {
      throw new UnauthorizedException('Invalid password');
    }

    const roles = user.vaiTroNguoiDung.map((ur) => ur.vaiTro.tenVaiTro);

    const permissionsSet = new Set<string>();
    user.vaiTroNguoiDung.forEach((ur) => {
      ur.vaiTro.vaiTroQuyen.forEach((vq) => {
        permissionsSet.add(vq.quyen.tenQuyen);
      });
    });

    const permissions = Array.from(permissionsSet);

    const access_token = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
        roles,
        permissions,
        jti: uuidv4(),
      },
      { expiresIn: '24h' },
    );

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
        viTri: null,
      },
    });

    await this.prisma.nguoiDung.update({
      where: { id: user.id },
      data: { lanDangNhapCuoi: new Date() },
    });

    const { matKhau, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        access_token,
        user: {
          ...userWithoutPassword,
          roles,
          permissions,
        },
      },
    };
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

  async updateProfile(userId: string, updateProfileDTO: UpdateProfileDTO) {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Nếu thay đổi email hoặc mật khẩu, yêu cầu xác nhận mật khẩu hiện tại
    if ((updateProfileDTO.email && updateProfileDTO.email !== user.email) || updateProfileDTO.newPassword) {
      if (!updateProfileDTO.currentPassword) {
        throw new BadRequestException('Current password is required to change email or password');
      }

      const isPasswordValid = await this.decryptPassword(
        updateProfileDTO.currentPassword,
        user.matKhau,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    // Kiểm tra email đã tồn tại chưa (nếu đổi email)
    if (updateProfileDTO.email && updateProfileDTO.email !== user.email) {
      const existingUser = await this.prisma.nguoiDung.findUnique({
        where: { email: updateProfileDTO.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Chuẩn bị dữ liệu update
    const dataToUpdate: any = {};

    if (updateProfileDTO.hoTen) {
      dataToUpdate.hoTen = updateProfileDTO.hoTen;
    }

    if (updateProfileDTO.email && updateProfileDTO.email !== user.email) {
      dataToUpdate.email = updateProfileDTO.email;
    }

    if (updateProfileDTO.soDienThoai !== undefined) {
      dataToUpdate.soDienThoai = updateProfileDTO.soDienThoai;
    }

    if (updateProfileDTO.newPassword) {
      const hashedPassword = await this.encryptPassword(updateProfileDTO.newPassword, 10);
      dataToUpdate.matKhau = hashedPassword;
    }

    // Update user
    const updatedUser = await this.prisma.nguoiDung.update({
      where: { id: userId },
      data: dataToUpdate,
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

    // Format response giống với login
    const roles = updatedUser.vaiTroNguoiDung.map((vtn) => vtn.vaiTro.tenVaiTro);
    const permissions = updatedUser.vaiTroNguoiDung.flatMap((vtn) =>
      vtn.vaiTro.vaiTroQuyen.map((vtq) => vtq.quyen.tenQuyen),
    );

    const { matKhau, ...userWithoutPassword } = updatedUser;

    return {
      ...userWithoutPassword,
      roles,
      permissions,
    };
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
