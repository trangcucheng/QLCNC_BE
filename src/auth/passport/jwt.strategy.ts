import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const startTime = Date.now();

    try {
      // Skip blacklist check temporarily due to performance issues
      // TODO: Re-enable when database performance improves or use Redis
      /*
      if (payload.jti) {
        const blacklistStart = Date.now();
        try {
          const blacklisted = await Promise.race([
            this.prisma.danhSachDen.findFirst({
              where: {
                token: payload.jti,
                hetHan: { gte: new Date() },
              },
              select: { token: true },
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Blacklist check timeout')), 3000)
            )
          ]) as any;

          const blacklistDuration = Date.now() - blacklistStart;
          if (blacklistDuration > 500) {
            this.logger.warn(`Blacklist check took ${blacklistDuration}ms`);
          }

          if (blacklisted) {
            throw new UnauthorizedException('Token has been blacklisted');
          }
        } catch (blacklistError) {
          this.logger.error(`Blacklist check failed: ${blacklistError.message}`);
        }
      }
      */

      // ✅ Validate user with lightweight query (only basic info)
      const userStart = Date.now();
      const user = await Promise.race([
        this.prisma.nguoiDung.findUnique({
          where: { id: payload.id },
          select: {
            id: true,
            email: true,
            hoTen: true,
            trangThaiHoatDong: true,
            loaiNguoiDung: true,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('User query timeout')), 2000)
        )
      ]) as any;

      const userDuration = Date.now() - userStart;
      if (userDuration > 500) {
        this.logger.warn(`User query took ${userDuration}ms for user ${payload.id}`);
      }

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Load roles and permissions separately with timeout
      let roles: string[] = [];
      let permissions: string[] = [];

      try {
        const rolesData = await Promise.race([
          this.prisma.nguoiDung.findUnique({
            where: { id: payload.id },
            select: {
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
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Roles query timeout')), 1500)
          )
        ]) as any;

        if (rolesData) {
          roles = rolesData.vaiTroNguoiDung.map((ur: any) => ur.vaiTro.tenVaiTro);
          permissions = rolesData.vaiTroNguoiDung.flatMap((ur: any) =>
            ur.vaiTro.vaiTroQuyen.map((rp: any) => rp.quyen.tenQuyen),
          );
        }
      } catch (rolesError) {
        // If roles query fails, continue with empty roles/permissions
        this.logger.warn(`Roles query failed: ${rolesError.message}. Using cached data from JWT.`);
        // Use roles from JWT payload if available
        roles = payload.roles || [];
        permissions = payload.permissions || [];
      }

      const totalDuration = Date.now() - startTime;
      if (totalDuration > 3000) {
        this.logger.warn(`JWT validation took ${totalDuration}ms for user ${payload.id}`);
      }

      // ✅ Return user object with roles and permissions attached
      return {
        ...user,
        roles,
        permissions,
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      this.logger.error(`JWT validation error after ${totalDuration}ms:`, error);

      // If database connection error, throw more specific error
      if (error.code === 'P1001' || error.message?.includes('timeout')) {
        throw new UnauthorizedException('Service temporarily unavailable. Please try again.');
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
