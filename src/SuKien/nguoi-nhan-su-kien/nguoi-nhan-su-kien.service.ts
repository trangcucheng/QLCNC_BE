import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { NguoiNhanSuKien } from '../../databases/entities/NguoiNhanSuKien.entity';
import { SuKien } from '../../databases/entities/SuKien.entity';
import { ThongBao } from '../../databases/entities/ThongBao.entity';
import { User } from '../../databases/entities/user.entity';
import { TrangThaiThongBao, UserThongBao } from '../../databases/entities/UserThongBao.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ZaloPushNotificationService } from '../../HeThong/auth/zalo-push.service';
import { GuiThongBaoChoTatCaResponseDto, GuiThongBaoSuKienResponseDto } from './dto/nguoi-nhan-su-kien.dto';
import {
  CapNhatTrangThaiXemDto,
  GuiThongBaoChoTatCaDto,
  GuiThongBaoSuKienDto,
  LayThongBaoDto
} from './dto/nguoi-nhan-su-kien.dto';

@Injectable()
export class NguoiNhanSuKienService {
  constructor(
    @InjectRepository(NguoiNhanSuKien)
    private readonly nguoiNhanSuKienRepository: Repository<NguoiNhanSuKien>,
    @InjectRepository(SuKien)
    private readonly suKienRepository: Repository<SuKien>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
    @InjectRepository(ThongBao)
    private readonly thongBaoRepository: Repository<ThongBao>,
    @InjectRepository(UserThongBao)
    private readonly userThongBaoRepository: Repository<UserThongBao>,
    private readonly zaloPushService: ZaloPushNotificationService,
  ) { }

  /**
   * Gửi thông báo Zalo có kiểm tra file đính kèm từ sự kiện
   */
  private async sendZaloNotificationWithEventFiles(
    zaloUserIds: string[],
    suKien: SuKien,
    loaiThongBao?: string
  ): Promise<void> {
    if (zaloUserIds.length === 0) return;

    try {
      const message = `📢 ${loaiThongBao || 'Thông báo sự kiện'}\n\n` +
        `🎯 ${suKien.tenSuKien}\n` +
        `📅 ${suKien.thoiGianBatDau.toLocaleDateString('vi-VN')}\n` +
        `📍 ${suKien.diaDiem || 'Chưa xác định'}`;

      // Kiểm tra sự kiện có file đính kèm không
      let hasAttachment = false;
      if (suKien.fileDinhKem) {
        try {
          const fileData = JSON.parse(suKien.fileDinhKem);
          if (fileData && Array.isArray(fileData.files) && fileData.files.length > 0) {
            const baseUrl = process.env.DOMAIN_URL || 'http://localhost:3000';

            console.log(`📎 Có ${fileData.files.length} file đính kèm - sẽ gửi link trong message cho ${zaloUserIds.length} users`);

            // Tạo message với link download gọn gàng hơn
            const fileLinks = fileData.files.map((file, index) => {
              const fileName = file.originalName || file.name;
              const shortUrl = `${baseUrl}/api/v1${file.path}`;
              return `📎 ${fileName}\n   👆 Nhấn link để tải: ${shortUrl}`;
            }).join('\n\n');

            const messageWithFiles = `${message}\n\n📁 TỆP ĐÍNH KÈM (${fileData.files.length} file):\n${fileLinks}`;

            // Gửi message với links (không dùng attachment vì Zalo OA phức tạp)
            for (const zaloUserId of zaloUserIds) {
              this.zaloPushService.sendOAMessage(
                zaloUserId,
                messageWithFiles
              ).catch(error => {
                console.error(`Failed to send Zalo message with file links to ${zaloUserId}:`, error);
              });
            }

            hasAttachment = true; // Đã gửi với file đính kèm
          }
        } catch (parseError) {
          console.warn('Không thể parse file đính kèm từ sự kiện:', parseError);
        }
      }

      // Gửi thông báo thường nếu không có file đính kèm hoặc parse lỗi
      if (!hasAttachment) {
        this.zaloPushService.sendEventNotification(
          zaloUserIds,
          {
            id: suKien.id,
            tenSuKien: suKien.tenSuKien,
            thoiGianBatDau: suKien.thoiGianBatDau,
            diaDiem: suKien.diaDiem
          },
          loaiThongBao
        ).catch(error => {
          console.error('Failed to send Zalo push notifications:', error);
        });
      }

    } catch (error) {
      console.error('Error processing Zalo notifications:', error);
    }
  }

  // Gửi thông báo sự kiện cho danh sách người dùng cụ thể
  async guiThongBaoSuKien(guiThongBaoDto: GuiThongBaoSuKienDto): Promise<GuiThongBaoSuKienResponseDto> {
    try {
      // Kiểm tra sự kiện có tồn tại
      const suKien = await this.suKienRepository.findOne({
        where: { id: guiThongBaoDto.suKienId }
      });
      if (!suKien) {
        throw new BadRequestException('Sự kiện không tồn tại');
      }

      // Lấy danh sách user từ nguoiNhanIds (nếu có)
      const allUsers: User[] = [];
      let notFoundUserIds: string[] = [];

      if (guiThongBaoDto.nguoiNhanIds && guiThongBaoDto.nguoiNhanIds.length > 0) {
        const users = await this.userRepository.find({
          where: { id: In(guiThongBaoDto.nguoiNhanIds) }
        });
        allUsers.push(...users);

        const existingUserIds = users.map(user => user.id);
        notFoundUserIds = guiThongBaoDto.nguoiNhanIds.filter(id => !existingUserIds.includes(id));
      }

      // Lấy danh sách user từ roleIds (nếu có)
      if (guiThongBaoDto.roleIds && guiThongBaoDto.roleIds.length > 0) {
        const usersFromRoles = await this.userRepository.find({
          where: { roleId: In(guiThongBaoDto.roleIds) }
        });
        allUsers.push(...usersFromRoles);
      }

      // Loại bỏ user duplicate (nếu user vừa có trong nguoiNhanIds vừa có role trong roleIds)
      const uniqueUsers = allUsers.filter((user, index, self) =>
        index === self.findIndex(u => u.id === user.id)
      );

      const existingUserIds = uniqueUsers.map(user => user.id);

      const daGuiCho: string[] = [];
      const loi: string[] = [];

      // Gửi thông báo cho từng người dùng
      for (const userId of existingUserIds) {
        try {
          // Kiểm tra đã có thông báo này chưa
          const existing = await this.nguoiNhanSuKienRepository.findOne({
            where: {
              nguoiNhanId: userId,
              suKienId: guiThongBaoDto.suKienId
            }
          });

          if (existing) {
            // Cập nhật thông báo cũ
            existing.loaiThongBao = guiThongBaoDto.loaiThongBao || existing.loaiThongBao;
            existing.ghiChu = guiThongBaoDto.ghiChu || existing.ghiChu;
            existing.thoiGianGui = new Date();
            existing.trangThaiXem = 'Chưa xem'; // Reset trạng thái xem
            await this.nguoiNhanSuKienRepository.save(existing);
          } else {
            // Tạo thông báo mới
            const thongBaoMoi = this.nguoiNhanSuKienRepository.create({
              nguoiNhanId: userId,
              suKienId: guiThongBaoDto.suKienId,
              loaiThongBao: guiThongBaoDto.loaiThongBao || 'Thông báo sự kiện',
              ghiChu: guiThongBaoDto.ghiChu,
              trangThaiXem: 'Chưa xem',
              thoiGianGui: new Date()
            });
            await this.nguoiNhanSuKienRepository.save(thongBaoMoi);
          }

          daGuiCho.push(userId);
        } catch (error) {
          loi.push(`${userId}: ${error.message}`);
        }
      }

      // Thêm lỗi cho user không tồn tại
      notFoundUserIds.forEach(id => {
        loi.push(`${id}: Người dùng không tồn tại`);
      });

      // Lấy danh sách zalo_app_user_id từ bảng zalo_accounts
      const zaloAccounts = await this.zaloAccountRepository.find({
        where: { userId: In(daGuiCho) }
      });

      const zaloUserIds = zaloAccounts.map(acc => acc.zaloOaUserId).filter(Boolean);

      // Gửi notification qua Zalo OA (có kiểm tra file đính kèm từ sự kiện)
      if (zaloUserIds.length > 0) {
        await this.sendZaloNotificationWithEventFiles(zaloUserIds, suKien, guiThongBaoDto.loaiThongBao);
      } else {
        console.log('⚠️ Không có Zalo user nào để gửi notification');
      }

      // AUDIT_TRAIL_BROADCAST - Tạo bản ghi vào bảng ThongBao và UserThongBao
      try {
        const thongBaoAudit = this.thongBaoRepository.create({
          noiDungThongBao: `${suKien.tenSuKien}: ${guiThongBaoDto.ghiChu || 'Thông báo sự kiện'}`,
          nguoiGui: 'System', // Hoặc có thể truyền userId từ request
          ghiChu: `Gửi thông báo sự kiện - Loại: ${guiThongBaoDto.loaiThongBao || 'Thông báo sự kiện'} - Sự kiện ID: ${guiThongBaoDto.suKienId}`,
        });
        const savedThongBao = await this.thongBaoRepository.save(thongBaoAudit);

        // Tạo bản ghi UserThongBao cho từng user đã gửi thành công
        const userThongBaoRecords = daGuiCho.map(userId =>
          this.userThongBaoRepository.create({
            userId,
            thongBaoId: savedThongBao.id,
            trangThai: TrangThaiThongBao.CHUA_DOC,
            ghiChu: guiThongBaoDto.ghiChu
          })
        );
        await this.userThongBaoRepository.save(userThongBaoRecords);
      } catch (auditError) {
        console.error('Lỗi tạo bản ghi ThongBao/UserThongBao:', auditError);
        // Không throw error để không ảnh hưởng đến flow chính
      }
      return {
        message: 'Gửi thông báo hoàn tất',
        soLuongGui: daGuiCho.length,
        daGuiCho,
        loi
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gửi push notification tới Zalo Mini App (async, không chờ kết quả)
   */
  private async sendZaloPushNotifications(
    userIds: string[],
    suKien: any,
    loaiThongBao?: string
  ): Promise<void> {
    try {
      // Lấy danh sách Zalo accounts tương ứng
      const zaloAccounts = await this.zaloAccountRepository.find({
        where: { userId: In(userIds) }
      });

      const zaloUserIds = zaloAccounts.map(acc => acc.zaloOaUserId).filter(Boolean);

      if (zaloUserIds.length > 0) {
        // Gửi push notification (không chờ kết quả để không block API response)
        this.zaloPushService.sendEventNotification(
          zaloUserIds,
          {
            id: suKien.id,
            tenSuKien: suKien.tenSuKien,
            thoiGianBatDau: suKien.thoiGianBatDau,
            diaDiem: suKien.diaDiem
          },
          loaiThongBao
        ).catch(error => {
          console.error('Failed to send Zalo push notifications:', error);
        });
      }
    } catch (error) {
      console.error('Error in sendZaloPushNotifications:', error);
    }
  }

  // Gửi thông báo cho tất cả người dùng trong hệ thống
  async guiThongBaoChoTatCa(guiThongBaoDto: GuiThongBaoChoTatCaDto): Promise<GuiThongBaoChoTatCaResponseDto> {
    try {
      // BROADCAST_METHOD_START - Kiểm tra sự kiện có tồn tại
      const suKien = await this.suKienRepository.findOne({
        where: { id: guiThongBaoDto.suKienId }
      });
      if (!suKien) {
        throw new BadRequestException('Sự kiện không tồn tại');
      }

      // Lấy danh sách người dùng dựa trên roleIds hoặc tất cả nếu không có roleIds
      let allUsers: User[];
      if (guiThongBaoDto.roleIds && guiThongBaoDto.roleIds.length > 0) {
        // Gửi cho các role cụ thể
        allUsers = await this.userRepository.find({
          where: { roleId: In(guiThongBaoDto.roleIds) },
          select: ['id']
        });
      } else {
        // Gửi cho tất cả người dùng
        allUsers = await this.userRepository.find({
          select: ['id']
        });
      }

      const daGuiCho: string[] = [];

      // Gửi thông báo cho tất cả
      for (const user of allUsers) {
        try {
          // Kiểm tra đã có thông báo này chưa
          // const existing = await this.nguoiNhanSuKienRepository.findOne({
          //   where: {
          //     nguoiNhanId: user.id,
          //     suKienId: guiThongBaoDto.suKienId
          //   }
          // });

          // if (existing) {
          //   // Cập nhật thông báo cũ
          //   existing.loaiThongBao = guiThongBaoDto.loaiThongBao || existing.loaiThongBao;
          //   existing.ghiChu = guiThongBaoDto.ghiChu || existing.ghiChu;
          //   existing.thoiGianGui = new Date();
          //   existing.trangThaiXem = 'Chưa xem';
          //   await this.nguoiNhanSuKienRepository.save(existing);
          // } else {
          // Tạo thông báo mới
          const thongBaoMoi = this.nguoiNhanSuKienRepository.create({
            nguoiNhanId: user.id,
            suKienId: guiThongBaoDto.suKienId,
            loaiThongBao: guiThongBaoDto.loaiThongBao || 'Thông báo sự kiện',
            ghiChu: guiThongBaoDto.ghiChu,
            trangThaiXem: 'Chưa xem',
            thoiGianGui: new Date()
          });
          await this.nguoiNhanSuKienRepository.save(thongBaoMoi);
          // }

          daGuiCho.push(user.id);
        } catch (error) {
          console.error(`Lỗi gửi thông báo cho user ${user.id}:`, error);
        }
      }

      // ZALO_ACCOUNTS_SECTION - Lấy danh sách zalo_app_user_id từ bảng zalo_accounts
      const zaloAccounts = await this.zaloAccountRepository.find({
        where: { userId: In(daGuiCho) }
      });

      console.log(`📱 [Broadcast] Tìm thấy ${zaloAccounts.length} ZaloAccount cho ${daGuiCho.length} users`);
      console.log('ZaloAccounts:', zaloAccounts.map(acc => ({
        userId: acc.userId,
        zaloOaUserId: acc.zaloOaUserId
      })));

      const zaloUserIds = zaloAccounts.map(acc => acc.zaloOaUserId).filter(Boolean);

      console.log(`📨 [Broadcast] Chuẩn bị gửi Zalo cho ${zaloUserIds.length} users:`, zaloUserIds);

      // Gửi notification qua Zalo OA (có kiểm tra file đính kèm từ sự kiện)
      if (zaloUserIds.length > 0) {
        await this.sendZaloNotificationWithEventFiles(zaloUserIds, suKien, guiThongBaoDto.loaiThongBao);
        console.log(`✅ [Broadcast] Đã gửi Zalo notification cho ${zaloUserIds.length} users`);
      } else {
        console.log('⚠️ [Broadcast] Không có Zalo user nào để gửi notification');
      }

      // AUDIT_TRAIL_BROADCAST - Tạo bản ghi vào bảng ThongBao và UserThongBao
      try {
        const thongBaoAudit = this.thongBaoRepository.create({
          noiDungThongBao: `${suKien.tenSuKien}: ${guiThongBaoDto.ghiChu || 'Thông báo sự kiện cho tất cả'}`,
          nguoiGui: 'System', // Hoặc có thể truyền userId từ request
          ghiChu: `Gửi thông báo sự kiện - Loại: ${guiThongBaoDto.loaiThongBao || 'Thông báo sự kiện'} - Sự kiện ID: ${guiThongBaoDto.suKienId}`,
        });
        const savedThongBao = await this.thongBaoRepository.save(thongBaoAudit);

        // Tạo bản ghi UserThongBao cho từng user đã gửi thành công
        const userThongBaoRecords = daGuiCho.map(userId =>
          this.userThongBaoRepository.create({
            userId,
            thongBaoId: savedThongBao.id,
            trangThai: TrangThaiThongBao.CHUA_DOC,
            ghiChu: guiThongBaoDto.ghiChu
          })
        );
        await this.userThongBaoRepository.save(userThongBaoRecords);
      } catch (auditError) {
        console.error('Lỗi tạo bản ghi ThongBao/UserThongBao:', auditError);
        // Không throw error để không ảnh hưởng đến flow chính
      }

      return {
        message: 'Gửi thông báo cho tất cả thành công',
        soLuongGui: daGuiCho.length,
        daGuiCho
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách thông báo với phân trang và filter
  async layDanhSachThongBao(query: LayThongBaoDto, userID: string): Promise<{
    data: NguoiNhanSuKien[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, trangThaiXem, loaiThongBao, suKienId } = query;
      const skip = (page - 1) * limit;

      const whereCondition: any = {};

      if (userID) {
        whereCondition.nguoiNhanId = userID;
      }

      if (trangThaiXem) {
        whereCondition.trangThaiXem = trangThaiXem;
      }

      if (loaiThongBao) {
        whereCondition.loaiThongBao = loaiThongBao;
      }

      if (suKienId) {
        whereCondition.suKienId = suKienId;
      }

      const [data, total] = await this.nguoiNhanSuKienRepository.findAndCount({
        where: whereCondition,
        relations: ['nguoiNhan', 'suKien', 'suKien.loaiSuKien'],
        order: { thoiGianGui: 'DESC' },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật trạng thái đã xem thông báo
  async capNhatTrangThaiXem(capNhatDto: CapNhatTrangThaiXemDto): Promise<NguoiNhanSuKien> {
    try {
      const thongBao = await this.nguoiNhanSuKienRepository.findOne({
        where: {
          nguoiNhanId: capNhatDto.nguoiNhanId,
          suKienId: capNhatDto.suKienId
        },
        relations: ['suKien']
      });

      if (!thongBao) {
        throw new NotFoundException('Không tìm thấy thông báo');
      }

      thongBao.trangThaiXem = capNhatDto.trangThaiXem || 'Đã xem';
      if (capNhatDto.trangThaiXem === 'Đã xem') {
        thongBao.thoiGianXem = new Date();
      }

      return await this.nguoiNhanSuKienRepository.save(thongBao);
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông báo chưa xem của một người dùng
  async layThongBaoChuaXem(nguoiNhanId: string): Promise<NguoiNhanSuKien[]> {
    try {
      return await this.nguoiNhanSuKienRepository.find({
        where: {
          nguoiNhanId,
          trangThaiXem: 'Chưa xem'
        },
        relations: ['suKien', 'suKien.loaiSuKien'],
        order: { thoiGianGui: 'DESC' }
      });
    } catch (error) {
      throw error;
    }
  }

  // Đếm số thông báo chưa xem
  async demThongBaoChuaXem(nguoiNhanId: string): Promise<number> {
    try {
      return await this.nguoiNhanSuKienRepository.count({
        where: {
          nguoiNhanId,
          trangThaiXem: 'Chưa xem'
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết thông báo
  async layChiTiet(id: number): Promise<NguoiNhanSuKien> {
    try {
      const thongBao = await this.nguoiNhanSuKienRepository.findOne({
        where: { id },
        relations: ['suKien', 'suKien.loaiSuKien', 'suKien.user']
      });

      if (!thongBao) {
        throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
      }

      return thongBao;
    } catch (error) {
      throw error;
    }
  }

  // Xóa thông báo
  async xoaThongBao(nguoiNhanId: string, suKienId: number): Promise<{ message: string }> {
    try {
      const thongBao = await this.nguoiNhanSuKienRepository.findOne({
        where: {
          nguoiNhanId,
          suKienId
        }
      });

      if (!thongBao) {
        throw new NotFoundException('Không tìm thấy thông báo');
      }

      await this.nguoiNhanSuKienRepository.remove(thongBao);

      return {
        message: 'Xóa thông báo thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  // Xóa thông báo theo ID
  async xoa(id: number): Promise<void> {
    try {
      const thongBao = await this.nguoiNhanSuKienRepository.findOne({
        where: { id }
      });

      if (!thongBao) {
        throw new NotFoundException(`Không tìm thấy thông báo với ID ${id}`);
      }

      await this.nguoiNhanSuKienRepository.remove(thongBao);
    } catch (error) {
      throw error;
    }
  }
}
