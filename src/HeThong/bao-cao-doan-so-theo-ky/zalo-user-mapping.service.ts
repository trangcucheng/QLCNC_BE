import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';

interface ZaloAccountWithUser {
  id: number;
  user_id: string;
  zalo_oa_user_id: string;
  zalo_app_user_id: string;
  display_name: string;
  avatar: string;
  user_full_name: string;
}

@Injectable()
export class ZaloUserMappingService {
  private readonly logger = new Logger(ZaloUserMappingService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
  ) { }

  /**
   * Lấy danh sách Zalo accounts cho tất cả users active
   */
  async getZaloAccountsForAllActiveUsers(): Promise<ZaloAccountWithUser[]> {
    try {
      // Lấy tất cả users active
      const allUsers = await this.userRepository.find({
        where: { isActive: true }
      });

      this.logger.debug(`🔍 Found ${allUsers.length} active users`);

      if (allUsers.length === 0) {
        return [];
      }

      // Lấy tất cả zalo accounts  
      const allZaloAccounts = await this.zaloAccountRepository.find();
      this.logger.debug(`📱 Found ${allZaloAccounts.length} total zalo accounts`);

      // Tạo mapping để match nhanh
      const userMap = new Map(allUsers.map(user => [user.id.toString(), user]));

      // Filter và map zalo accounts
      const result: ZaloAccountWithUser[] = [];

      for (const zaloAccount of allZaloAccounts) {
        const userIdStr = zaloAccount.userId?.toString();
        const matchingUser = userMap.get(userIdStr);

        if (matchingUser) {
          result.push({
            id: zaloAccount.id,
            user_id: userIdStr,
            zalo_oa_user_id: zaloAccount.zaloOaUserId,
            zalo_app_user_id: zaloAccount.zaloAppUserId,
            display_name: zaloAccount.displayName,
            avatar: zaloAccount.avatar,
            user_full_name: matchingUser.fullName || `User ${userIdStr}`
          });

          this.logger.debug(`✅ Matched zalo account ${zaloAccount.id} with user ${matchingUser.fullName} (${userIdStr})`);
        }
      }

      this.logger.log(`📊 Successfully mapped ${result.length} zalo accounts to active users`);
      return result;

    } catch (error) {
      this.logger.error('❌ Error mapping zalo accounts to users:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách Zalo accounts cho users trong tổ chức cụ thể
   */
  async getZaloAccountsForOrganization(organizationId: number): Promise<ZaloAccountWithUser[]> {
    try {
      // Lấy users trong tổ chức
      const orgUsers = await this.userRepository.find({
        where: {
          organizationId: organizationId,
          isActive: true
        }
      });

      this.logger.debug(`🏢 Found ${orgUsers.length} active users in organization ${organizationId}`);

      if (orgUsers.length === 0) {
        return [];
      }

      // Lấy tất cả zalo accounts
      const allZaloAccounts = await this.zaloAccountRepository.find();

      // Tạo mapping
      const userMap = new Map(orgUsers.map(user => [user.id.toString(), user]));

      // Filter và map
      const result: ZaloAccountWithUser[] = [];

      for (const zaloAccount of allZaloAccounts) {
        const userIdStr = zaloAccount.userId?.toString();
        const matchingUser = userMap.get(userIdStr);

        if (matchingUser) {
          result.push({
            id: zaloAccount.id,
            user_id: userIdStr,
            zalo_oa_user_id: zaloAccount.zaloOaUserId,
            zalo_app_user_id: zaloAccount.zaloAppUserId,
            display_name: zaloAccount.displayName,
            avatar: zaloAccount.avatar,
            user_full_name: matchingUser.fullName || `User ${userIdStr}`
          });
        }
      }

      this.logger.log(`📊 Found ${result.length} zalo accounts for organization ${organizationId}`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Error getting zalo accounts for organization ${organizationId}:`, error);
      return [];
    }
  }

  /**
   * Lấy danh sách Zalo accounts cho danh sách users cụ thể
   */
  async getZaloAccountsForSpecificUsers(userIds: (string | number)[]): Promise<ZaloAccountWithUser[]> {
    try {
      // Convert tất cả userIds thành string
      const userIdStrings = userIds.map(id => id.toString());

      // Lấy users cụ thể
      const specificUsers = await this.userRepository.find({
        where: {
          id: userIdStrings as any,
          isActive: true
        }
      });

      this.logger.debug(`👥 Found ${specificUsers.length}/${userIds.length} specified users`);

      if (specificUsers.length === 0) {
        return [];
      }

      // Lấy tất cả zalo accounts
      const allZaloAccounts = await this.zaloAccountRepository.find();

      // Tạo mapping
      const userMap = new Map(specificUsers.map(user => [user.id.toString(), user]));

      // Filter và map
      const result: ZaloAccountWithUser[] = [];

      for (const zaloAccount of allZaloAccounts) {
        const userIdStr = zaloAccount.userId?.toString();
        const matchingUser = userMap.get(userIdStr);

        if (matchingUser) {
          result.push({
            id: zaloAccount.id,
            user_id: userIdStr,
            zalo_oa_user_id: zaloAccount.zaloOaUserId,
            zalo_app_user_id: zaloAccount.zaloAppUserId,
            display_name: zaloAccount.displayName,
            avatar: zaloAccount.avatar,
            user_full_name: matchingUser.fullName || `User ${userIdStr}`
          });
        }
      }

      this.logger.log(`📊 Found ${result.length} zalo accounts for specified users`);
      return result;

    } catch (error) {
      this.logger.error('❌ Error getting zalo accounts for specific users:', error);
      return [];
    }
  }
}
