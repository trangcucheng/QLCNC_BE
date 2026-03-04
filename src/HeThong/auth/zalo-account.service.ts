import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { GetZaloAccountsQueryDto, ZaloAccountsListResponseDto } from './dto/zalo-accounts.dto';

@Injectable()
export class ZaloAccountService {
  private readonly logger = new Logger(ZaloAccountService.name);

  constructor(
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  /**
   * Unified method to find ZaloAccount by any Zalo ID type
   */
  async findZaloAccountByAnyZaloId(zaloId: string): Promise<ZaloAccount | null> {
    // Fix collation mismatch error by using query builder with COLLATE
    const account = await this.zaloAccountRepository
      .createQueryBuilder('za')
      .leftJoinAndSelect('za.user', 'user')
      .where('za.zalo_oa_user_id COLLATE utf8mb4_unicode_ci = :zaloId', { zaloId })
      .orWhere('za.zalo_app_user_id COLLATE utf8mb4_unicode_ci = :zaloId', { zaloId })
      .orWhere('za.zalo_mini_app_id COLLATE utf8mb4_unicode_ci = :zaloId', { zaloId })
      .getOne();

    return account;
  }

  /**
   * Find all ZaloAccounts for a specific user
   */
  async findZaloAccountsByUserId(userId: string): Promise<ZaloAccount[]> {
    return await this.zaloAccountRepository.find({
      where: { userId },
      relations: ['user']
    });
  }

  /**
   * Check if a user is linked to any Zalo account
   */
  async isUserLinkedToZalo(userId: string): Promise<boolean> {
    const count = await this.zaloAccountRepository.count({
      where: { userId }
    });
    return count > 0;
  }

  /**
   * Link existing web user to existing Zalo account
   */
  async linkUserWithZaloAccount(userId: string, zaloAccountId: number): Promise<ZaloAccount> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Validate zalo account exists
    const zaloAccount = await this.zaloAccountRepository.findOne({ where: { id: zaloAccountId } });
    if (!zaloAccount) {
      throw new Error(`ZaloAccount with ID ${zaloAccountId} not found`);
    }

    // Link them
    zaloAccount.userId = userId;
    const savedAccount = await this.zaloAccountRepository.save(zaloAccount);

    this.logger.log(`✅ Linked User ${userId} with ZaloAccount ${zaloAccountId}`);
    return savedAccount;
  }

  /**
   * Unlink user from Zalo account
   */
  async unlinkUserFromZaloAccount(zaloAccountId: number): Promise<void> {
    await this.zaloAccountRepository.update(zaloAccountId, { userId: null });
    this.logger.log(`✅ Unlinked ZaloAccount ${zaloAccountId} from user`);
  }

  /**
   * Tự động liên kết user với Zalo account theo số điện thoại
   */
  async autoLinkByPhoneNumber(userId: string, phoneNumber: string): Promise<ZaloAccount | null> {
    if (!phoneNumber) {
      this.logger.warn(`User ${userId} không có SĐT để tự động liên kết`);
      return null;
    }

    // Tìm Zalo account chưa liên kết có cùng SĐT
    const zaloAccount = await this.zaloAccountRepository.findOne({
      where: {
        phone: phoneNumber,
        userId: null // Chỉ lấy account chưa được liên kết
      }
    });

    if (!zaloAccount) {
      this.logger.log(`Không tìm thấy tài khoản Zalo chưa liên kết với SĐT ${phoneNumber}`);
      return null;
    }

    // Thực hiện liên kết
    zaloAccount.userId = userId;
    const savedAccount = await this.zaloAccountRepository.save(zaloAccount);

    this.logger.log(`✅ Tự động liên kết ZaloAccount ${zaloAccount.id} với User ${userId} qua SĐT ${phoneNumber}`);
    return savedAccount;
  }

  /**
   * Create or update ZaloAccount from Mini App login data (migrate from ZaloUser logic)
   */
  async createOrUpdateFromMiniAppLogin(data: {
    zaloId: string;
    name: string;
    phone?: string;
    avatar?: string;
    additionalInfo?: any;
    userId?: string;
  }): Promise<ZaloAccount> {
    // First try to find existing account
    let zaloAccount = await this.findZaloAccountByAnyZaloId(data.zaloId);

    if (zaloAccount) {
      // Update existing account
      zaloAccount.zaloMiniAppId = data.zaloId;
      zaloAccount.zaloAppUserId = data.zaloId; // Also set app user ID for consistency
      zaloAccount.displayName = data.name;
      zaloAccount.phone = data.phone;
      zaloAccount.avatar = data.avatar;
      zaloAccount.additionalInfo = data.additionalInfo;
      zaloAccount.lastLoginAt = new Date();
      zaloAccount.isActive = true;

      if (data.userId) {
        zaloAccount.userId = data.userId;
      }

      this.logger.log(`🔄 Updated existing ZaloAccount ${zaloAccount.id} from Mini App login`);
    } else {
      // Create new account
      zaloAccount = this.zaloAccountRepository.create({
        userId: data.userId || null,
        zaloAppUserId: data.zaloId,
        zaloMiniAppId: data.zaloId,
        displayName: data.name,
        phone: data.phone,
        avatar: data.avatar,
        additionalInfo: data.additionalInfo,
        lastLoginAt: new Date(),
        isActive: true
      });

      this.logger.log(`➕ Created new ZaloAccount from Mini App login: ${data.zaloId}`);
    }

    return await this.zaloAccountRepository.save(zaloAccount);
  }

  /**
   * Get all unlinked Zalo accounts (for admin to create web users)
   */
  async getUnlinkedZaloAccounts(): Promise<ZaloAccount[]> {
    return await this.zaloAccountRepository.find({
      where: { userId: null }
    });
  }

  /**
   * Get all linked Zalo accounts with user info
   */
  async getLinkedZaloAccountsWithUsers(): Promise<ZaloAccount[]> {
    return await this.zaloAccountRepository.find({
      where: { userId: { not: null } },
      relations: ['user']
    });
  }

  /**
   * Get comprehensive info for dashboard
   */
  async getZaloAccountsOverview(): Promise<{
    total: number;
    linked: number;
    unlinked: number;
    followingOa: number;
    accounts: ZaloAccount[];
  }> {
    const accounts = await this.zaloAccountRepository.find({
      relations: ['user']
    });

    const total = accounts.length;
    const linked = accounts.filter(a => a.userId).length;
    const unlinked = total - linked;
    const followingOa = accounts.filter(a => a.isFollowingOa).length;

    return {
      total,
      linked,
      unlinked,
      followingOa,
      accounts
    };
  }

  /**
   * Find ZaloAccount by ID
   */
  async findById(id: number): Promise<ZaloAccount | null> {
    return await this.zaloAccountRepository.findOne({
      where: { id },
      relations: ['user']
    });
  }

  /**
   * Get paginated list of Zalo Accounts with search and filters
   */
  async getZaloAccountsPaginated(query: GetZaloAccountsQueryDto): Promise<ZaloAccountsListResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      isLinked,
      isFollowingOa,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = query;

    const skip = (page - 1) * limit;
    console.log('🔍 Query Params:', query);
    console.log('🔍 isLinked type:', typeof isLinked, 'value:', isLinked);
    console.log('🔍 isFollowingOa type:', typeof isFollowingOa, 'value:', isFollowingOa);
    console.log('🔍 isActive type:', typeof isActive, 'value:', isActive);

    // Build query
    const queryBuilder = this.zaloAccountRepository
      .createQueryBuilder('zaloAccount')
      .leftJoinAndSelect('zaloAccount.user', 'user');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(zaloAccount.displayName LIKE :search OR zaloAccount.phone LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Fix: Check explicitly for boolean values
    if (isLinked === true) {
      queryBuilder.andWhere('zaloAccount.userId IS NOT NULL');
    } else if (isLinked === false) {
      queryBuilder.andWhere('zaloAccount.userId IS NULL');
    }

    // Fix: Check explicitly for boolean values
    if (isFollowingOa === true) {
      queryBuilder.andWhere('zaloAccount.is_following_oa = 1');
    } else if (isFollowingOa === false) {
      queryBuilder.andWhere('zaloAccount.is_following_oa = 0');
    }

    // Fix: Check explicitly for boolean values (is_active is BOOLEAN type, not tinyint)
    if (isActive === true) {
      queryBuilder.andWhere('zaloAccount.is_active = true');
    } else if (isActive === false) {
      queryBuilder.andWhere('zaloAccount.is_active = false');
    }

    // Apply sorting
    const sortField = sortBy === 'displayName' ? 'zaloAccount.displayName' :
      sortBy === 'lastActiveAt' ? 'zaloAccount.lastActiveAt' :
        'zaloAccount.createdAt';

    queryBuilder.orderBy(sortField, sortOrder as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated data
    const accounts = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    // Calculate summary statistics
    const summaryQueryBuilder = this.zaloAccountRepository
      .createQueryBuilder('zaloAccount')
      .leftJoin('zaloAccount.user', 'user');

    if (search) {
      summaryQueryBuilder.where(
        '(zaloAccount.displayName LIKE :search OR zaloAccount.phone LIKE :search OR user.fullName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const totalFiltered = await summaryQueryBuilder.getCount();
    const totalLinked = await summaryQueryBuilder.clone().andWhere('zaloAccount.userId IS NOT NULL').getCount();
    const totalFollowing = await summaryQueryBuilder.clone().andWhere('zaloAccount.is_following_oa = 1').getCount();
    const totalActive = await summaryQueryBuilder.clone().andWhere('zaloAccount.is_active = true').getCount();

    // Map accounts to response DTOs
    const mappedAccounts = accounts.map(account => ({
      id: account.id,
      userId: account.userId,
      zaloOaUserId: account.zaloOaUserId,
      zaloAppUserId: account.zaloAppUserId,
      zaloMiniAppId: account.zaloMiniAppId,
      displayName: account.displayName,
      avatar: account.avatar,
      phone: account.phone,
      isFollowingOa: account.isFollowingOa,
      isActive: account.isActive,
      lastFollowAt: account.lastFollowAt,
      lastUnfollowAt: account.lastUnfollowAt,
      lastActiveAt: account.lastActiveAt,
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      webUser: account.user ? {
        id: account.user.id,
        fullName: account.user.fullName,
        email: account.user.email,
        phoneNumber: account.user.phoneNumber,
        avatar: account.user.avatar,
        roleId: account.user.roleId,
        organizationId: account.user.organizationId,
        isActive: account.user.isActive === 1
      } : null,
      isLinkedToWeb: !!account.userId
    }));

    return {
      data: mappedAccounts,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit),
        hasNext: page * limit < totalFiltered,
        hasPrev: page > 1
      },
      summary: {
        total: totalFiltered,
        linked: totalLinked,
        unlinked: totalFiltered - totalLinked,
        followingOa: totalFollowing,
        activeAccounts: totalActive
      }
    };
  }
}
