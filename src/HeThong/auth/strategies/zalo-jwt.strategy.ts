import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/databases/entities/user.entity';
import { ZaloAccount } from 'src/databases/entities/ZaloAccount.entity';
import { ZaloUser } from 'src/databases/entities/ZaloUser.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ZaloJwtStrategy extends PassportStrategy(Strategy, 'zalo-jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ZaloAccount)
    private zaloAccountRepository: Repository<ZaloAccount>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ZALO_JWT_SECRET') || 'zalo-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('🔍 ZaloJwtStrategy validate - Payload:', JSON.stringify(payload, null, 2));

    const searchZaloId = payload.zaloId || payload.sub;
    console.log('🔍 Tìm ZaloUser với zaloId:', searchZaloId);

    // Tìm ZaloUser theo zaloId từ JWT payload
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { zaloAppUserId: searchZaloId }
    });

    console.log('🔍 ZaloUser tìm thấy:', zaloUser ? {
      id: zaloUser.id,
      zaloId: zaloUser.zaloAppUserId,
      userId: zaloUser.userId,
      name: zaloUser.displayName
    } : 'KHÔNG TÌM THẤY');

    if (!zaloUser) {
      throw new UnauthorizedException(`Zalo user không tồn tại trong hệ thống. Tìm với zaloId: ${searchZaloId}`);
    }

    // Tìm User trong hệ thống theo phone hoặc mapping
    let systemUser = null;

    if (zaloUser.userId) {
      // Đã có mapping với User
      systemUser = await this.userRepository.findOne({
        where: { id: zaloUser.userId }
      });
      console.log('✅ Tìm thấy User đã link:', systemUser?.id);
    } else {
      // Chưa link: Tìm User existing theo phone hoặc tự động tạo mới
      console.log('⚠️ ZaloUser chưa được link, tìm theo phone hoặc tạo mới');

      if (payload.phone || zaloUser.phone) {
        // Tìm theo phone number nếu có
        const phoneToSearch = payload.phone || zaloUser.phone;
        systemUser = await this.userRepository.findOne({
          where: { phoneNumber: phoneToSearch }
        });
        console.log(`🔍 Tìm User theo phone ${phoneToSearch}:`, systemUser?.id || 'KHÔNG TÌM THẤY');
      }
    }

    if (!systemUser) {
      // Tự động tạo User hệ thống cho ZaloUser
      console.log('🔧 Tự động tạo User hệ thống cho ZaloUser:', zaloUser.zaloAppUserId);

      systemUser = this.userRepository.create({
        identity: `zalo_${zaloUser.zaloAppUserId}`,
        email: `zalo_${zaloUser.zaloAppUserId}@zalo.local`,
        fullName: zaloUser.displayName || 'Zalo User',
        roleId: 1, // Default role
        isActive: 1,
        passWord: 'zalo_generated',
        phoneNumber: zaloUser.phone || payload.phone || `zalo_${zaloUser.zaloAppUserId}`
      });

      // Generate UUID cho user
      systemUser.id = randomUUID();
      systemUser = await this.userRepository.save(systemUser);

      // Link ZaloUser với User vừa tạo
      zaloUser.userId = systemUser.id;
      await this.zaloAccountRepository.save(zaloUser);

      console.log('✅ Đã tạo và link User:', systemUser.id);
    }

    // Trả về đầy đủ thông tin user cho req.user
    return {
      id: systemUser.id,              // ← Database User ID (cần cho organization service)
      userId: systemUser.id,          // ← Alias
      zaloId: zaloUser.zaloAppUserId,        // ← Zalo ID
      organizationId: systemUser.organizationId, // ← Quan trọng cho phân quyền
      roleId: systemUser.roleId,      // ← Role permissions
      phone: payload.phone,
      name: payload.name || systemUser.name,
      zaloOaUserId: zaloUser.zaloOaUserId,
      // Thông tin Zalo
      zaloUser: {
        id: zaloUser.id,
        zaloId: zaloUser.zaloAppUserId,
        name: zaloUser.displayName,
        avatar: zaloUser.avatar,
        zaloOaUserId: zaloUser.zaloOaUserId
      }
    };
  }
}
