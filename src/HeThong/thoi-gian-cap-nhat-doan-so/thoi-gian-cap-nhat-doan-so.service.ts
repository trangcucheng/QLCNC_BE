import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ZaloPushNotificationService } from '../auth/zalo-push.service';
import {
  CreateThoiGianCapNhatDoanSoDto,
  GetDetailThoiGianCapNhatDoanSoDto,
  ListThoiGianCapNhatDoanSoDto,
  UpdateThoiGianCapNhatDoanSoDto
} from './dto/thoi-gian-cap-nhat-doan-so.dto';
import { ThoiGianCapNhatDoanSoRepository } from './thoi-gian-cap-nhat-doan-so.repository';

@Injectable()
export class ThoiGianCapNhatDoanSoService {
  constructor(
    private readonly thoiGianCapNhatDoanSoRepository: ThoiGianCapNhatDoanSoRepository,
    private readonly zaloPushService: ZaloPushNotificationService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
  ) { }

  async create(input: CreateThoiGianCapNhatDoanSoDto) {
    try {
      // Validate theo loại kỳ báo cáo
      this.validateThoiGianCapNhat(input);

      let newRecord;

      if (input.loaiKy === 'dot_xuat') {
        // Đột xuất: Dùng thời gian cụ thể
        const startDate = new Date(input.thoiGianBatDau);
        const endDate = new Date(input.thoiGianKetThuc);

        newRecord = this.thoiGianCapNhatDoanSoRepository.create({
          ...input,
          thoiGianBatDau: startDate,
          thoiGianKetThuc: endDate,
          // Chuyển array organizationId thành string phân cách bởi dấu phẩy
          organizationId: input.organizationId && input.organizationId.length > 0
            ? input.organizationId.join(',')
            : null,
        });
      } else {
        // Định kỳ: Chỉ lưu cấu hình, không lưu thời gian cụ thể
        newRecord = this.thoiGianCapNhatDoanSoRepository.create({
          ...input,
          thoiGianBatDau: null,
          thoiGianKetThuc: null,
          organizationId: null, // Định kỳ không cần organizationId
        });
      }

      const savedRecord = await this.thoiGianCapNhatDoanSoRepository.save(newRecord);

      // 🔔 Gửi thông báo cho users về kỳ báo cáo mới
      try {
        const tieuDe = `📅 Kỳ báo cáo đoàn số mới`;

        let noiDung = `Kỳ báo cáo: "${input.ten}"\n📋 Mô tả: ${input.moTa || 'Không có mô tả'}\n`;

        if (input.loaiKy === 'dot_xuat') {
          const startDate = new Date(input.thoiGianBatDau);
          const endDate = new Date(input.thoiGianKetThuc);
          noiDung += `🗓️ Thời gian: ${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}\n⏰ Hạn nộp: ${endDate.toLocaleDateString('vi-VN')}`;
        } else if (input.loaiKy === 'hang_thang') {
          noiDung += `📅 Loại: Báo cáo hàng tháng\n📆 Khoảng thời gian: Ngày ${input.ngayBatDauTrongThang} - ${input.ngayKetThucTrongThang} hàng tháng`;
        } else if (input.loaiKy === 'hang_quy') {
          noiDung += `📅 Loại: Báo cáo hàng quý\n📆 Các tháng: ${input.cacThangApDung.join(', ')}\n📆 Khoảng thời gian: Ngày ${input.ngayBatDauTrongThang} - ${input.ngayKetThucTrongThang}`;
        } else if (input.loaiKy === 'hang_nam') {
          noiDung += `📅 Loại: Báo cáo hàng năm\n📆 Tháng ${input.thangBatDau}, ngày ${input.ngayBatDauTrongThang} - ${input.ngayKetThucTrongThang}`;
        }

        noiDung += '\n\nVui lòng chuẩn bị và nộp báo cáo đúng thời hạn.';

        // Lấy danh sách users active
        const allUsers = await this.userRepository.find({
          where: { isActive: true },
          select: ['id', 'fullName']
        });

        // Xử lý user.id là string - lấy Zalo accounts
        const userIds = allUsers.map(u => u.id); // Giữ nguyên string

        // Query với In để tìm nhiều user_id (userId trong ZaloAccount cũng là string)
        const zaloAccounts = userIds.length > 0
          ? await this.zaloAccountRepository.find({
            where: {
              userId: In(userIds),
              isActive: true
            },
            select: ['userId', 'zaloOaUserId', 'zaloAppUserId', 'zaloMiniAppId']
          })
          : [];

        // Collect unique Zalo user IDs để tránh duplicate (same logic như createDotXuat)
        const zaloUserIdsSet = new Set<string>();
        zaloAccounts.forEach(account => {
          // Ưu tiên zaloOaUserId (OA follower), sau đó zaloAppUserId, cuối cùng zaloMiniAppId  
          if (account.zaloOaUserId) {
            zaloUserIdsSet.add(account.zaloOaUserId);
          } else if (account.zaloAppUserId) {
            zaloUserIdsSet.add(account.zaloAppUserId);
          } else if (account.zaloMiniAppId) {
            zaloUserIdsSet.add(account.zaloMiniAppId);
          }
        });
        const zaloUserIds = Array.from(zaloUserIdsSet);


        if (zaloUserIds.length === 0) {
          console.warn(`⚠️ Không có zalo accounts nào để gửi thông báo!`);
          console.warn(`💡 Lý do có thể: 1) Chưa có user nào liên kết Zalo 2) User ID mapping bị lỗi`);
        } else {
          // Gửi bulk thay vì gửi từng cái một để tránh duplicate và tăng performance
          const fullMessage = `${noiDung}`;
          const result = await this.zaloPushService.sendBulkPushNotifications(zaloUserIds, {
            title: tieuDe,
            message: fullMessage,
            data: {
              messageType: 'bao_cao_thuong_ky',
              relatedId: savedRecord.id,
              type: 'regular_report'
            }
          });

        }

      } catch (notificationError) {
        console.error('❌ Lỗi gửi thông báo kỳ báo cáo:', notificationError);
        // Không throw error để không ảnh hưởng việc tạo kỳ báo cáo
      }

      return savedRecord;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi tạo thời gian cập nhật đoàn số');
    }
  }

  /**
   * Debug notification system for specific period
   */
  async debugNotificationForPeriod(periodId: number) {
    try {
      // 1. Lấy thông tin kỳ báo cáo
      const period = await this.thoiGianCapNhatDoanSoRepository.findOne({
        where: { id: periodId }
      });

      if (!period) {
        return { error: 'Không tìm thấy kỳ báo cáo' };
      }

      // 2. Lấy danh sách users
      const allUsers = await this.userRepository.find({
        where: { isActive: true }
      });

      // 3. Debug User ID mapping
      const userInfo = allUsers.slice(0, 3).map(u => ({
        id: u.id,
        idType: typeof u.id,
        idAsInt: parseInt(u.id.toString()),
        fullName: u.fullName
      }));

      // 4. Lấy zalo accounts
      const allZaloAccounts = await this.zaloAccountRepository.find();
      const zaloInfo = allZaloAccounts.slice(0, 3).map(za => ({
        id: za.id,
        userId: za.userId,
        userIdType: typeof za.userId,
        zaloOaUserId: za.zaloOaUserId,
        zaloAppUserId: za.zaloAppUserId
      }));

      // 5. Tính toán matching (cả user.id và za.userId đều là string)
      const userIds = allUsers.map(u => u.id.toString()); // Convert to string
      const matchingZaloAccounts = allZaloAccounts.filter(za => {
        const zaUserIdAsString = za.userId ? za.userId.toString() : '';
        return userIds.includes(zaUserIdAsString);
      });

      return {
        success: true,
        debug: {
          period: {
            id: period.id,
            ten: period.ten,
            startDate: period.thoiGianBatDau,
            endDate: period.thoiGianKetThuc
          },
          users: {
            total: allUsers.length,
            sample: userInfo
          },
          zaloAccounts: {
            total: allZaloAccounts.length,
            matching: matchingZaloAccounts.length,
            sample: zaloInfo
          },
          mapping: {
            userIdsConverted: userIds.slice(0, 3),
            matchingAccounts: matchingZaloAccounts.slice(0, 3).map(za => ({
              id: za.id,
              userId: za.userId,
              zaloOaUserId: za.zaloOaUserId
            }))
          }
        }
      };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack
      };
    }
  }

  async update(input: UpdateThoiGianCapNhatDoanSoDto) {
    try {
      const existing = await this.thoiGianCapNhatDoanSoRepository.findOne({
        where: { id: input.id }
      });

      if (!existing) {
        throw new BadRequestException('Không tìm thấy thời gian cập nhật đoàn số');
      }

      // Validate theo loại kỳ
      this.validateThoiGianCapNhat(input);

      let updatedData: any;

      if (input.loaiKy === 'dot_xuat') {
        // Đột xuất: Validate và convert thời gian
        const startDate = new Date(input.thoiGianBatDau);
        const endDate = new Date(input.thoiGianKetThuc);

        if (startDate >= endDate) {
          throw new BadRequestException('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
        }

        updatedData = {
          ...input,
          thoiGianBatDau: startDate,
          thoiGianKetThuc: endDate,
          // Chuyển array organizationId thành string
          organizationId: input.organizationId && input.organizationId.length > 0
            ? input.organizationId.join(',')
            : null,
        };
      } else {
        // Định kỳ: Không lưu thời gian cụ thể
        updatedData = {
          ...input,
          thoiGianBatDau: null,
          thoiGianKetThuc: null,
          organizationId: null,
        };
      }

      const updatedRecord = {
        ...existing,
        ...updatedData,
      };

      return await this.thoiGianCapNhatDoanSoRepository.save(updatedRecord);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật thời gian cập nhật đoàn số');
    }
  }

  async delete(input: GetDetailThoiGianCapNhatDoanSoDto) {
    try {
      const existing = await this.thoiGianCapNhatDoanSoRepository.findOne({
        where: { id: input.id }
      });

      if (!existing) {
        throw new BadRequestException('Không tìm thấy thời gian cập nhật đoàn số');
      }

      await this.thoiGianCapNhatDoanSoRepository.remove(existing);
      return { message: 'Xóa thành công' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi xóa thời gian cập nhật đoàn số');
    }
  }

  async getDetail(input: GetDetailThoiGianCapNhatDoanSoDto) {
    try {
      const record = await this.thoiGianCapNhatDoanSoRepository.findOne({
        where: { id: input.id }
      });

      if (!record) {
        throw new BadRequestException('Không tìm thấy thời gian cập nhật đoàn số');
      }

      return record;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi lấy chi tiết thời gian cập nhật đoàn số');
    }
  }

  async getList(input: ListThoiGianCapNhatDoanSoDto) {
    try {
      const { search, page = 1, limit = 10 } = input;

      const queryBuilder = this.thoiGianCapNhatDoanSoRepository
        .createQueryBuilder('t')
        .select([
          't.id',
          't.ten',
          't.loaiKy',
          't.ngayBatDauTrongThang',
          't.ngayKetThucTrongThang',
          't.thangBatDau',
          't.namBatDau',
          't.namKetThuc',
          't.cacThangApDung',
          't.thoiGianBatDau',
          't.thoiGianKetThuc',
          't.moTa',
          't.isActive',
          't.organizationId',
          't.notification_schedules',
          't.auto_notification_enabled',
          't.next_notification_time',
          't.last_notification_time',
          't.createdAt',
          't.updatedAt'
        ])
        .orderBy('t.createdAt', 'DESC')
        .limit(limit)
        .offset((page - 1) * limit);

      // Search filter
      if (search) {
        queryBuilder.andWhere(
          '(t.ten LIKE :search OR t.moTa LIKE :search)',
          { search: `%${search}%` }
        );
      }


      const [list, count] = await Promise.all([
        queryBuilder.getMany(),
        queryBuilder.getCount()
      ]);

      return {
        list,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi lấy danh sách thời gian cập nhật đoàn số');
    }
  }

  async getAll() {
    try {
      return await this.thoiGianCapNhatDoanSoRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi lấy tất cả thời gian cập nhật đoàn số');
    }
  }

  // Kiểm tra xem có đang trong thời gian cập nhật không
  async isInUpdatePeriod(): Promise<{ isInPeriod: boolean; currentPeriod?: any }> {
    try {
      const now = new Date();

      const activePeriod = await this.thoiGianCapNhatDoanSoRepository.findOne({
        where: {
          isActive: true,
        },
        order: { createdAt: 'DESC' }
      });

      if (!activePeriod) {
        return { isInPeriod: false };
      }

      const isInPeriod = now >= activePeriod.thoiGianBatDau && now <= activePeriod.thoiGianKetThuc;

      return {
        isInPeriod,
        currentPeriod: isInPeriod ? activePeriod : null
      };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi kiểm tra thời gian cập nhật');
    }
  }

  /**
   * Tạo thời gian cập nhật đoàn số đột xuất và gửi thông báo ngay lập tức
   */
  async createDotXuat(input: CreateThoiGianCapNhatDoanSoDto) {
    try {
      // Validate thời gian
      const startDate = new Date(input.thoiGianBatDau);
      const endDate = new Date(input.thoiGianKetThuc);

      if (startDate >= endDate) {
        throw new BadRequestException('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
      }

      // Tạo bản ghi với đánh dấu là đột xuất (KHÔNG gọi method create để tránh duplicate thông báo)
      const newRecord = this.thoiGianCapNhatDoanSoRepository.create({
        ...input,
        ten: `[ĐỘT XUẤT] ${input.ten}`,
        thoiGianBatDau: startDate,
        thoiGianKetThuc: endDate,
        isActive: true,
        // Chuyển array organizationId thành string
        organizationId: input.organizationId && input.organizationId.length > 0
          ? input.organizationId.join(',')
          : null,
      });

      const savedRecord = await this.thoiGianCapNhatDoanSoRepository.save(newRecord);

      // 🚨 Gửi thông báo đột xuất theo danh sách organizationIds
      try {
        const tieuDe = `🚨 THÔNG BÁO ĐỘT XUẤT - Báo cáo đoàn số`;
        const noiDung = `📝 Yêu cầu báo cáo đột xuất: "${input.ten}"
📅 Thời gian: ${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}
${input.moTa ? `📋 ${input.moTa}` : ''}
⏰ Vui lòng thực hiện ngay!`;

        let targetUsers;

        if (input.organizationId && input.organizationId.length > 0) {
          // Lấy users thuộc các organization được chỉ định
          targetUsers = await this.userRepository.find({
            where: {
              organizationId: In(input.organizationId),

            },
            select: ['id']
          });

          console.log(`🎯 [ĐỘT XUẤT] Gửi cho organizations: ${input.organizationId.join(', ')}`);
          console.log(`👥 [ĐỘT XUẤT] Tìm thấy ${targetUsers.length} users thuộc organizations này`);
        } else {
          // Nếu không có organizationIds, gửi cho tất cả users active
          targetUsers = await this.userRepository.find({
            where: { isActive: true },
            select: ['id']
          });

        }

        // Xử lý user.id là string - lấy zalo accounts
        const targetUserIds = targetUsers.map(u => u.id); // Giữ nguyên string

        const zaloAccounts = targetUserIds.length > 0
          ? await this.zaloAccountRepository.find({
            where: {
              userId: In(targetUserIds), // userId trong ZaloAccount cũng là string

            },
            select: ['zaloOaUserId', 'zaloAppUserId', 'zaloMiniAppId']
          })
          : [];        // Collect unique Zalo user IDs để tránh duplicate
        const zaloUserIdsSet = new Set<string>();
        zaloAccounts.forEach(account => {
          // Ưu tiên zaloOaUserId (OA follower), sau đó zaloAppUserId, cuối cùng zaloMiniAppId
          if (account.zaloOaUserId) {
            zaloUserIdsSet.add(account.zaloOaUserId);
          } else if (account.zaloAppUserId) {
            zaloUserIdsSet.add(account.zaloAppUserId);
          } else if (account.zaloMiniAppId) {
            zaloUserIdsSet.add(account.zaloMiniAppId);
          }
        });
        const zaloUserIds = Array.from(zaloUserIdsSet);


        console.log(`📱 [ĐỘT XUẤT] Tìm thấy ${zaloAccounts.length} zalo accounts`);
        console.log(`📊 [ĐỘT XUẤT] Sẽ gửi cho ${zaloUserIds.length} unique Zalo users`);

        if (zaloUserIds.length > 0) {
          // Gửi thông báo đột xuất (BULK - chỉ gửi 1 lần)
          const result = await this.zaloPushService.sendBulkPushNotifications(zaloUserIds, {
            title: tieuDe,
            message: noiDung,
            data: {
              messageType: 'bao_cao_dot_xuat',
              relatedId: savedRecord.id,
              type: 'urgent_report',
              organizationIds: input.organizationId || []
            }
          });

          console.log(`✅ [ĐỘT XUẤT] Kết quả gửi bulk: ${result.successful.length}/${result.totalSent} thành công`);

          if (input.organizationId && input.organizationId.length > 0) {
            console.log(`🎯 [ĐỘT XUẤT] Đã gửi cho organizations: ${input.organizationId.join(', ')}`);
          } else {
            console.log(`📢 [ĐỘT XUẤT] Đã gửi cho tất cả users`);
          }
        } else {
          console.warn(`⚠️ [ĐỘT XUẤT] Không có zalo accounts nào để gửi thông báo!`);
          if (input.organizationId && input.organizationId.length > 0) {
            console.warn(`💡 Organizations được chỉ định: ${input.organizationId.join(', ')} - có thể chưa có users hoặc chưa liên kết Zalo`);
          }
        } console.log(`✅ Đã gửi thông báo đột xuất cho kỳ: ${savedRecord.ten}`);
      } catch (notifError) {
        console.error('❌ Lỗi gửi thông báo đột xuất:', notifError);
        // Không throw error để không ảnh hưởng việc tạo bản ghi
      }

      return {
        success: true,
        message: 'Tạo báo cáo đột xuất và gửi thông báo thành công',
        data: savedRecord
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi tạo báo cáo đột xuất: ${error.message}`);
    }
  }

  // ===================== METHODS CHO KỲ BÁO CÁO ĐỊNH KỲ =====================

  /**
   * Validate input theo loại kỳ báo cáo
   */
  private validateThoiGianCapNhat(input: CreateThoiGianCapNhatDoanSoDto) {
    const { loaiKy } = input;

    if (loaiKy === 'dot_xuat') {
      // Đột xuất: Bắt buộc có thoiGianBatDau và thoiGianKetThuc
      if (!input.thoiGianBatDau || !input.thoiGianKetThuc) {
        throw new BadRequestException('Báo cáo đột xuất phải có thời gian bắt đầu và kết thúc');
      }

      const startDate = new Date(input.thoiGianBatDau);
      const endDate = new Date(input.thoiGianKetThuc);

      if (startDate >= endDate) {
        throw new BadRequestException('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
      }
    } else if (loaiKy === 'hang_thang') {
      // Hàng tháng: Bắt buộc có ngày trong tháng và năm bắt đầu
      if (!input.ngayBatDauTrongThang || !input.ngayKetThucTrongThang) {
        throw new BadRequestException('Báo cáo hàng tháng phải có ngày bắt đầu và kết thúc trong tháng');
      }
      if (!input.namBatDau) {
        throw new BadRequestException('Báo cáo hàng tháng phải có năm bắt đầu');
      }
      if (input.ngayBatDauTrongThang > input.ngayKetThucTrongThang) {
        throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
      }
    } else if (loaiKy === 'hang_quy') {
      // Hàng quý: Bắt buộc có cacThangApDung
      if (!input.ngayBatDauTrongThang || !input.ngayKetThucTrongThang) {
        throw new BadRequestException('Báo cáo hàng quý phải có ngày bắt đầu và kết thúc trong tháng');
      }
      if (!input.cacThangApDung || input.cacThangApDung.length === 0) {
        throw new BadRequestException('Báo cáo hàng quý phải có danh sách các tháng áp dụng');
      }
      if (!input.namBatDau) {
        throw new BadRequestException('Báo cáo hàng quý phải có năm bắt đầu');
      }
      // Validate các tháng hợp lệ (1-12)
      const invalidMonths = input.cacThangApDung.filter(m => m < 1 || m > 12);
      if (invalidMonths.length > 0) {
        throw new BadRequestException('Tháng áp dụng phải từ 1-12');
      }
    } else if (loaiKy === 'hang_nam') {
      // Hàng năm: Bắt buộc có thangBatDau
      if (!input.ngayBatDauTrongThang || !input.ngayKetThucTrongThang) {
        throw new BadRequestException('Báo cáo hàng năm phải có ngày bắt đầu và kết thúc trong tháng');
      }
      if (!input.thangBatDau) {
        throw new BadRequestException('Báo cáo hàng năm phải có tháng bắt đầu');
      }
      if (!input.namBatDau) {
        throw new BadRequestException('Báo cáo hàng năm phải có năm bắt đầu');
      }
    }
  }

  /**
   * Tính toán thời gian cho kỳ báo cáo hiện tại
   * @param thoiGianCapNhat Cấu hình kỳ báo cáo
   * @param currentDate Thời điểm hiện tại (mặc định: hôm nay)
   */
  getCurrentPeriod(thoiGianCapNhat: any, currentDate: Date = new Date()) {
    const { loaiKy } = thoiGianCapNhat;

    // Nếu là đột xuất, trả về thời gian cố định
    if (loaiKy === 'dot_xuat') {
      return {
        batDau: thoiGianCapNhat.thoiGianBatDau,
        ketThuc: thoiGianCapNhat.thoiGianKetThuc,
        thang: thoiGianCapNhat.thoiGianBatDau.getMonth() + 1,
        nam: thoiGianCapNhat.thoiGianBatDau.getFullYear()
      };
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // 1-12

    // Hàng tháng
    if (loaiKy === 'hang_thang') {
      return {
        batDau: new Date(year, month - 1, thoiGianCapNhat.ngayBatDauTrongThang, 0, 0, 0),
        ketThuc: new Date(year, month - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59),
        thang: month,
        nam: year
      };
    }

    // Hàng quý
    if (loaiKy === 'hang_quy') {
      // Tìm tháng gần nhất trong cacThangApDung >= tháng hiện tại
      const cacThang = thoiGianCapNhat.cacThangApDung || [];
      let thangApDung = cacThang.find(t => t >= month);

      // Nếu không tìm thấy (đã qua tất cả quý trong năm), lấy quý đầu tiên của năm sau
      if (!thangApDung) {
        thangApDung = cacThang[0];
      }

      return {
        batDau: new Date(year, thangApDung - 1, thoiGianCapNhat.ngayBatDauTrongThang, 0, 0, 0),
        ketThuc: new Date(year, thangApDung - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59),
        thang: thangApDung,
        nam: year
      };
    }

    // Hàng năm
    if (loaiKy === 'hang_nam') {
      return {
        batDau: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayBatDauTrongThang, 0, 0, 0),
        ketThuc: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59),
        thang: thoiGianCapNhat.thangBatDau,
        nam: year
      };
    }

    return null;
  }

  /**
   * Lấy tất cả các kỳ báo cáo trong một năm
   * @param thoiGianCapNhat Cấu hình kỳ báo cáo
   * @param year Năm cần lấy
   */
  getAllPeriodsInYear(thoiGianCapNhat: any, year: number) {
    const { loaiKy } = thoiGianCapNhat;
    const periods = [];

    // Kiểm tra năm có nằm trong phạm vi không
    if (thoiGianCapNhat.namBatDau && year < thoiGianCapNhat.namBatDau) {
      return periods;
    }
    if (thoiGianCapNhat.namKetThuc && year > thoiGianCapNhat.namKetThuc) {
      return periods;
    }

    // Đột xuất
    if (loaiKy === 'dot_xuat') {
      const baoCaoYear = thoiGianCapNhat.thoiGianBatDau.getFullYear();
      if (baoCaoYear === year) {
        periods.push({
          batDau: thoiGianCapNhat.thoiGianBatDau,
          ketThuc: thoiGianCapNhat.thoiGianKetThuc,
          thang: thoiGianCapNhat.thoiGianBatDau.getMonth() + 1,
          nam: year,
          tenKy: `${thoiGianCapNhat.ten}`
        });
      }
      return periods;
    }

    // Hàng tháng - 12 kỳ
    if (loaiKy === 'hang_thang') {
      for (let month = 1; month <= 12; month++) {
        periods.push({
          batDau: new Date(year, month - 1, thoiGianCapNhat.ngayBatDauTrongThang, 0, 0, 0),
          ketThuc: new Date(year, month - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59),
          thang: month,
          nam: year,
          tenKy: `Tháng ${month}/${year}`
        });
      }
      return periods;
    }

    // Hàng quý
    if (loaiKy === 'hang_quy') {
      const cacThang = thoiGianCapNhat.cacThangApDung || [];
      cacThang.forEach((month, index) => {
        periods.push({
          batDau: new Date(year, month - 1, thoiGianCapNhat.ngayBatDauTrongThang, 0, 0, 0),
          ketThuc: new Date(year, month - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59),
          thang: month,
          nam: year,
          tenKy: `Quý ${index + 1}/${year}`
        });
      });
      return periods;
    }

    // Hàng năm - 1 kỳ
    if (loaiKy === 'hang_nam') {
      periods.push({
        batDau: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayBatDauTrongThang, 0, 0, 0),
        ketThuc: new Date(year, thoiGianCapNhat.thangBatDau - 1, thoiGianCapNhat.ngayKetThucTrongThang, 23, 59, 59),
        thang: thoiGianCapNhat.thangBatDau,
        nam: year,
        tenKy: `Năm ${year}`
      });
      return periods;
    }

    return periods;
  }

  /**
   * API: Lấy kỳ báo cáo hiện tại
   */
  async getCurrentKyBaoCao(thoiGianCapNhatDoanSoId: number) {
    const thoiGianCapNhat = await this.thoiGianCapNhatDoanSoRepository.findOne({
      where: { id: thoiGianCapNhatDoanSoId }
    });

    if (!thoiGianCapNhat) {
      throw new BadRequestException('Không tìm thấy kỳ báo cáo');
    }

    const currentPeriod = this.getCurrentPeriod(thoiGianCapNhat);
    if (!currentPeriod) {
      throw new BadRequestException('Không thể tính toán kỳ báo cáo hiện tại');
    }

    const now = new Date();
    const dangDienRa = now >= currentPeriod.batDau && now <= currentPeriod.ketThuc;
    const daQuaHan = now > currentPeriod.ketThuc;

    return {
      id: thoiGianCapNhat.id,
      ten: thoiGianCapNhat.ten,
      loaiKy: thoiGianCapNhat.loaiKy,
      kyHienTai: {
        tenKy: this.getTenKy(thoiGianCapNhat, currentPeriod),
        thoiGianBatDau: currentPeriod.batDau,
        thoiGianKetThuc: currentPeriod.ketThuc,
        thang: currentPeriod.thang,
        nam: currentPeriod.nam,
        dangDienRa,
        daQuaHan
      }
    };
  }

  /**
   * API: Lấy tất cả kỳ báo cáo trong một năm
   */
  async getKyBaoCaoTheoNam(thoiGianCapNhatDoanSoId: number, nam?: number) {
    const year = nam || new Date().getFullYear();

    const thoiGianCapNhat = await this.thoiGianCapNhatDoanSoRepository.findOne({
      where: { id: thoiGianCapNhatDoanSoId }
    });

    if (!thoiGianCapNhat) {
      throw new BadRequestException('Không tìm thấy kỳ báo cáo');
    }

    const periods = this.getAllPeriodsInYear(thoiGianCapNhat, year);
    const now = new Date();

    return {
      id: thoiGianCapNhat.id,
      ten: thoiGianCapNhat.ten,
      loaiKy: thoiGianCapNhat.loaiKy,
      nam: year,
      cacKyBaoCao: periods.map(period => ({
        tenKy: period.tenKy,
        thoiGianBatDau: period.batDau,
        thoiGianKetThuc: period.ketThuc,
        thang: period.thang,
        nam: period.nam,
        dangDienRa: now >= period.batDau && now <= period.ketThuc,
        daQuaHan: now > period.ketThuc
      }))
    };
  }

  /**
   * Helper: Tạo tên kỳ báo cáo
   */
  private getTenKy(thoiGianCapNhat: any, period: any): string {
    const { loaiKy } = thoiGianCapNhat;

    if (loaiKy === 'dot_xuat') {
      return thoiGianCapNhat.ten;
    }

    if (loaiKy === 'hang_thang') {
      return `Tháng ${period.thang}/${period.nam}`;
    }

    if (loaiKy === 'hang_quy') {
      const cacThang = thoiGianCapNhat.cacThangApDung || [];
      const quyIndex = cacThang.indexOf(period.thang);
      return `Quý ${quyIndex + 1}/${period.nam}`;
    }

    if (loaiKy === 'hang_nam') {
      return `Năm ${period.nam}`;
    }

    return 'Không xác định';
  }
}

