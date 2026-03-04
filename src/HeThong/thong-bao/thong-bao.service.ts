import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ThongBao } from '../../databases/entities/ThongBao.entity';
import { User } from '../../databases/entities/user.entity';
import { TrangThaiThongBao, UserThongBao } from '../../databases/entities/UserThongBao.entity';
import {
  CreateCustomMessageDto,
  CreateThongBaoDto,
  ListThongBaoDto,
  SendNotificationDto,
  UpdateThongBaoDto
} from './dto/thong-bao.dto';

@Injectable()
export class ThongBaoService {
  constructor(
    @InjectRepository(ThongBao)
    private readonly thongBaoRepository: Repository<ThongBao>,
    @InjectRepository(UserThongBao)
    private readonly userThongBaoRepository: Repository<UserThongBao>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(nguoiGui: string, createDto: CreateThongBaoDto): Promise<ThongBao> {
    try {
      // Kiểm tra người gửi có tồn tại không
      console.log('nguoiGui', nguoiGui);
      const user = await this.userRepository.findOne({ where: { id: nguoiGui } });
      if (!user) {
        throw new NotFoundException('Người gửi không tồn tại');
      }

      const newThongBao = this.thongBaoRepository.create({
        ...createDto,
        nguoiGui,
      });

      const savedThongBao = await this.thongBaoRepository.save(newThongBao);

      // Tạo bản ghi UserThongBao cho tất cả users
      const allUsers = await this.userRepository.find();
      const userThongBaos = allUsers.map(user => ({
        userId: user.id,
        thongBaoId: savedThongBao.id,
        trangThai: TrangThaiThongBao.CHUA_DOC,
      }));

      await this.userThongBaoRepository.save(userThongBaos);

      return savedThongBao;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔔 Tạo thông báo cho user cụ thể (cho workflow báo cáo)
   */
  async createForSpecificUser(nguoiGui: string, createDto: CreateThongBaoDto, targetUserId: string): Promise<ThongBao> {
    try {
      // Kiểm tra user đích có tồn tại không
      const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
      if (!targetUser) {
        throw new NotFoundException('User đích không tồn tại');
      }

      const newThongBao = this.thongBaoRepository.create({
        ...createDto,
        nguoiGui,
      });

      const savedThongBao = await this.thongBaoRepository.save(newThongBao);

      // Tạo bản ghi UserThongBao chỉ cho user cụ thể
      const userThongBao = {
        userId: targetUserId,
        thongBaoId: savedThongBao.id,
        trangThai: TrangThaiThongBao.CHUA_DOC,
      };

      await this.userThongBaoRepository.save(userThongBao);

      return savedThongBao;
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListThongBaoDto): Promise<{
    data: ThongBao[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search, nguoiGui } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.thongBaoRepository
        .createQueryBuilder('tb')
        .leftJoinAndSelect('tb.nguoiGuiUser', 'user')
        .orderBy('tb.createdAt', 'DESC');

      // Tìm kiếm theo nội dung hoặc ghi chú
      if (search) {
        queryBuilder.andWhere(
          '(tb.noi_dung_thong_bao LIKE :search OR tb.ghi_chu LIKE :search OR user.fullName LIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Lọc theo người gửi
      if (nguoiGui) {
        queryBuilder.andWhere('tb.nguoiGui = :nguoiGui', { nguoiGui });
      }

      const total = await queryBuilder.getCount();
      const data = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<ThongBao> {
    try {
      const thongBao = await this.thongBaoRepository.findOne({
        where: { id },
        relations: ['nguoiGuiUser'],
      });

      if (!thongBao) {
        throw new NotFoundException('Không tìm thấy thông báo');
      }

      return thongBao;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateThongBaoDto): Promise<ThongBao> {
    try {
      const thongBao = await this.findOne(id);

      Object.assign(thongBao, updateDto);
      return await this.thongBaoRepository.save(thongBao);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const thongBao = await this.findOne(id);

      // Xóa tất cả UserThongBao liên quan
      await this.userThongBaoRepository.delete({ thongBaoId: id });

      // Xóa thông báo
      await this.thongBaoRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async sendNotification(sendDto: SendNotificationDto): Promise<{
    success: boolean;
    message: string;
    sentCount: number;
    failedUsers: string[];
  }> {
    try {
      const { thongBaoId, nguoiNhanIds } = sendDto;

      // Kiểm tra thông báo có tồn tại không
      const thongBao = await this.thongBaoRepository.findOne({ where: { id: thongBaoId } });
      if (!thongBao) {
        throw new NotFoundException('Không tìm thấy thông báo');
      }

      // Kiểm tra danh sách người nhận có tồn tại không
      const existingUsers = await this.userRepository.findByIds(nguoiNhanIds);
      const existingUserIds = existingUsers.map(user => user.id);
      const failedUsers = nguoiNhanIds.filter(id => !existingUserIds.includes(id));

      if (existingUserIds.length === 0) {
        throw new BadRequestException('Không có người nhận nào tồn tại');
      }

      // Kiểm tra xem đã có bản ghi UserThongBao nào chưa
      const existingUserThongBaos = await this.userThongBaoRepository.find({
        where: { thongBaoId, userId: existingUserIds as any }
      });

      const existingUserThongBaoIds = existingUserThongBaos.map(utb => utb.userId);

      // Chỉ tạo bản ghi cho những user chưa có
      const newUserIds = existingUserIds.filter(id => !existingUserThongBaoIds.includes(id));

      if (newUserIds.length > 0) {
        const userThongBaos = newUserIds.map(userId => ({
          userId,
          thongBaoId,
          trangThai: TrangThaiThongBao.CHUA_DOC,
        }));

        await this.userThongBaoRepository.save(userThongBaos);
      }

      return {
        success: true,
        message: `Đã gửi thông báo thành công cho ${existingUserIds.length} người`,
        sentCount: existingUserIds.length,
        failedUsers
      };
    } catch (error) {
      throw error;
    }
  }

  // User notification methods - đã chuyển xuống cuối file

  async markAsRead(userId: string, thongBaoId: number): Promise<void> {
    try {
      const userThongBao = await this.userThongBaoRepository.findOne({
        where: { userId, thongBaoId },
      });

      if (!userThongBao) {
        throw new NotFoundException('Không tìm thấy thông báo cho user này');
      }

      userThongBao.trangThai = TrangThaiThongBao.DA_DOC;

      await this.userThongBaoRepository.save(userThongBao);
    } catch (error) {
      throw error;
    }
  }

  async markAsUnread(userId: string, thongBaoId: number): Promise<void> {
    try {
      const userThongBao = await this.userThongBaoRepository.findOne({
        where: { userId, thongBaoId },
      });

      if (!userThongBao) {
        throw new NotFoundException('Không tìm thấy thông báo cho user này');
      }

      userThongBao.trangThai = TrangThaiThongBao.CHUA_DOC;

      await this.userThongBaoRepository.save(userThongBao);
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.userThongBaoRepository.count({
        where: { userId, trangThai: TrangThaiThongBao.CHUA_DOC },
      });
    } catch (error) {
      throw error;
    }
  }

  // Các method bổ sung cho Zalo Mini App
  async getTotalNotifications(userId: string): Promise<number> {
    try {
      return await this.userThongBaoRepository.count({
        where: { userId },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserNotificationStatus(userId: string, thongBaoId: number): Promise<UserThongBao | null> {
    try {
      return await this.userThongBaoRepository.findOne({
        where: { userId, thongBaoId },
      });
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.userThongBaoRepository.update(
        { userId, trangThai: TrangThaiThongBao.CHUA_DOC },
        { trangThai: TrangThaiThongBao.DA_DOC }
      );
      return result.affected || 0;
    } catch (error) {
      throw error;
    }
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [total, unread, read, todayCount, weekCount, monthCount] = await Promise.all([
        this.userThongBaoRepository.count({ where: { userId } }),
        this.userThongBaoRepository.count({ where: { userId, trangThai: TrangThaiThongBao.CHUA_DOC } }),
        this.userThongBaoRepository.count({ where: { userId, trangThai: TrangThaiThongBao.DA_DOC } }),
        this.userThongBaoRepository
          .createQueryBuilder('utb')
          .leftJoin('utb.thongBao', 'tb')
          .where('utb.userId = :userId', { userId })
          .andWhere('tb.createdAt >= :today', { today })
          .getCount(),
        this.userThongBaoRepository
          .createQueryBuilder('utb')
          .leftJoin('utb.thongBao', 'tb')
          .where('utb.userId = :userId', { userId })
          .andWhere('tb.createdAt >= :thisWeek', { thisWeek })
          .getCount(),
        this.userThongBaoRepository
          .createQueryBuilder('utb')
          .leftJoin('utb.thongBao', 'tb')
          .where('utb.userId = :userId', { userId })
          .andWhere('tb.createdAt >= :thisMonth', { thisMonth })
          .getCount()
      ]);

      return {
        total,
        unread,
        read,
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount
      };
    } catch (error) {
      throw error;
    }
  }

  async searchUserNotifications(userId: string, searchParams: {
    keyword?: string;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
  }): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { keyword, trangThai, fromDate, toDate, page = 1, limit = 10 } = searchParams;
      const skip = (page - 1) * limit;

      const queryBuilder = this.userThongBaoRepository
        .createQueryBuilder('utb')
        .leftJoinAndSelect('utb.thongBao', 'tb')
        .leftJoinAndSelect('tb.nguoiGuiUser', 'user')
        .where('utb.userId = :userId', { userId })
        .orderBy('utb.createdAt', 'DESC');

      // Tìm kiếm theo từ khóa
      if (keyword) {
        queryBuilder.andWhere(
          '(tb.noi_dung_thong_bao LIKE :keyword OR tb.ghi_chu LIKE :keyword OR user.fullName LIKE :keyword)',
          { keyword: `%${keyword}%` }
        );
      }

      // Lọc theo trạng thái
      if (trangThai) {
        queryBuilder.andWhere('utb.trangThai = :trangThai', { trangThai });
      }

      // Lọc theo ngày
      if (fromDate) {
        queryBuilder.andWhere('tb.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
      }
      if (toDate) {
        const toDateEnd = new Date(toDate);
        toDateEnd.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('tb.createdAt <= :toDate', { toDate: toDateEnd });
      }

      const total = await queryBuilder.getCount();
      const userThongBaos = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      const data = userThongBaos.map(utb => ({
        ...utb.thongBao,
        trangThaiDoc: utb.trangThai,
        updatedAt: utb.updatedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật method getMyNotifications để hỗ trợ filter theo trạng thái
  async getMyNotifications(userId: string, page = 1, limit = 10, trangThai?: string): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const queryBuilder = this.userThongBaoRepository
        .createQueryBuilder('utb')
        .leftJoinAndSelect('utb.thongBao', 'tb')
        .leftJoinAndSelect('tb.nguoiGuiUser', 'user')
        .where('utb.userId = :userId', { userId })
        .orderBy('utb.createdAt', 'DESC');

      // Lọc theo trạng thái nếu có
      if (trangThai) {
        queryBuilder.andWhere('utb.trangThai = :trangThai', { trangThai });
      }

      const total = await queryBuilder.getCount();
      const userThongBaos = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      const unreadCount = await this.userThongBaoRepository.count({
        where: { userId, trangThai: TrangThaiThongBao.CHUA_DOC },
      });

      const data = userThongBaos.map(utb => ({
        ...utb.thongBao,
        trangThaiDoc: utb.trangThai,
        updatedAt: utb.updatedAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        unreadCount,
      };
    } catch (error) {
      throw error;
    }
  }

  // Method bổ sung cho Zalo API gửi thông báo
  async getTotalUsers(): Promise<number> {
    try {
      return await this.userRepository.count();
    } catch (error) {
      throw error;
    }
  }

  async createCustomMessage(nguoiGui: string, customDto: CreateCustomMessageDto): Promise<{
    success: boolean;
    message: string;
    data: ThongBao;
    sentToUsers: number;
  }> {
    try {
      // Tạo nội dung thông báo từ template
      let noiDungThongBao = `${customDto.tieuDe}\n\n${customDto.noiDungChinh}`;

      // Thêm thông tin chi tiết nếu có
      if (customDto.trangThai) {
        noiDungThongBao += `\n\nTrạng thái: ${customDto.trangThai}`;
      }
      if (customDto.thongTinBoSung) {
        noiDungThongBao += `\n${customDto.thongTinBoSung}`;
      }

      // Tạo thông báo
      const createDto = {
        noiDungThongBao,
        ghiChu: customDto.ghiChu || 'Thông báo tùy chỉnh'
      };
      console.log('createDto', nguoiGui);

      const newThongBao = await this.create(nguoiGui, createDto);

      let sentCount = 0;

      // Nếu có danh sách người nhận cụ thể
      if (customDto.nguoiNhanIds && customDto.nguoiNhanIds.length > 0) {
        // Xóa bản ghi UserThongBao tự động tạo (gửi tất cả)
        await this.userThongBaoRepository.delete({ thongBaoId: newThongBao.id });

        // Tạo bản ghi cho những người nhận cụ thể
        const validUsers = await this.userRepository.find({
          where: customDto.nguoiNhanIds.map(id => ({ id }))
        });

        if (validUsers.length > 0) {
          const userThongBaos = validUsers.map(user => ({
            userId: user.id,
            thongBaoId: newThongBao.id,
            trangThai: TrangThaiThongBao.CHUA_DOC,
          }));

          await this.userThongBaoRepository.save(userThongBaos);
          sentCount = validUsers.length;
        }
      } else {
        // Gửi cho tất cả (đã tự động tạo trong method create)
        sentCount = await this.getTotalUsers();
      }

      return {
        success: true,
        message: 'Thông báo tùy chỉnh đã được tạo và gửi thành công',
        data: newThongBao,
        sentToUsers: sentCount
      };
    } catch (error) {
      throw error;
    }
  }

  async resendNotification(thongBaoId: number, nguoiGui: string, onlyUndelivered = false): Promise<{
    success: boolean;
    message: string;
    thongBaoId: number;
    sentCount: number;
    alreadySentCount?: number;
    totalUsers: number;
  }> {
    try {
      // Kiểm tra thông báo có tồn tại không
      const thongBao = await this.findOne(thongBaoId);
      if (!thongBao) {
        throw new NotFoundException('Không tìm thấy thông báo');
      }

      // Lấy tất cả users
      const allUsers = await this.userRepository.find();
      const totalUsers = allUsers.length;

      if (onlyUndelivered) {
        // Chỉ gửi cho những người chưa có bản ghi UserThongBao
        const existingUserNotifications = await this.userThongBaoRepository.find({
          where: { thongBaoId },
          select: ['userId']
        });

        const existingUserIds = existingUserNotifications.map(un => un.userId);
        const usersToSend = allUsers.filter(user => !existingUserIds.includes(user.id));

        // Tạo bản ghi UserThongBao cho những user chưa có
        if (usersToSend.length > 0) {
          const newUserThongBaos = usersToSend.map(user => ({
            userId: user.id,
            thongBaoId,
            trangThai: TrangThaiThongBao.CHUA_DOC,
          }));

          await this.userThongBaoRepository.save(newUserThongBaos);
        }

        return {
          success: true,
          message: 'Thông báo đã được gửi lại cho những người chưa nhận',
          thongBaoId,
          sentCount: usersToSend.length,
          alreadySentCount: existingUserIds.length,
          totalUsers
        };
      } else {
        // Gửi lại cho tất cả - xóa bản ghi cũ và tạo mới
        await this.userThongBaoRepository.delete({ thongBaoId });

        const userThongBaos = allUsers.map(user => ({
          userId: user.id,
          thongBaoId,
          trangThai: TrangThaiThongBao.CHUA_DOC,
        }));

        await this.userThongBaoRepository.save(userThongBaos);

        return {
          success: true,
          message: 'Thông báo đã được gửi lại cho tất cả thành viên',
          thongBaoId,
          sentCount: totalUsers,
          totalUsers
        };
      }
    } catch (error) {
      throw error;
    }
  }
}
