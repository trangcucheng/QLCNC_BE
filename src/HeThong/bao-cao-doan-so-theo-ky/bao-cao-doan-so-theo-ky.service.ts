import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaloAccount } from 'src/databases/entities/ZaloAccount.entity';
import { Brackets, Repository } from 'typeorm';

import { BaoCaoDoanSoTheoKy, TrangThaiPheDuyet } from '../../databases/entities/BaoCaoDoanSoTheoKy.entity';
import { LoaiKyBaoCao } from '../../databases/entities/ThoiGianCapNhatDoanSo.entity';
import { ElasticSearchDto } from '../../elastic/dto/elastic.dto';
import { ELASTIC_INDEX } from '../../elastic/elastic.constants';
import { ElasticService } from '../../elastic/elastic.service';
import { ZaloPushNotificationService } from '../auth/zalo-push.service';
import { CumKhuCongNghiepRepository } from '../cum-khu-cong-nghiep/cum-khu-cong-nghiep.repository';
import { OrganizationRepository } from '../organization/organization.repository';
import { RoleRepository } from '../role/role.repository';
import { ThoiGianCapNhatDoanSoRepository } from '../thoi-gian-cap-nhat-doan-so/thoi-gian-cap-nhat-doan-so.repository';
import { ThongBaoService } from '../thong-bao/thong-bao.service';
import { UserRepository } from '../user/user.repository';
import { XaPhuongRepository } from '../xa-phuong/xa-phuong.repository';
import { BaoCaoDoanSoNotificationService } from './bao-cao-doan-so-notification.service';
import { BaoCaoDoanSoTheoKyRepository } from './bao-cao-doan-so-theo-ky.repository';
import {
  BaoCaoDoanSoTheoKyDetailDto,
  CreateBaoCaoDoanSoTheoKyDto,
  ListBaoCaoDoanSoTheoKyDto,
  UpdateBaoCaoDoanSoTheoKyDto,
  UpdateTrangThaiDto
} from './dto/bao-cao-doan-so-theo-ky.dto';

@Injectable()
export class BaoCaoDoanSoTheoKyService {
  constructor(
    private readonly baoCaoDoanSoTheoKyRepository: BaoCaoDoanSoTheoKyRepository,
    private readonly thoiGianCapNhatDoanSoRepository: ThoiGianCapNhatDoanSoRepository,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly cumKhuCnRepository: CumKhuCongNghiepRepository,
    private readonly xaPhuongRepository: XaPhuongRepository,
    private readonly thongBaoService: ThongBaoService,
    private readonly zaloPushService: ZaloPushNotificationService,
    private readonly reportNotificationService: BaoCaoDoanSoNotificationService,
    private readonly elasticService: ElasticService,
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
  ) { }

  async create(userID: string, createDto: CreateBaoCaoDoanSoTheoKyDto): Promise<BaoCaoDoanSoTheoKy> {
    console.log(userID, createDto, "đây");

    // ==================== TÌM KỲ BÁO CÁO PHÙ HỢP ====================
    let thoiGianCapNhatDoanSoId: number;

    if (createDto.thoiGianCapNhatDoanSoId) {
      // Nếu user chỉ định ID cụ thể, sử dụng ID đó
      thoiGianCapNhatDoanSoId = createDto.thoiGianCapNhatDoanSoId;
    } else {
      // Tự động tìm kỳ phù hợp dựa vào loaiKy
      const kyPhuHop = await this.timKyBaoCaoPhuHop(createDto.loaiKy);
      if (!kyPhuHop) {
        throw new NotFoundException(
          `Không tìm thấy kỳ báo cáo ${this.getTenLoaiKy(createDto.loaiKy)} đang hoạt động hoặc chưa được cấu hình`
        );
      }
      thoiGianCapNhatDoanSoId = kyPhuHop.id;
      console.log(`✅ Tự động chọn kỳ báo cáo: ${kyPhuHop.ten} (ID: ${kyPhuHop.id})`);
    }

    // Kiểm tra thời gian cập nhật đoàn số có tồn tại không
    const thoiGianCapNhat = await this.thoiGianCapNhatDoanSoRepository.findOne({
      where: { id: thoiGianCapNhatDoanSoId }
    });
    if (!thoiGianCapNhat) {
      throw new NotFoundException('Thời gian cập nhật đoàn số không tồn tại');
    }

    // Kiểm tra loaiKy có khớp không (nếu user chọn cả 2)
    if (createDto.thoiGianCapNhatDoanSoId && thoiGianCapNhat.loaiKy !== createDto.loaiKy) {
      throw new BadRequestException(
        `Loại kỳ báo cáo không khớp. Kỳ này là ${this.getTenLoaiKy(thoiGianCapNhat.loaiKy)}, bạn đang chọn ${this.getTenLoaiKy(createDto.loaiKy)}`
      );
    }

    // Lấy thông tin người tạo để lấy organizationId, xaPhuongId, cumKhuCnId
    const nguoiTao = await this.userRepository.findOne({ where: { id: userID } });
    if (!nguoiTao) {
      throw new NotFoundException('Người tạo không tồn tại');
    }
    console.log(nguoiTao, "người tạo");
    if (!nguoiTao.organizationId && !nguoiTao.xaPhuongId && !nguoiTao.cumKhuCnId) {
      throw new BadRequestException('Người tạo chưa được phân công tổ chức');
    }

    // Kiểm tra tổ chức có tồn tại không
    const organization = await this.organizationRepository.findOne({ where: { id: nguoiTao.organizationId } });
    const xaPhuong = await this.xaPhuongRepository.findOne({ where: { id: nguoiTao.xaPhuongId } });
    const cumKhuCn = await this.cumKhuCnRepository.findOne({ where: { id: nguoiTao.cumKhuCnId } });

    if (!organization) {
      throw new NotFoundException('Tổ chức của người tạo không tồn tại');
    }

    // Kiểm tra đã có báo cáo đã phê duyệt trong kỳ này chưa
    const count = await this.baoCaoDoanSoTheoKyRepository.count({
      where: [
        {
          thoiGianCapNhatDoanSoId: thoiGianCapNhatDoanSoId,
          organizationId: nguoiTao.organizationId,
          trangThaiPheDuyet: TrangThaiPheDuyet.DA_PHE_DUYET
        }

      ],
    });


    if (count > 0) {
      throw new ConflictException('Tổ chức này đã có báo cáo đã phê duyệt trong kỳ cập nhật này');
    }

    // Kiểm tra thời gian hiện tại có trong khoảng thời gian cập nhật không
    const now = new Date();

    // Với kỳ định kỳ (hang_thang, hang_quy, hang_nam): Tính kỳ hiện tại
    if (thoiGianCapNhat.loaiKy !== 'dot_xuat') {
      const kyHienTai = this.tinhKyBaoCaoHienTai(thoiGianCapNhat);

      if (!kyHienTai) {
        throw new BadRequestException('Không có kỳ báo cáo nào đang diễn ra');
      }

      if (now < kyHienTai.thoiGianBatDau || now > kyHienTai.thoiGianKetThuc) {
        throw new BadRequestException(
          `Hiện tại không trong thời gian báo cáo. Kỳ hiện tại: ${kyHienTai.tenKy} (${this.formatDate(kyHienTai.thoiGianBatDau)} - ${this.formatDate(kyHienTai.thoiGianKetThuc)})`
        );
      }
    } else {
      // Với kỳ đột xuất: Kiểm tra theo thoiGianBatDau/KetThuc
      if (!thoiGianCapNhat.thoiGianBatDau || !thoiGianCapNhat.thoiGianKetThuc) {
        throw new BadRequestException('Kỳ đột xuất phải có thời gian bắt đầu và kết thúc');
      }

      if (now < thoiGianCapNhat.thoiGianBatDau || now > thoiGianCapNhat.thoiGianKetThuc) {
        throw new BadRequestException(
          `Hiện tại không trong thời gian cập nhật đoàn số (${this.formatDate(thoiGianCapNhat.thoiGianBatDau)} - ${this.formatDate(thoiGianCapNhat.thoiGianKetThuc)})`
        );
      }
    }

    // Validate số liệu
    this.validateSoLieu(createDto);

    // Tạo báo cáo với thông tin từ người tạo
    const baoCao = this.baoCaoDoanSoTheoKyRepository.create({
      ...createDto,
      thoiGianCapNhatDoanSoId: thoiGianCapNhatDoanSoId, // Sử dụng ID đã tìm được
      organizationId: nguoiTao.organizationId ?? null,
      xaPhuongId: nguoiTao.xaPhuongId ?? null,
      cumKhuCnId: nguoiTao.cumKhuCnId ?? null
    });
    baoCao.nguoiBaoCaoId = userID;
    const savedBaoCao = await this.baoCaoDoanSoTheoKyRepository.save(baoCao);

    // 🔄 Đồng bộ lên Elasticsearch
    try {
      const elasticData = await this.getBaoCaoForElastic(savedBaoCao.id);
      if (elasticData) {
        await this.elasticService.insert(ELASTIC_INDEX.BAO_CAO, elasticData, savedBaoCao.id);
        console.log(`✅ Đã đồng bộ báo cáo ID ${savedBaoCao.id} lên Elasticsearch`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi đồng bộ báo cáo lên Elasticsearch:', error);
    }

    // 🔔 Thông báo người phê duyệt nếu có chỉ định
    // if (createDto.nguoiPheDuyetId) {
    //   await this.sendNotificationToApprover(savedBaoCao, createDto.nguoiPheDuyetId, thoiGianCapNhat, organization);
    // }

    return savedBaoCao;
  }

  async findAll(queryDto: ListBaoCaoDoanSoTheoKyDto): Promise<{
    data: BaoCaoDoanSoTheoKyDetailDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {

    const { page = 1, limit = 10, search, tenBaoCao, trangThaiPheDuyet, loaiBaoCao, organizationId, thoiGianCapNhatDoanSoId } = queryDto;

    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('baoCao')
      .leftJoin('thoi_gian_cap_nhat_doan_so', 'thoiGian', 'baoCao.thoiGianCapNhatDoanSoId = thoiGian.id')
      .leftJoin('user', 'nbc', 'baoCao.nguoiBaoCaoId = nbc.id')
      .leftJoin('user', 'npd', 'baoCao.nguoiPheDuyetId = npd.id')
      .leftJoin('organization', 'org', 'baoCao.organizationId = org.id')
      .leftJoin('xaPhuong', 'xa', 'baoCao.xaPhuongId = xa.id')
      .leftJoin('cumKhuCongNghiep', 'cumKhuCn', 'baoCao.cumKhuCnId = cumKhuCn.id')
      .select([
        'baoCao.id',
        'baoCao.tenBaoCao',
        'baoCao.thoiGianCapNhatDoanSoId',
        'baoCao.nguoiBaoCaoId',
        'baoCao.organizationId',
        'baoCao.xaPhuongId',
        'baoCao.cumKhuCnId',
        'baoCao.soLuongDoanVienNam',
        'baoCao.soLuongDoanVienNu',
        'baoCao.soLuongCNVCLDNam',
        'baoCao.soLuongCNVCLDNu',
        'baoCao.tongSoCongDoan',
        'baoCao.tongSoCnvcld',
        'baoCao.noiDung',
        'baoCao.trangThaiPheDuyet',
        'baoCao.loaiBaoCao',
        'baoCao.ghiChu',
        'baoCao.nguoiPheDuyetId',
        'baoCao.ngayPheDuyet',
        'baoCao.createdAt',
        'baoCao.updatedAt',
        'thoiGian.id AS thoiGian_id',
        'thoiGian.ten AS thoiGian_ten',
        'thoiGian.thoiGianBatDau AS thoiGian_thoiGianBatDau',
        'thoiGian.thoiGianKetThuc AS thoiGian_thoiGianKetThuc',
        'thoiGian.moTa AS thoiGian_moTa',
        'thoiGian.loaiKy',
        'nbc.id AS nguoiBaoCao_id',
        'nbc.fullName AS nguoiBaoCao_fullName',
        'nbc.email AS nguoiBaoCao_email',
        'org.id AS organization_id',
        'org.name AS organization_name',
        'xa.ten AS xaPhuong_ten',
        'cumKhuCn.ten AS cumKhuCn_ten',
      ]);

    // Tìm kiếm tổng quát
    if (search) {
      queryBuilder.andWhere(
        '(baoCao.tenBaoCao LIKE :search OR baoCao.noiDung LIKE :search OR baoCao.ghiChu LIKE :search OR org.name LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (tenBaoCao) {
      queryBuilder.andWhere('baoCao.tenBaoCao LIKE :tenBaoCao', { tenBaoCao: `%${tenBaoCao}%` });
    }

    if (trangThaiPheDuyet) {
      queryBuilder.andWhere('baoCao.trangThaiPheDuyet = :trangThaiPheDuyet', { trangThaiPheDuyet });
    }

    if (loaiBaoCao) {
      queryBuilder.andWhere('baoCao.loaiBaoCao = :loaiBaoCao', { loaiBaoCao });
    }

    if (organizationId) {
      queryBuilder.andWhere('baoCao.organizationId = :organizationId', { organizationId });
    }

    if (thoiGianCapNhatDoanSoId) {
      queryBuilder.andWhere('baoCao.thoiGianCapNhatDoanSoId = :thoiGianCapNhatDoanSoId', { thoiGianCapNhatDoanSoId });
    }

    queryBuilder.orderBy('baoCao.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const rawData = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    const totalPages = Math.ceil(total / (limit || 10));

    return {
      data: rawData,
      total,
      page: queryDto.page || 1,
      limit: queryDto.limit || 10,
      totalPages,
    };
  }

  async findOne(id: number): Promise<BaoCaoDoanSoTheoKyDetailDto> {
    const rawData = await this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('baoCao')
      .leftJoin('ThoiGianCapNhatDoanSo', 'thoiGian', 'baoCao.thoiGianCapNhatDoanSoId = thoiGian.id')
      .leftJoin('user', 'nbc', 'baoCao.nguoiBaoCaoId = nbc.id')
      .leftJoin('user', 'npd', 'baoCao.nguoiPheDuyetId = npd.id')
      .leftJoin('organization', 'org', 'baoCao.organizationId = org.id')
      .select([
        'baoCao.id',
        'baoCao.tenBaoCao',
        'baoCao.thoiGianCapNhatDoanSoId',
        'baoCao.nguoiBaoCaoId',
        'baoCao.organizationId',
        'baoCao.xaPhuongId',
        'baoCao.cumKhuCnId',
        'baoCao.soLuongDoanVienNam',
        'baoCao.soLuongDoanVienNu',
        'baoCao.soLuongCNVCLDNam',
        'baoCao.soLuongCNVCLDNu',
        'baoCao.tongSoCongDoan',
        'baoCao.tongSoCnvcld',
        'baoCao.noiDung',
        'baoCao.trangThaiPheDuyet',
        'baoCao.ghiChu',
        'baoCao.nguoiPheDuyetId',
        'baoCao.ngayPheDuyet',
        'baoCao.createdAt',
        'baoCao.loaiBaoCao',
        'baoCao.updatedAt',
        'thoiGian.id AS thoiGian_id',
        'thoiGian.ten AS thoiGian_ten',
        'thoiGian.thoiGianBatDau AS thoiGian_thoiGianBatDau',
        'thoiGian.thoiGianKetThuc AS thoiGian_thoiGianKetThuc',
        'thoiGian.moTa AS thoiGian_moTa',
        'thoiGian.loaiKy',
        'nbc.id AS nguoiBaoCao_id',
        'nbc.fullName AS nguoiBaoCao_fullName',
        'nbc.email AS nguoiBaoCao_email',
        'npd.id AS nguoiPheDuyet_id',
        'npd.fullName AS nguoiPheDuyet_fullName',
        'npd.email AS nguoiPheDuyet_email',
        'org.id AS organization_id',
        'org.name AS organization_name'
      ])
      .where('baoCao.id = :id', { id })
      .getRawOne();

    if (!rawData) return null;

    return rawData;
  }

  async update(id: number, updateDto: UpdateBaoCaoDoanSoTheoKyDto) {
    const existingBaoCao = await this.baoCaoDoanSoTheoKyRepository.findOne(id);
    if (!existingBaoCao) {
      throw new NotFoundException('Không tìm thấy báo cáo đoàn số');
    }


    // Chỉ cho phép cập nhật nếu báo cáo đang chờ phê duyệt hoặc bị từ chối
    if (existingBaoCao.trangThaiPheDuyet !== TrangThaiPheDuyet.CHO_PHE_DUYET &&
      existingBaoCao.trangThaiPheDuyet !== TrangThaiPheDuyet.TU_CHOI) {
      throw new BadRequestException('Chỉ có thể cập nhật báo cáo đang chờ phê duyệt hoặc bị từ chối');
    }

    // Validate số liệu nếu có cập nhật
    if (this.hasSoLieuUpdate(updateDto)) {
      this.validateSoLieu({
        ...existingBaoCao,
        ...updateDto,
      } as any);
    }

    // Nếu báo cáo đang bị từ chối, sau khi sửa sẽ chuyển sang chờ phê duyệt
    const dataToUpdate: any = { ...updateDto };
    if (existingBaoCao.trangThaiPheDuyet === TrangThaiPheDuyet.TU_CHOI) {
      dataToUpdate.trangThaiPheDuyet = TrangThaiPheDuyet.CHO_PHE_DUYET;
    }

    console.log('💾 Data sẽ update vào DB:', JSON.stringify(dataToUpdate, null, 2));

    const result = await this.baoCaoDoanSoTheoKyRepository.update(id, dataToUpdate);

    // 🔄 Đồng bộ lên Elasticsearch
    try {
      const elasticData = await this.getBaoCaoForElastic(id);
      if (elasticData) {
        await this.elasticService.update(ELASTIC_INDEX.BAO_CAO, id.toString(), elasticData);
        console.log(`✅ Đã cập nhật báo cáo ID ${id} trên Elasticsearch`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật báo cáo trên Elasticsearch:', error);
    }

    return result;
  }

  async remove(id: number): Promise<void> {
    const existingBaoCao = await this.baoCaoDoanSoTheoKyRepository.findOne(id);
    if (!existingBaoCao) {
      throw new NotFoundException('Không tìm thấy báo cáo đoàn số');
    }

    // Chỉ cho phép xóa nếu báo cáo đang chờ phê duyệt hoặc bị từ chối
    if (existingBaoCao.trangThaiPheDuyet !== TrangThaiPheDuyet.CHO_PHE_DUYET &&
      existingBaoCao.trangThaiPheDuyet !== TrangThaiPheDuyet.TU_CHOI) {
      throw new BadRequestException('Chỉ có thể xóa báo cáo đang chờ phê duyệt hoặc bị từ chối');
    }

    await this.baoCaoDoanSoTheoKyRepository.delete(id);

    // 🔄 Xóa khỏi Elasticsearch
    try {
      await this.elasticService.delete(ELASTIC_INDEX.BAO_CAO, id.toString());
      console.log(`✅ Đã xóa báo cáo ID ${id} khỏi Elasticsearch`);
    } catch (error) {
      console.error('❌ Lỗi khi xóa báo cáo khỏi Elasticsearch:', error);
    }
  }

  async updateTrangThai(id: number, updateTrangThaiDto: UpdateTrangThaiDto, nguoiPheDuyet: string) {
    const existingBaoCao = await this.baoCaoDoanSoTheoKyRepository.findOne(id);
    if (!existingBaoCao) {
      throw new NotFoundException('Không tìm thấy báo cáo đoàn số');
    }
    // Lấy thông tin tổ chức và người tạo báo cáo để gửi thông báo
    const organization = await this.organizationRepository.findOne({
      where: { id: existingBaoCao.organizationId }
    });
    const cumKhuCn = await this.cumKhuCnRepository.findOne({
      where: { id: existingBaoCao.cumKhuCnId }
    });
    const xaPhuong = await this.xaPhuongRepository.findOne({
      where: { id: existingBaoCao.xaPhuongId }
    });
    const nguoiTaoBaoCao = await this.userRepository.findOne({
      where: { id: existingBaoCao.nguoiBaoCaoId }
    });

    if (!nguoiTaoBaoCao) {
      console.warn(`⚠️ Không tìm thấy người tạo báo cáo với ID: ${existingBaoCao.nguoiBaoCaoId}`);
    }

    const { trangThaiPheDuyet, ghiChu, nguoiPheDuyetId } = updateTrangThaiDto;

    const updateData: any = {
      trangThaiPheDuyet,
      // Lưu người phê duyệt (ưu tiên từ DTO, nếu không có thì dùng từ parameter)
      nguoiPheDuyetId: nguoiPheDuyetId || nguoiPheDuyet,
      // Lưu thời gian phê duyệt
      ngayPheDuyet: new Date()
    };

    if (ghiChu !== undefined) {
      updateData.ghiChu = ghiChu;
    }

    const updatedBaoCao = await this.baoCaoDoanSoTheoKyRepository.update(id, updateData);

    // 🔄 Đồng bộ lên Elasticsearch
    try {
      const elasticData = await this.getBaoCaoForElastic(id);
      if (elasticData) {
        await this.elasticService.update(ELASTIC_INDEX.BAO_CAO, id.toString(), elasticData);
        console.log(`✅ Đã cập nhật trạng thái báo cáo ID ${id} trên Elasticsearch`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái báo cáo trên Elasticsearch:', error);
    }

    // 🔔 Gửi thông báo kết quả phê duyệt cho người tạo báo cáo
    await this.sendApprovalNotificationToCreator(existingBaoCao, trangThaiPheDuyet, ghiChu, organization, cumKhuCn, xaPhuong, nguoiTaoBaoCao, nguoiPheDuyet);

    // Nếu phê duyệt báo cáo, cập nhật số liệu vào bảng organization
    if (updateTrangThaiDto.trangThaiPheDuyet === TrangThaiPheDuyet.DA_PHE_DUYET) {
      console.log('Cập nhật số liệu đoàn số cho tổ chức sau khi phê duyệt báo cáo ID:', id);
      await this.updateOrganizationDoanSo(existingBaoCao);
    }

    return updatedBaoCao;
  }

  private async updateOrganizationDoanSo(baoCao: any): Promise<void> {
    try {


      // CHỈ cập nhật cho Organization (công đoàn cơ sở)
      // Không cập nhật cho CumKhu và XaPhuong vì đó là danh mục dùng chung
      if (!baoCao.organizationId) {
        console.warn('⚠️ Báo cáo không có organizationId, bỏ qua cập nhật số liệu');
        return;
      }

      // Lấy thông tin organization
      const organization = await this.organizationRepository.findOne({
        where: { id: baoCao.organizationId }
      });

      if (!organization) {
        console.error('❌ Không tìm thấy công đoàn cơ sở với ID:', baoCao.organizationId);
        throw new NotFoundException('Không tìm thấy công đoàn cơ sở');
      }

      // Cập nhật số liệu
      organization.slCongDoanNam = baoCao.soLuongDoanVienNam || 0;
      organization.slCongDoanNu = baoCao.soLuongDoanVienNu || 0;
      organization.slCongNhanVienChucLdNam = baoCao.soLuongCNVCLDNam || 0;
      organization.slCongNhanVienChucLdNu = baoCao.soLuongCNVCLDNu || 0;
      organization.tongSoCongDoan = baoCao.tongSoCongDoan || 0;
      organization.tongSoCnvcld = baoCao.tongSoCnvcld || 0;

      await this.organizationRepository.save(organization);
      console.log(`✅ Đã cập nhật số liệu đoàn số cho công đoàn cơ sở ID: ${baoCao.organizationId}`);

    } catch (error) {
      console.error('❌ Lỗi khi cập nhật số liệu organization:', error.message);
      // Không throw error để không ảnh hưởng đến việc phê duyệt báo cáo
      // Chỉ log lỗi để theo dõi
    }
  }

  // Method gửi thông báo về kết quả phê duyệt
  private async sendApprovalNotification(
    baoCao: any,
    trangThaiPheDuyet: TrangThaiPheDuyet,
    ghiChu: string,
    organization: any,
    cumKhuCn: any,
    xaPhuong: any,
    nguoiTaoBaoCao: any,
    nguoiPheDuyet: string
  ): Promise<void> {
    try {
      let tieuDe = '';
      let noiDungChinh = '';
      let trangThaiText = '';

      // Xác định nội dung thông báo dựa trên trạng thái
      switch (trangThaiPheDuyet) {
        case TrangThaiPheDuyet.DA_PHE_DUYET:
          tieuDe = '✅ Báo cáo đoàn số đã được phê duyệt';
          trangThaiText = 'Đã phê duyệt';
          noiDungChinh = `Chúc mừng! Báo cáo đoàn số theo kỳ của ${organization?.name || cumKhuCn?.ten || xaPhuong?.ten || 'tổ chức'} đã được phê duyệt thành công.\n\nSố liệu trong báo cáo đã được cập nhật vào hệ thống và có hiệu lực từ hôm nay.`;
          break;

        case TrangThaiPheDuyet.TU_CHOI:
          tieuDe = '❌ Báo cáo đoàn số bị từ chối';
          trangThaiText = 'Bị từ chối';
          noiDungChinh = `Báo cáo đoàn số theo kỳ của ${organization?.name || cumKhuCn?.ten || xaPhuong?.ten || 'tổ chức'} đã bị từ chối phê duyệt.\n\nVui lòng kiểm tra lại thông tin và nộp báo cáo mới.`;
          break;

        default:
          tieuDe = '🔄 Cập nhật trạng thái báo cáo đoàn số';
          trangThaiText = 'Đang xử lý';
          noiDungChinh = `Trạng thái báo cáo đoàn số theo kỳ của ${organization?.name || cumKhuCn?.ten || xaPhuong?.ten || 'tổ chức'} đã được cập nhật.`;
          break;
      }

      // Tạo thông báo tùy chỉnh với DTO mới
      let thongTinBoSung = '';
      if (nguoiPheDuyet) {
        thongTinBoSung += `Được xử lý bởi: ${nguoiPheDuyet}`;
      }
      if (ghiChu) {
        thongTinBoSung += thongTinBoSung ? `\nGhi chú: ${ghiChu}` : `Ghi chú: ${ghiChu}`;
      }

      // const customMessageDto = {
      //   tieuDe,
      //   noiDungChinh,
      //   trangThai: trangThaiText,
      //   thongTinBoSung: thongTinBoSung || undefined,
      //   ghiChu: 'Thông báo phê duyệt báo cáo đoàn số',
      //   nguoiNhanIds: nguoiTaoBaoCao ? [nguoiTaoBaoCao.id] : [] // Chỉ gửi cho người tạo báo cáo
      // };
      // try {
      //   await this.thongBaoService.createCustomMessage(nguoiPheDuyet, customMessageDto);
      // } catch (dbNotificationError) {
      //   console.error(`❌ Lỗi gửi thông báo database:`, dbNotificationError.message);
      //   // Tiếp tục với Zalo notification dù database notification thất bại
      // }

      // 2. Gửi Push Notification qua Zalo (nếu có liên kết Zalo)
      if (nguoiTaoBaoCao?.id) {
        try {
          // Tìm Zalo user từ bảng zalo_users  
          const zaloUser = await this.zaloAccountRepository.findOne({
            where: { userId: nguoiTaoBaoCao.id }
          });

          if (zaloUser) {
            // Sử dụng ZMP notification thay vì OA push message
            const zmpResult = await this.zaloPushService.sendApprovalNotification(
              zaloUser.zaloOaUserId,
              {
                reportId: baoCao.id,
                reportType: 'Báo cáo đoàn số theo kỳ',
                status: trangThaiPheDuyet === TrangThaiPheDuyet.DA_PHE_DUYET ? 'approved' : 'rejected',
                reason: ghiChu || undefined
              }
            );

            if (zmpResult && zmpResult.success) {
              console.log(`✅ Đã gửi Zalo OA message cho user: ${nguoiTaoBaoCao.id}`);
            } else {
              console.log(`❌ Lỗi gửi Zalo OA message: ${zmpResult?.error || 'Unknown error'}`);
            }
          } else {
            console.log(`ℹ️ User ${nguoiTaoBaoCao.id} chưa liên kết tài khoản Zalo`);
          }
        } catch (pushError) {
          console.error('❌ Lỗi khi gửi push notification Zalo:', pushError);
        }
      }

    } catch (error) {
      console.error('❌ Lỗi khi gửi thông báo phê duyệt:', error);
      // Không throw error để không ảnh hưởng đến việc phê duyệt
    }
  }

  // async findByOrganization(organizationId: number): Promise<BaoCaoDoanSoTheoKyDetailDto[]> {
  //   const baoCaoList = await this.baoCaoDoanSoTheoKyRepository.findByOrganization(organizationId);
  //   return baoCaoList.map(item => this.formatDetailResponse(item));
  // }

  // async findByThoiGianCapNhat(thoiGianCapNhatDoanSoId: number): Promise<BaoCaoDoanSoTheoKyDetailDto[]> {
  //   const baoCaoList = await this.baoCaoDoanSoTheoKyRepository.findByThoiGianCapNhat(thoiGianCapNhatDoanSoId);
  //   return baoCaoList.map(item => this.formatDetailResponse(item));
  // }

  // async findByTrangThai(trangThaiPheDuyet: TrangThaiPheDuyet): Promise<BaoCaoDoanSoTheoKyDetailDto[]> {
  //   const baoCaoList = await this.baoCaoDoanSoTheoKyRepository.findByTrangThai(trangThaiPheDuyet);
  //   return baoCaoList.map(item => this.formatDetailResponse(item));
  // }

  // async getThongKeTheoKy(thoiGianCapNhatDoanSoId: number): Promise<ThongKeDoanSoTheoKyDto> {
  //   const result = await this.baoCaoDoanSoTheoKyRepository.getTongSoLuongTheoKy(thoiGianCapNhatDoanSoId);

  //   const tongDoanVien = result.tongDoanVienNam + result.tongDoanVienNu;
  //   const tongCNVCLD = result.tongCNVCLDNam + result.tongCNVCLDNu;
  //   const tongTatCa = tongDoanVien + tongCNVCLD;

  //   return {
  //     ...result,
  //     tongDoanVien,
  //     tongCNVCLD,
  //     tongTatCa,
  //   };
  // }

  // async listAll(): Promise<BaoCaoDoanSoTheoKyDetailDto[]> {
  //   const result = await this.baoCaoDoanSoTheoKyRepository.findAllWithPagination({ page: 1, limit: 1000 });
  //   return result.data.map(item => this.formatDetailResponse(item));
  // }

  private validateSoLieu(data: any): void {
    const { soLuongDoanVienNam, soLuongDoanVienNu, soLuongCNVCLDNam, soLuongCNVCLDNu } = data;

    // Kiểm tra số liệu không được âm
    if (soLuongDoanVienNam < 0 || soLuongDoanVienNu < 0 || soLuongCNVCLDNam < 0 || soLuongCNVCLDNu < 0) {
      throw new BadRequestException('Số liệu không được âm');
    }

    // Kiểm tra tổng số liệu hợp lý
    const tongSo = (soLuongDoanVienNam || 0) + (soLuongDoanVienNu || 0) + (soLuongCNVCLDNam || 0) + (soLuongCNVCLDNu || 0);
    if (tongSo === 0) {
      throw new BadRequestException('Phải có ít nhất một số liệu lớn hơn 0');
    }

    // Giới hạn số lượng tối đa cho mỗi loại
    const maxPerCategory = 100000;
    if (soLuongDoanVienNam > maxPerCategory || soLuongDoanVienNu > maxPerCategory ||
      soLuongCNVCLDNam > maxPerCategory || soLuongCNVCLDNu > maxPerCategory) {
      throw new BadRequestException(`Số lượng mỗi loại không được vượt quá ${maxPerCategory}`);
    }
  }

  /**
   * Tính kỳ báo cáo hiện tại cho báo cáo định kỳ
   */
  private tinhKyBaoCaoHienTai(config: any): { tenKy: string; thoiGianBatDau: Date; thoiGianKetThuc: Date } | null {
    const now = new Date();
    const namHienTai = now.getFullYear();
    const thangHienTai = now.getMonth() + 1; // 1-12

    // Kiểm tra năm có trong khoảng áp dụng không
    if (config.namBatDau && namHienTai < config.namBatDau) return null;
    if (config.namKetThuc && namHienTai > config.namKetThuc) return null;

    let kyBaoCao: { tenKy: string; thoiGianBatDau: Date; thoiGianKetThuc: Date } | null = null;

    switch (config.loaiKy) {
      case 'hang_thang':
        // Báo cáo hàng tháng
        const ngayBatDau = new Date(namHienTai, thangHienTai - 1, config.ngayBatDauTrongThang, 0, 0, 0);
        const ngayKetThuc = new Date(namHienTai, thangHienTai - 1, config.ngayKetThucTrongThang, 23, 59, 59);

        kyBaoCao = {
          tenKy: `Tháng ${thangHienTai}/${namHienTai}`,
          thoiGianBatDau: ngayBatDau,
          thoiGianKetThuc: ngayKetThuc
        };
        break;

      case 'hang_quy':
        // Tìm tháng trong cacThangApDung gần nhất
        if (!config.cacThangApDung || !Array.isArray(config.cacThangApDung)) return null;

        const thangApDung = config.cacThangApDung.find(t => t === thangHienTai);
        if (thangApDung) {
          const quyBatDau = new Date(namHienTai, thangApDung - 1, config.ngayBatDauTrongThang, 0, 0, 0);
          const quyKetThuc = new Date(namHienTai, thangApDung - 1, config.ngayKetThucTrongThang, 23, 59, 59);

          kyBaoCao = {
            tenKy: `Quý ${Math.ceil(thangApDung / 3)}/${namHienTai}`,
            thoiGianBatDau: quyBatDau,
            thoiGianKetThuc: quyKetThuc
          };
        }
        break;

      case 'hang_nam':
        // Báo cáo hàng năm
        if (thangHienTai === config.thangBatDau) {
          const namBatDau = new Date(namHienTai, config.thangBatDau - 1, config.ngayBatDauTrongThang, 0, 0, 0);
          const namKetThuc = new Date(namHienTai, config.thangBatDau - 1, config.ngayKetThucTrongThang, 23, 59, 59);

          kyBaoCao = {
            tenKy: `Năm ${namHienTai}`,
            thoiGianBatDau: namBatDau,
            thoiGianKetThuc: namKetThuc
          };
        }
        break;
    }

    return kyBaoCao;
  }

  /**
   * Format date sang dd/MM/yyyy
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private hasSoLieuUpdate(updateDto: UpdateBaoCaoDoanSoTheoKyDto): boolean {
    return !!(updateDto.soLuongDoanVienNam !== undefined ||
      updateDto.soLuongDoanVienNu !== undefined ||
      updateDto.soLuongCNVCLDNam !== undefined ||
      updateDto.soLuongCNVCLDNu !== undefined);
  }

  // private formatDetailResponse(baoCao: any): BaoCaoDoanSoTheoKyDetailDto {
  //   const result: BaoCaoDoanSoTheoKyDetailDto = {
  //     id: baoCao.id,
  //     tenBaoCao: baoCao.tenBaoCao,
  //     thoiGianCapNhatDoanSoId: baoCao.thoiGianCapNhatDoanSoId,
  //     nguoiBaoCaoId: baoCao.nguoiBaoCaoId,
  //     organizationId: baoCao.organizationId,
  //     soLuongDoanVienNam: baoCao.soLuongDoanVienNam,
  //     soLuongDoanVienNu: baoCao.soLuongDoanVienNu,
  //     soLuongCNVCLDNam: baoCao.soLuongCNVCLDNam,
  //     soLuongCNVCLDNu: baoCao.soLuongCNVCLDNu,
  //     noiDung: baoCao.noiDung,
  //     trangThaiPheDuyet: baoCao.trangThaiPheDuyet,
  //     ghiChu: baoCao.ghiChu,
  //     createdAt: baoCao.createdAt,
  //     updatedAt: baoCao.updatedAt,
  //   };

  //   if (baoCao.thoiGianCapNhatDoanSo) {
  //     result.thoiGianCapNhatDoanSo = baoCao.thoiGianCapNhatDoanSo;
  //   }

  //   if (baoCao.nguoiBaoCao) {
  //     result.nguoiBaoCao = baoCao.nguoiBaoCao;
  //   }

  //   if (baoCao.organization) {
  //     result.organization = baoCao.organization;
  //   }

  //   return result;
  // }

  async findAllDePheDuyet(userID: string, queryDto: ListBaoCaoDoanSoTheoKyDto) {
    const { page = 1, limit = 10, search, tenBaoCao, trangThaiPheDuyet, organizationId, thoiGianCapNhatDoanSoId, thang, quy, nam } = queryDto;

    // Build Elasticsearch filters
    const filters: Record<string, any> = {};
    let isAdmin = false;

    // Handle user authentication and permissions
    if (userID) {
      const userDetail = await this.userRepository.findOne({ where: { id: userID } });

      if (userDetail) {
        const role = await this.roleRepository.findOne({ where: { id: userDetail.roleId } });

        if (role) {
          if (['ADMIN', 'QT', 'LD', 'CV'].includes(role.description)) {
            isAdmin = true;
          }

          // Apply permission filters for non-admin users
          if (!isAdmin) {
            const { organizationId: userOrgId, cumKhuCnId, xaPhuongId } = userDetail;

            // Nếu có organizationId từ query, ưu tiên dùng nó
            if (!organizationId) {
              if (userOrgId && userOrgId !== 0) {
                filters['baoCao_organizationId'] = userOrgId;
              } else if (cumKhuCnId && cumKhuCnId !== 0) {
                filters['baoCao_cumKhuCnId'] = cumKhuCnId;
              } else if (xaPhuongId && xaPhuongId !== 0) {
                filters['baoCao_xaPhuongId'] = xaPhuongId;
              }
            }
          }
        }
      }
    }

    // Filter by trangThaiPheDuyet
    if (trangThaiPheDuyet) {
      filters['baoCao_trangThaiPheDuyet'] = trangThaiPheDuyet;
    } else if (!userID) {
      // Public access - chỉ show approved reports
      filters['baoCao_trangThaiPheDuyet'] = TrangThaiPheDuyet.DA_PHE_DUYET;
    }

    // Filter by organizationId (từ query)
    if (organizationId) {
      filters['baoCao_organizationId'] = organizationId;
    }

    // Filter by thoiGianCapNhatDoanSoId
    if (thoiGianCapNhatDoanSoId) {
      filters['baoCao_thoiGianCapNhatDoanSoId'] = thoiGianCapNhatDoanSoId;
    }

    // Build date range filter cho Elasticsearch
    let dateRangeFilter = null;
    let loaiKyFilter = null;

    if (nam || thang || quy) {
      const year = nam || new Date().getFullYear();

      if (thang) {
        // Filter theo tháng cụ thể
        const startDate = new Date(year, thang - 1, 1);
        const endDate = new Date(year, thang, 0, 23, 59, 59);
        dateRangeFilter = {
          range: {
            baoCao_createdAt: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString()
            }
          }
        };
        loaiKyFilter = LoaiKyBaoCao.HANG_THANG;
      } else if (quy) {
        // Filter theo quý
        const thangBatDau = (quy - 1) * 3 + 1;
        const thangKetThuc = quy * 3;
        const startDate = new Date(year, thangBatDau - 1, 1);
        const endDate = new Date(year, thangKetThuc, 0, 23, 59, 59);
        dateRangeFilter = {
          range: {
            baoCao_createdAt: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString()
            }
          }
        };
        loaiKyFilter = LoaiKyBaoCao.HANG_QUY;
      } else if (nam && !thang && !quy) {
        // Chỉ filter theo năm
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        dateRangeFilter = {
          range: {
            baoCao_createdAt: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString()
            }
          }
        };
        loaiKyFilter = LoaiKyBaoCao.HANG_NAM;
      }

      // Thêm loại kỳ vào filter
      if (loaiKyFilter) {
        filters['thoiGian_loaiKy'] = loaiKyFilter;
      }
    }

    // Search fields for Elasticsearch
    // Dùng .keyword cho exact/prefix match, text field cho full-text search
    const searchFields = [
      'baoCao_tenBaoCao^2',           // Boost x2 cho tên báo cáo
      'baoCao_tenBaoCao.keyword^3',   // Boost x3 cho exact match
      'baoCao_noiDung',
      'baoCao_ghiChu',
      'organization_name^2',           // Boost x2 cho tên tổ chức
      'organization_name.keyword^3'    // Boost x3 cho exact match
    ];

    // Build search query
    let searchQuery = search || '';
    if (tenBaoCao) {
      searchQuery = searchQuery ? `${searchQuery} ${tenBaoCao}` : tenBaoCao;
    }

    // Nếu có date filter, cần custom query với Elasticsearch trực tiếp
    if (dateRangeFilter) {
      return await this.searchWithDateFilter(
        searchQuery,
        searchFields,
        filters,
        dateRangeFilter,
        page,
        limit
      );
    }

    // Create Elasticsearch DTO - pagination bình thường (không có date filter)
    const elasticDto: ElasticSearchDto = {
      search: searchQuery || undefined,
      page,
      limit,
      filters,
      sortField: 'baoCao_createdAt',
      sortOrder: 'desc'
    };

    // Get data from Elasticsearch
    const result = await this.elasticService.searchElasticTable(
      ELASTIC_INDEX.BAO_CAO,
      elasticDto,
      searchFields,
      'baoCao_createdAt',
      'desc'
    );

    return {
      data: result.data,
      meta: result.meta
    };
  }

  /**
   * Search với date range filter (tháng/quý/năm)
   */
  private async searchWithDateFilter(
    searchQuery: string,
    searchFields: string[],
    filters: Record<string, any>,
    dateRangeFilter: any,
    page: number,
    limit: number
  ) {
    const from = (page - 1) * limit;
    const mustQuery: any[] = [];

    // Search text
    if (searchQuery) {
      mustQuery.push({
        multi_match: {
          query: searchQuery,
          fields: searchFields,
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Apply filters
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (Array.isArray(filters[key])) {
            mustQuery.push({ terms: { [key]: filters[key] } });
          } else {
            mustQuery.push({ term: { [key]: filters[key] } });
          }
        }
      });
    }

    // Add date range filter
    mustQuery.push(dateRangeFilter);

    try {
      const result = await this.elasticService['elasticsearchService'].search({
        index: ELASTIC_INDEX.BAO_CAO,
        from,
        size: limit,
        track_total_hits: true,
        query: {
          bool: {
            must: mustQuery.length > 0 ? mustQuery : [{ match_all: {} }],
          },
        },
        sort: [
          {
            baoCao_createdAt: {
              order: 'desc',
            },
          },
        ],
      });

      const data = result.hits.hits.map((hit) => ({
        _id: hit._id,
        ...(hit._source as Record<string, any>),
      }));

      const total = typeof result.hits.total === 'object' ? result.hits.total.value : result.hits.total;

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error searching with date filter:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }
  }

  /**
   * Get báo cáo list for public access or users not in database
   * Used for Zalo users who might not have database records yet
   */
  async getPublicBaoCaoList(queryDto: ListBaoCaoDoanSoTheoKyDto) {
    const { page = 1, limit = 10, search, tenBaoCao, trangThaiPheDuyet, organizationId, thoiGianCapNhatDoanSoId } = queryDto;

    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('baoCao')
      .leftJoin('ThoiGianCapNhatDoanSo', 'thoiGian', 'baoCao.thoiGianCapNhatDoanSoId = thoiGian.id')
      .leftJoin('user', 'nbc', 'baoCao.nguoiBaoCaoId = nbc.id')
      .leftJoin('organization', 'org', 'baoCao.organizationId = org.id')
      .select([
        'baoCao.id',
        'baoCao.tenBaoCao',
        'baoCao.thoiGianCapNhatDoanSoId',
        'baoCao.nguoiBaoCaoId',
        'baoCao.organizationId',
        'baoCao.xaPhuongId',
        'baoCao.cumKhuCnId',
        'baoCao.soLuongDoanVienNam',
        'baoCao.soLuongDoanVienNu',
        'baoCao.soLuongCNVCLDNam',
        'baoCao.soLuongCNVCLDNu',
        'baoCao.tongSoCongDoan',
        'baoCao.tongSoCnvcld',
        'baoCao.noiDung',
        'baoCao.trangThaiPheDuyet',
        'baoCao.ghiChu',
        'baoCao.createdAt',
        'baoCao.updatedAt',
        'thoiGian.id AS thoiGian_id',
        'thoiGian.ten AS thoiGian_ten',
        'thoiGian.thoiGianBatDau AS thoiGian_thoiGianBatDau',
        'thoiGian.thoiGianKetThuc AS thoiGian_thoiGianKetThuc',
        'thoiGian.moTa AS thoiGian_moTa',
        'thoiGian.loaiKy',
        'nbc.id AS nguoiBaoCao_id',
        'nbc.fullName AS nguoiBaoCao_fullName',
        'nbc.email AS nguoiBaoCao_email',
        'org.id AS organization_id',
        'org.name AS organization_name'
      ]);

    // Tìm kiếm tổng quát
    if (search) {
      queryBuilder.andWhere(
        '(baoCao.tenBaoCao LIKE :search OR baoCao.noiDung LIKE :search OR baoCao.ghiChu LIKE :search OR org.name LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (tenBaoCao) {
      queryBuilder.andWhere('baoCao.tenBaoCao LIKE :tenBaoCao', { tenBaoCao: `%${tenBaoCao}%` });
    }

    if (trangThaiPheDuyet) {
      queryBuilder.andWhere('baoCao.trangThaiPheDuyet = :trangThaiPheDuyet', { trangThaiPheDuyet });
    }

    if (organizationId) {
      queryBuilder.andWhere('baoCao.organizationId = :organizationId', { organizationId });
    }

    if (thoiGianCapNhatDoanSoId) {
      queryBuilder.andWhere('baoCao.thoiGianCapNhatDoanSoId = :thoiGianCapNhatDoanSoId', { thoiGianCapNhatDoanSoId });
    }

    // For public access, only show approved reports
    queryBuilder.andWhere('baoCao.trangThaiPheDuyet = :approvedStatus', { approvedStatus: TrangThaiPheDuyet.DA_PHE_DUYET });

    queryBuilder.orderBy('baoCao.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const rawData = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();
    const totalPages = Math.ceil(total / (limit || 10));

    console.log('[PUBLIC BAO CAO ACCESS] Report list:', rawData.length);
    return { rawData, total, page, limit, totalPages, accessType: 'public' };
  }

  /**
   * 🔔 Gửi thông báo cho người phê duyệt khi có báo cáo mới
   */
  private async sendNotificationToApprover(
    baoCao: BaoCaoDoanSoTheoKy,
    nguoiPheDuyetId: string,
    thoiGianCapNhat: any,
    organization: any
  ): Promise<void> {
    try {
      // 1. Tạo thông báo hệ thống
      const noiDungThongBao = `🔔 BÁO CÁO ĐOÀN SỐ CẦN PHÊ DUYỆT

📋 Tên báo cáo: ${baoCao.tenBaoCao}
🏢 Tổ chức: ${organization?.name}
📅 Kỳ báo cáo: ${thoiGianCapNhat.ten}
⏰ Thời gian nộp: ${baoCao.createdAt?.toLocaleString('vi-VN')}

📊 Số liệu báo cáo:
• Đoàn viên nam: ${baoCao.soLuongDoanVienNam}
• Đoàn viên nữ: ${baoCao.soLuongDoanVienNu}  
• CNVCLĐ nam: ${baoCao.soLuongCNVCLDNam}
• CNVCLĐ nữ: ${baoCao.soLuongCNVCLDNu}

Vui lòng xem xét và phê duyệt báo cáo.`;

      await this.thongBaoService.createForSpecificUser('system', {
        noiDungThongBao,
        ghiChu: 'Thông báo phê duyệt báo cáo đoàn số'
      }, nguoiPheDuyetId);

      // 2. Gửi thông báo Zalo (nếu có Zalo account)
      const zaloUser = await this.zaloAccountRepository.findOne({
        where: { userId: nguoiPheDuyetId }
      });

      if (zaloUser) {
        const zaloMessage = `🔔 BÁO CÁO ĐOÀN SỐ CẦN PHÊ DUYỆT

📋 ${baoCao.tenBaoCao}
🏢 ${organization.name}
📅 Kỳ: ${thoiGianCapNhat.ten}

Vui lòng truy cập hệ thống để phê duyệt báo cáo.`;

        await this.zaloPushService.sendOAMessage(zaloUser.zaloOaUserId, zaloMessage);
      }

      console.log(`✅ Đã gửi thông báo phê duyệt cho user: ${nguoiPheDuyetId}`);
    } catch (error) {
      console.error(`❌ Lỗi gửi thông báo cho người phê duyệt:`, error);
    }
  }

  /**
   * 🔔 Gửi thông báo kết quả phê duyệt cho người tạo báo cáo
   */
  private async sendApprovalNotificationToCreator(
    baoCao: BaoCaoDoanSoTheoKy,
    trangThaiPheDuyet: TrangThaiPheDuyet,
    ghiChu: string,
    organization: any,
    cumKhuCn: any,
    xaPhuong: any,
    nguoiTaoBaoCao: any,
    nguoiPheDuyet: string
  ): Promise<void> {
    try {
      const isApproved = trangThaiPheDuyet === TrangThaiPheDuyet.DA_PHE_DUYET;
      const statusIcon = isApproved ? '✅' : '❌';
      const statusText = isApproved ? 'ĐÃ ĐƯỢC PHÊ DUYỆT' : 'ĐÃ BỊ TỪ CHỐI';

      // 1. Tạo thông báo hệ thống
      let noiDungThongBao = `${statusIcon} BÁO CÁO ĐOÀN SỐ ${statusText}`
      if (isApproved) {
        noiDungThongBao += `\n\n🎉 Chúc mừng! Báo cáo của bạn đã được phê duyệt thành công. \n\nSố liệu trong báo cáo đã được cập nhật vào hệ thống và có hiệu lực từ hôm nay.`;
      } else {
        noiDungThongBao += `\n\n📝 Vui lòng xem xét ghi chú và nộp lại báo cáo nếu cần thiết.`;
      }
      noiDungThongBao += `📋 Tên báo cáo: ${baoCao.tenBaoCao}
🏢 Tổ chức: ${organization?.name || cumKhuCn?.ten || xaPhuong?.ten}
⏰ Thời gian phê duyệt: ${new Date().toLocaleString('vi-VN')}
👤 Người phê duyệt: ${nguoiTaoBaoCao?.fullName || 'N/A'}`;

      if (ghiChu) {
        noiDungThongBao += `\n\n💬 Ghi chú: ${ghiChu}`;
      }

      // Kiểm tra user tồn tại trước khi gửi thông báo
      if (nguoiTaoBaoCao && nguoiTaoBaoCao.id) {
        try {
          await this.thongBaoService.createForSpecificUser('system', {
            noiDungThongBao,
            ghiChu: `Kết quả phê duyệt báo cáo: ${statusText}`
          }, baoCao.nguoiBaoCaoId);

        } catch (notificationError) {
          console.error(`❌ Lỗi gửi thông báo hệ thống cho user ${baoCao.nguoiBaoCaoId}:`, notificationError.message);
        }
      } else {
        console.warn(`⚠️ Không tìm thấy người tạo báo cáo với ID: ${baoCao.nguoiBaoCaoId}. Bỏ qua gửi thông báo hệ thống.`);
      }

      // 2. Gửi thông báo Zalo (sử dụng service có sẵn)
      await this.sendApprovalNotification(baoCao, trangThaiPheDuyet, ghiChu, organization, cumKhuCn, xaPhuong, nguoiTaoBaoCao, nguoiPheDuyet);

    } catch (error) {
      console.error(`❌ Lỗi gửi thông báo kết quả phê duyệt:`, error);
    }
  }

  // ===================== TRACKING METHODS =====================

  /**
   * Lấy danh sách tất cả CĐCS và trạng thái báo cáo trong một kỳ
   * OPTIMIZED: Dùng SQL để tính toán trực tiếp, không loop
   */
  async getOrganizationBaoCaoStatus(
    userId: string,
    query: any
  ): Promise<any> {
    const {
      thoiGianCapNhatDoanSoId,
      trangThaiBaoCao,
      cumKhuCnId,
      xaPhuongId,
      search,
      thang,
      quy,
      nam,
      page = 1,
      limit = 10
    } = query;

    // Convert to numbers to ensure pagination works correctly
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    console.log('🔢 Pagination params:', { page, limit, pageNum, limitNum, type: typeof page });

    // Kiểm tra kỳ báo cáo có tồn tại không
    const thoiGianCapNhat = await this.thoiGianCapNhatDoanSoRepository.findOne({
      where: { id: thoiGianCapNhatDoanSoId }
    });

    if (!thoiGianCapNhat) {
      throw new NotFoundException('Không tìm thấy kỳ báo cáo');
    }

    // Lấy thông tin user để phân quyền
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    const role = await this.roleRepository.findOne({ where: { id: user.roleId } });
    let isAdmin = false;
    if (['ADMIN', 'QT', 'LD', 'CV'].includes(role.description)) {
      isAdmin = true;
    }

    // Debug: Kiểm tra tổng số organizations
    const totalOrgs = await this.organizationRepository.count();

    // Xác định thời hạn nộp dựa trên loại kỳ báo cáo VÀ BỘ LỌC
    let thoiHanNop: Date;
    const now = new Date();

    if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.DOT_XUAT) {
      // Báo cáo đột xuất: dùng thoiGianKetThuc
      thoiHanNop = new Date(thoiGianCapNhat.thoiGianKetThuc);
    } else {
      // Báo cáo định kỳ: tính thời hạn nộp từ ngayKetThucTrongThang
      const ngayKetThuc = thoiGianCapNhat.ngayKetThucTrongThang || 5;

      // Xác định tháng cần tính deadline THEO BỘ LỌC
      let namCanTinh: number;
      let thangCanTinh: number;

      if (thang && nam) {
        // Lọc theo tháng cụ thể → deadline = ngày X của tháng đó
        namCanTinh = nam;
        thangCanTinh = thang;
      } else if (quy && nam) {
        // Lọc theo quý → deadline = ngày X của tháng cuối quý
        namCanTinh = nam;
        thangCanTinh = quy * 3; // Tháng cuối của quý (3, 6, 9, 12)
      } else if (nam && !thang && !quy) {
        // Lọc theo năm → deadline = ngày X của tháng 12
        namCanTinh = nam;
        thangCanTinh = 12;
      } else {
        // Không có filter → dùng tháng hiện tại
        namCanTinh = now.getFullYear();
        thangCanTinh = now.getMonth() + 1;
      }

      thoiHanNop = new Date(namCanTinh, thangCanTinh - 1, ngayKetThuc, 23, 59, 59);
    }

    // Format date cho MySQL
    const thoiHanNopStr = thoiHanNop.toISOString().slice(0, 19).replace('T', ' ');

    // Query tối ưu: LEFT JOIN báo cáo và tính trạng thái trong SQL
    const orgQuery = this.organizationRepository
      .createQueryBuilder('org')
      .leftJoin('CumKhuCongNghiep', 'cumKhu', 'cumKhu.id = org.cumKhuCnId')
      .leftJoin('XaPhuong', 'xaPhuong', 'xaPhuong.id = org.xaPhuongId')
      .leftJoin(
        'bao_cao_doan_so_theo_ky',
        'bc',
        'bc.organizationId = org.id AND bc.thoiGianCapNhatDoanSoId = :thoiGianCapNhatDoanSoId',
        { thoiGianCapNhatDoanSoId }
      )
      .leftJoin('user', 'u', 'u.id = bc.nguoiBaoCaoId')
      .leftJoin('user', 'u2', 'u2.id = bc.nguoiPheDuyetId')
      .leftJoin('ThoiGianCapNhatDoanSo', 'tgcn', 'tgcn.id = bc.thoiGianCapNhatDoanSoId')
      .select([
        'org.id AS organizationId',
        'org.name AS organizationName',
        'org.diaChi AS diaChi',
        'cumKhu.ten AS cumKhuCongNghiepName',
        'xaPhuong.ten AS xaPhuongName',
        'bc.id AS baoCaoId',
        'bc.tenBaoCao AS tenBaoCao',
        'bc.createdAt AS ngayNop',
        'bc.trangThaiPheDuyet AS trangThaiPheDuyet',
        'bc.ngayPheDuyet AS ngayPheDuyet',
        'bc.soLuongDoanVienNam AS soLuongDoanVienNam',
        'bc.soLuongDoanVienNu AS soLuongDoanVienNu',
        'bc.tongSoCongDoan AS tongSoCongDoan',
        'bc.tongSoCnvcld AS tongSoCnvcld',
        'bc.noiDung as noiDung',
        'u.id AS nguoiBaoCao_id',
        'u.fullName AS nguoiBaoCao_fullName',
        'u.email AS nguoiBaoCao_email',
        'u.phoneNumber AS nguoiBaoCao_phoneNumber',
        'u2.id AS nguoiDuyet_id',
        'u2.fullName AS nguoiDuyet_fullName',
        'u2.email AS nguoiDuyet_email',
        'u2.phoneNumber AS nguoiDuyet_phoneNumber'
      ])

    // ⭐ Nếu là kỳ đột xuất và có chỉ định cụ thể các CĐCS → chỉ lấy các CĐCS được chỉ định
    if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.DOT_XUAT && thoiGianCapNhat.organizationId) {
      const organizationIds = thoiGianCapNhat.organizationId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (organizationIds.length > 0) {
        orgQuery.andWhere('org.id IN (:...organizationIds)', { organizationIds });
      }
    }

    // Áp dụng phân quyền
    if (!isAdmin) {
      if (user.xaPhuongId) {
        orgQuery.andWhere('org.xaPhuongId = :userXaPhuongId', { userXaPhuongId: user.xaPhuongId });
      } else if (user.cumKhuCnId) {
        orgQuery.andWhere('org.cumKhuCnId = :userCumKhuCnId', { userCumKhuCnId: user.cumKhuCnId });
      } else if (user.organizationId) {
        orgQuery.andWhere('org.id = :userOrganizationId', { userOrganizationId: user.organizationId });
      }
    }

    // Áp dụng filter từ query params
    if (cumKhuCnId) {
      orgQuery.andWhere('org.cumKhuCnId = :filterCumKhu', { filterCumKhu: cumKhuCnId });
    }
    if (xaPhuongId) {
      orgQuery.andWhere('org.xaPhuongId = :filterXaPhuong', { filterXaPhuong: xaPhuongId });
    }
    if (search) {
      orgQuery.andWhere('org.name LIKE :search', { search: `%${search}%` });
    }

    // Filter theo thời gian (tháng, quý, năm) kèm theo loại kỳ
    // CHÚ Ý: Dùng OR bc.id IS NULL để giữ lại các CĐCS chưa báo cáo
    if (nam) {
      orgQuery.andWhere('(YEAR(bc.createdAt) = :nam OR bc.id IS NULL)', { nam });
      if (!thang && !quy) {
        orgQuery.andWhere('(tgcn.loaiKy = :loaiKyNam OR bc.id IS NULL)', { loaiKyNam: LoaiKyBaoCao.HANG_NAM });
      }
    }

    if (thang) {
      orgQuery.andWhere('(MONTH(bc.createdAt) = :thang OR bc.id IS NULL)', { thang });
      orgQuery.andWhere('(tgcn.loaiKy = :loaiKyThang OR bc.id IS NULL)', { loaiKyThang: LoaiKyBaoCao.HANG_THANG });
    }

    if (quy) {
      const thangBatDau = (quy - 1) * 3 + 1;
      const thangKetThuc = quy * 3;
      orgQuery.andWhere('(MONTH(bc.createdAt) BETWEEN :thangBatDau AND :thangKetThuc OR bc.id IS NULL)', {
        thangBatDau,
        thangKetThuc
      });
      orgQuery.andWhere('(tgcn.loaiKy = :loaiKyQuy OR bc.id IS NULL)', { loaiKyQuy: LoaiKyBaoCao.HANG_QUY });
    }

    // Filter theo trạng thái báo cáo
    if (trangThaiBaoCao) {
      if (trangThaiBaoCao === 'chua_bao_cao') {
        // Chưa báo cáo: chỉ lấy CĐCS chưa có báo cáo
        orgQuery.andWhere('bc.id IS NULL');
      } else if (trangThaiBaoCao === 'da_bao_cao') {
        // Đã báo cáo: bc.id IS NOT NULL
        orgQuery.andWhere('bc.id IS NOT NULL');
      } else if (trangThaiBaoCao === 'dung_han') {
        // Đúng hạn: bc.id IS NOT NULL AND bc.createdAt <= deadline
        orgQuery.andWhere('bc.id IS NOT NULL');
        orgQuery.andWhere(`bc.createdAt <= '${thoiHanNopStr}'`);
      } else if (trangThaiBaoCao === 'qua_han') {
        // Quá hạn: (bc.id IS NULL AND NOW() > deadline) OR (bc.id IS NOT NULL AND bc.createdAt > deadline)
        orgQuery.andWhere(
          `(bc.id IS NULL AND NOW() > '${thoiHanNopStr}') OR (bc.id IS NOT NULL AND bc.createdAt > '${thoiHanNopStr}')`
        );
      }
    }

    // IMPORTANT: Clone query for counting to avoid interference with pagination
    // When using getRawMany() with custom SELECT, we need to count before applying skip/take
    const countQuery = orgQuery.clone();
    const total = await countQuery.getCount();

    // Apply pagination with offset and limit
    const skipCount = (pageNum - 1) * limitNum;
    console.log('🔢 Skip:', skipCount, 'Take:', limitNum);

    // For raw queries, use offset and limit instead of skip/take
    const danhSachChiTiet = await orgQuery
      .offset(skipCount)
      .limit(limitNum)
      .getRawMany();

    console.log('📊 Số lượng organizations tìm được (page):', danhSachChiTiet.length);
    if (danhSachChiTiet.length > 0) {
      console.log('📋 Sample data (first 3):', danhSachChiTiet.slice(0, 3));
    }

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum);


    return {
      thoiGianCapNhatDoanSoId,
      tenKyBaoCao: thoiGianCapNhat.ten,
      thoiGianBatDau: thoiGianCapNhat.thoiGianBatDau,
      thoiGianKetThuc: thoiGianCapNhat.thoiGianKetThuc,
      // tongSoCDCS,
      // soDaBaoCao,
      // soChuaBaoCao,
      // soDungHan,
      // soQuaHan,
      // tyLeDaBaoCao,
      danhSachChiTiet: danhSachChiTiet,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages
    };
  }

  /**
   * Thống kê tổng quan về trạng thái báo cáo trong một kỳ
   * API riêng không có phân trang, chỉ trả về số liệu thống kê
   */
  async getThongKeBaoCaoTheoKy(
    userId: string,
    thoiGianCapNhatDoanSoId: number,
    cumKhuCnId?: number,
    xaPhuongId?: number,
    thang?: number,
    quy?: number,
    nam?: number
  ): Promise<any> {
    // Kiểm tra kỳ báo cáo có tồn tại không
    const thoiGianCapNhat = await this.thoiGianCapNhatDoanSoRepository.findOne({
      where: { id: thoiGianCapNhatDoanSoId }
    });

    if (!thoiGianCapNhat) {
      throw new NotFoundException('Không tìm thấy kỳ báo cáo');
    }

    // Lấy thông tin user để phân quyền
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    const role = await this.roleRepository.findOne({ where: { id: user.roleId } });
    let isAdmin = false;
    if (['ADMIN', 'QT', 'LD', 'CV'].includes(role.description)) {
      isAdmin = true;
    }

    // ========== BƯỚC 1: Tính thời hạn nộp dựa trên loại kỳ và bộ lọc ==========
    let thoiHanNop: Date;
    const now = new Date();

    if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.DOT_XUAT) {
      // Báo cáo đột xuất: dùng thoiGianKetThuc
      thoiHanNop = new Date(thoiGianCapNhat.thoiGianKetThuc);
    } else {
      // Báo cáo định kỳ: tính thời hạn nộp từ ngayKetThucTrongThang
      const ngayKetThuc = thoiGianCapNhat.ngayKetThucTrongThang || 5;

      // Xác định tháng cần tính deadline
      let namCanTinh: number;
      let thangCanTinh: number;

      if (thang && nam) {
        // Lọc theo tháng cụ thể → deadline = ngày X của tháng đó
        namCanTinh = nam;
        thangCanTinh = thang;
      } else if (quy && nam) {
        // Lọc theo quý → deadline = ngày X của tháng cuối quý
        namCanTinh = nam;
        thangCanTinh = quy * 3; // Tháng cuối của quý (3, 6, 9, 12)
      } else if (nam && !thang && !quy) {
        // Lọc theo năm → deadline = ngày X của tháng 12
        namCanTinh = nam;
        thangCanTinh = 12;
      } else {
        // Không có filter → dùng tháng hiện tại
        namCanTinh = now.getFullYear();
        thangCanTinh = now.getMonth() + 1;
      }

      thoiHanNop = new Date(namCanTinh, thangCanTinh - 1, ngayKetThuc, 23, 59, 59);
    }

    const thoiHanNopStr = thoiHanNop.toISOString().slice(0, 19).replace('T', ' ');

    // ========== BƯỚC 2: Query tổng số CĐCS (KHÔNG lọc theo báo cáo) ==========
    const totalOrgQuery = this.organizationRepository
      .createQueryBuilder('org');

    // ⭐ Nếu là kỳ đột xuất và có chỉ định cụ thể các CĐCS → chỉ lấy các CĐCS được chỉ định
    if (thoiGianCapNhat.loaiKy === LoaiKyBaoCao.DOT_XUAT && thoiGianCapNhat.organizationId) {
      const organizationIds = thoiGianCapNhat.organizationId.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (organizationIds.length > 0) {
        totalOrgQuery.andWhere('org.id IN (:...organizationIds)', { organizationIds });
      }
    }

    // Áp dụng phân quyền
    if (!isAdmin) {
      if (user.xaPhuongId && user.xaPhuongId !== 0) {
        totalOrgQuery.andWhere('org.xaPhuongId = :userXaPhuongId', { userXaPhuongId: user.xaPhuongId });
      } else if (user.cumKhuCnId && user.cumKhuCnId !== 0) {
        totalOrgQuery.andWhere('org.cumKhuCnId = :userCumKhuId', { userCumKhuId: user.cumKhuCnId });
      } else if (user.organizationId && user.organizationId !== 0) {
        totalOrgQuery.andWhere('org.id = :userOrgId', { userOrgId: user.organizationId });
      }
    }

    // Áp dụng filter theo cumKhuCnId hoặc xaPhuongId
    if (cumKhuCnId) {
      totalOrgQuery.andWhere('org.cumKhuCnId = :cumKhuCnId', { cumKhuCnId });
    }

    if (xaPhuongId) {
      totalOrgQuery.andWhere('org.xaPhuongId = :xaPhuongId', { xaPhuongId });
    }

    const tongSoCDCS = await totalOrgQuery.getCount();

    // ========== BƯỚC 3: Query các báo cáo đã nộp trong kỳ ==========
    const baoCaoQuery = this.baoCaoDoanSoTheoKyRepository
      .createQueryBuilder('bc')
      .leftJoin('ThoiGianCapNhatDoanSo', 'tgcn', 'tgcn.id = bc.thoiGianCapNhatDoanSoId')
      .leftJoin('organization', 'org', 'org.id = bc.organizationId')
      .where('bc.thoiGianCapNhatDoanSoId = :thoiGianCapNhatDoanSoId', { thoiGianCapNhatDoanSoId })
      .select([
        'bc.id AS baoCaoId',
        'bc.organizationId AS organizationId',
        'bc.createdAt AS ngayNop'
      ]);

    // Áp dụng phân quyền cho báo cáo
    if (!isAdmin) {
      if (user.xaPhuongId && user.xaPhuongId !== 0) {
        baoCaoQuery.andWhere('org.xaPhuongId = :userXaPhuongId2', { userXaPhuongId2: user.xaPhuongId });
      } else if (user.cumKhuCnId && user.cumKhuCnId !== 0) {
        baoCaoQuery.andWhere('org.cumKhuCnId = :userCumKhuId2', { userCumKhuId2: user.cumKhuCnId });
      } else if (user.organizationId && user.organizationId !== 0) {
        baoCaoQuery.andWhere('org.id = :userOrgId2', { userOrgId2: user.organizationId });
      }
    }

    // Áp dụng filter theo cumKhuCnId hoặc xaPhuongId
    if (cumKhuCnId) {
      baoCaoQuery.andWhere('org.cumKhuCnId = :cumKhuCnId2', { cumKhuCnId2: cumKhuCnId });
    }

    if (xaPhuongId) {
      baoCaoQuery.andWhere('org.xaPhuongId = :xaPhuongId2', { xaPhuongId2: xaPhuongId });
    }

    // Áp dụng filter theo thời gian kèm theo loại kỳ
    if (nam) {
      baoCaoQuery.andWhere('YEAR(bc.createdAt) = :nam', { nam });
      if (!thang && !quy) {
        baoCaoQuery.andWhere('tgcn.loaiKy = :loaiKyNam', { loaiKyNam: LoaiKyBaoCao.HANG_NAM });
      }
    }

    if (thang) {
      baoCaoQuery.andWhere('MONTH(bc.createdAt) = :thang', { thang });
      baoCaoQuery.andWhere('tgcn.loaiKy = :loaiKyThang', { loaiKyThang: LoaiKyBaoCao.HANG_THANG });
    }

    if (quy) {
      const thangBatDau = (quy - 1) * 3 + 1;
      const thangKetThuc = quy * 3;
      baoCaoQuery.andWhere('MONTH(bc.createdAt) BETWEEN :thangBatDau AND :thangKetThuc', {
        thangBatDau,
        thangKetThuc
      });
      baoCaoQuery.andWhere('tgcn.loaiKy = :loaiKyQuy', { loaiKyQuy: LoaiKyBaoCao.HANG_QUY });
    }

    const baoCaoList = await baoCaoQuery.getRawMany();

    // ========== BƯỚC 4: Tính thống kê ==========
    const soDaBaoCao = baoCaoList.length;
    const soChuaBaoCao = tongSoCDCS - soDaBaoCao;

    // Tính số báo cáo đúng hạn và quá hạn
    let soDungHan = 0;
    let soQuaHan = 0;

    // Tính quá hạn cho các báo cáo đã nộp
    baoCaoList.forEach(baoCao => {
      const ngayNop = new Date(baoCao.ngayNop);
      if (ngayNop <= thoiHanNop) {
        soDungHan++;
      } else {
        soQuaHan++;
      }
    });

    // ⭐ QUAN TRỌNG: Tính quá hạn cho các CĐCS chưa nộp báo cáo
    // Nếu hiện tại đã quá thời hạn nộp → tất cả CĐCS chưa nộp đều bị quá hạn
    if (now > thoiHanNop) {
      soQuaHan += soChuaBaoCao;
    }

    const tyLeDaBaoCao = tongSoCDCS > 0 ? Math.round((soDaBaoCao / tongSoCDCS) * 100) : 0;

    return {
      thoiGianCapNhatDoanSoId,
      tenKyBaoCao: thoiGianCapNhat.ten,
      thoiGianBatDau: thoiGianCapNhat.thoiGianBatDau,
      thoiGianKetThuc: thoiGianCapNhat.thoiGianKetThuc,
      thoiHanNop: thoiHanNop,
      tongSoCDCS,
      soDaBaoCao,
      soChuaBaoCao,
      soDungHan,
      soQuaHan,
      tyLeDaBaoCao
    };
  }

  // ===================== AUTO FIND PERIOD HELPER =====================

  /**
   * Tìm kỳ báo cáo phù hợp với loaiKy và thời gian hiện tại
   */
  private async timKyBaoCaoPhuHop(loaiKy: string): Promise<any> {
    const now = new Date();
    const namHienTai = now.getFullYear();
    const thangHienTai = now.getMonth() + 1; // 1-12
    const ngayHienTai = now.getDate();

    // Tìm tất cả các kỳ đang active với loaiKy tương ứng
    const cacKyBaoCao = await this.thoiGianCapNhatDoanSoRepository.find({
      where: {
        loaiKy: loaiKy as any,
        isActive: true
      }
    });

    if (cacKyBaoCao.length === 0) {
      return null;
    }

    // Lọc các kỳ đang trong thời gian áp dụng
    for (const ky of cacKyBaoCao) {
      // Kiểm tra năm có trong khoảng áp dụng không
      if (ky.namBatDau && namHienTai < ky.namBatDau) continue;
      if (ky.namKetThuc && namHienTai > ky.namKetThuc) continue;

      // Kiểm tra theo loại kỳ
      let trongThoiGian = false;

      switch (loaiKy) {
        case 'hang_thang':
          // Kiểm tra ngày hiện tại có trong khoảng ngayBatDauTrongThang - ngayKetThucTrongThang
          if (ngayHienTai >= ky.ngayBatDauTrongThang && ngayHienTai <= ky.ngayKetThucTrongThang) {
            trongThoiGian = true;
          }
          break;

        case 'hang_quy':
          // Kiểm tra tháng hiện tại có trong cacThangApDung và ngày trong khoảng
          if (ky.cacThangApDung && Array.isArray(ky.cacThangApDung)) {
            const coTrongThang = ky.cacThangApDung.includes(thangHienTai);
            if (coTrongThang && ngayHienTai >= ky.ngayBatDauTrongThang && ngayHienTai <= ky.ngayKetThucTrongThang) {
              trongThoiGian = true;
            }
          }
          break;

        case 'hang_nam':
          // Kiểm tra tháng và ngày hiện tại có khớp không
          if (thangHienTai === ky.thangBatDau &&
            ngayHienTai >= ky.ngayBatDauTrongThang &&
            ngayHienTai <= ky.ngayKetThucTrongThang) {
            trongThoiGian = true;
          }
          break;

        case 'dot_xuat':
          // Kiểm tra thời gian cụ thể
          if (ky.thoiGianBatDau && ky.thoiGianKetThuc) {
            if (now >= ky.thoiGianBatDau && now <= ky.thoiGianKetThuc) {
              trongThoiGian = true;
            }
          }
          break;
      }

      if (trongThoiGian) {
        return ky; // Trả về kỳ đầu tiên phù hợp
      }
    }

    return null; // Không tìm thấy kỳ phù hợp
  }

  /**
   * Lấy tên tiếng Việt của loại kỳ
   */
  private getTenLoaiKy(loaiKy: string): string {
    const mapping = {
      'hang_thang': 'Hàng tháng',
      'hang_quy': 'Hàng quý',
      'hang_nam': 'Hàng năm',
      'dot_xuat': 'Đột xuất'
    };
    return mapping[loaiKy] || loaiKy;
  }

  // ===================== ELASTICSEARCH SYNC METHODS =====================

  /**
   * Lấy dữ liệu báo cáo đầy đủ theo ID để sync vào Elasticsearch
   */
  private async getBaoCaoForElastic(baoCaoId: number) {
    const query = this.baoCaoDoanSoTheoKyRepository
      .createQueryBuilder('baoCao')
      .leftJoin('ThoiGianCapNhatDoanSo', 'thoiGian', 'baoCao.thoiGianCapNhatDoanSoId = thoiGian.id')
      .leftJoin('user', 'nguoiBaoCao', 'baoCao.nguoiBaoCaoId = nguoiBaoCao.id')
      .leftJoin('organization', 'organization', 'baoCao.organizationId = organization.id')
      .where('baoCao.id = :baoCaoId', { baoCaoId })
      .select([
        'baoCao.id AS baoCao_id',
        'baoCao.tenBaoCao AS baoCao_tenBaoCao',
        'baoCao.loaiBaoCao AS baoCao_loaiBaoCao',
        'baoCao.thoiGianCapNhatDoanSoId AS baoCao_thoiGianCapNhatDoanSoId',
        'baoCao.nguoiBaoCaoId AS baoCao_nguoiBaoCaoId',
        'baoCao.organizationId AS baoCao_organizationId',
        'baoCao.xaPhuongId AS baoCao_xaPhuongId',
        'baoCao.cumKhuCnId AS baoCao_cumKhuCnId',
        'baoCao.soLuongDoanVienNam AS baoCao_soLuongDoanVienNam',
        'baoCao.soLuongDoanVienNu AS baoCao_soLuongDoanVienNu',
        'baoCao.soLuongCNVCLDNam AS baoCao_soLuongCNVCLDNam',
        'baoCao.soLuongCNVCLDNu AS baoCao_soLuongCNVCLDNu',
        'baoCao.tongSoCongDoan AS baoCao_tongSoCongDoan',
        'baoCao.tongSoCnvcld AS baoCao_tongSoCnvcld',
        'baoCao.noiDung AS baoCao_noiDung',
        'baoCao.trangThaiPheDuyet AS baoCao_trangThaiPheDuyet',
        'baoCao.ghiChu AS baoCao_ghiChu',
        'baoCao.createdAt AS baoCao_createdAt',
        'baoCao.updatedAt AS baoCao_updatedAt',
        'thoiGian.loaiKy AS thoiGian_loaiKy',
        'thoiGian.id AS thoiGian_id',
        'thoiGian.ten AS thoiGian_ten',
        'thoiGian.thoiGianBatDau AS thoiGian_thoiGianBatDau',
        'thoiGian.thoiGianKetThuc AS thoiGian_thoiGianKetThuc',
        'thoiGian.moTa AS thoiGian_moTa',
        'nguoiBaoCao.id AS nguoiBaoCao_id',
        'nguoiBaoCao.fullName AS nguoiBaoCao_fullName',
        'nguoiBaoCao.email AS nguoiBaoCao_email',
        'organization.id AS organization_id',
        'organization.name AS organization_name',
      ]);

    try {
      const result = await query.getRawOne();
      return result;
    } catch (error) {
      console.error('Error getting bao cao for elastic:', error);
      return null;
    }
  }

  /**
   * Lấy dữ liệu báo cáo theo trang để sync vào Elasticsearch
   */
  async getDataPage(skip: number, take: number) {
    console.log('skip: ' + skip + ' take: ' + take);

    const query = this.baoCaoDoanSoTheoKyRepository
      .createQueryBuilder('baoCao')
      .leftJoin('ThoiGianCapNhatDoanSo', 'thoiGian', 'baoCao.thoiGianCapNhatDoanSoId = thoiGian.id')
      .leftJoin('user', 'nguoiBaoCao', 'baoCao.nguoiBaoCaoId = nguoiBaoCao.id')
      .leftJoin('organization', 'organization', 'baoCao.organizationId = organization.id')
      .select([
        'baoCao.id AS baoCao_id',
        'baoCao.tenBaoCao AS baoCao_tenBaoCao',
        'baoCao.thoiGianCapNhatDoanSoId AS baoCao_thoiGianCapNhatDoanSoId',
        'baoCao.nguoiBaoCaoId AS baoCao_nguoiBaoCaoId',
        'baoCao.organizationId AS baoCao_organizationId',
        'baoCao.xaPhuongId AS baoCao_xaPhuongId',
        'baoCao.cumKhuCnId AS baoCao_cumKhuCnId',
        'baoCao.soLuongDoanVienNam AS baoCao_soLuongDoanVienNam',
        'baoCao.soLuongDoanVienNu AS baoCao_soLuongDoanVienNu',
        'baoCao.soLuongCNVCLDNam AS baoCao_soLuongCNVCLDNam',
        'baoCao.soLuongCNVCLDNu AS baoCao_soLuongCNVCLDNu',
        'baoCao.tongSoCongDoan AS baoCao_tongSoCongDoan',
        'baoCao.tongSoCnvcld AS baoCao_tongSoCnvcld',
        'baoCao.noiDung AS baoCao_noiDung',
        'baoCao.loaiBaoCao AS baoCao_loaiBaoCao',
        'baoCao.trangThaiPheDuyet AS baoCao_trangThaiPheDuyet',
        'baoCao.ghiChu AS baoCao_ghiChu',
        'baoCao.createdAt AS baoCao_createdAt',
        'baoCao.updatedAt AS baoCao_updatedAt',
        'thoiGian.id AS thoiGian_id',
        'thoiGian.ten AS thoiGian_ten',
        'thoiGian.loaiKy AS thoiGian_loaiKy',
        'thoiGian.thoiGianBatDau AS thoiGian_thoiGianBatDau',
        'thoiGian.thoiGianKetThuc AS thoiGian_thoiGianKetThuc',
        'thoiGian.moTa AS thoiGian_moTa',
        'nguoiBaoCao.id AS nguoiBaoCao_id',
        'nguoiBaoCao.fullName AS nguoiBaoCao_fullName',
        'nguoiBaoCao.email AS nguoiBaoCao_email',
        'organization.id AS organization_id',
        'organization.name AS organization_name',
      ])
      .limit(take)
      .offset(skip);

    try {
      const result = await query.getRawMany();
      return result;
    } catch (error) {
      console.error('Error getting data page:', error);
      return [];
    }
  }

  /**
   * Đồng bộ tất cả báo cáo vào Elasticsearch
   */
  async syncBaoCao() {
    await this.elasticService.syncIncrementalToElastic<{ baoCao_id: number }>(
      ELASTIC_INDEX.BAO_CAO,
      this.getDataPage.bind(this),
      (item) => item.baoCao_id,
    );
  }

  /**
   * Xóa và tạo lại index Elasticsearch
   */
  async indicesBaoCao() {
    await this.elasticService.indicesIndex(ELASTIC_INDEX.BAO_CAO);
    console.log('Deleted Elasticsearch index for Bao Cao');
  }

  /**
   * Đặt max_result_window cho Elasticsearch
   */
  async setMaxBaoCao() {
    await this.elasticService.setMax(ELASTIC_INDEX.BAO_CAO);
  }

  /**
   * Tìm kiếm báo cáo qua Elasticsearch
   */
  async searchBaoCao(payload: ElasticSearchDto) {
    return await this.elasticService.searchElasticTable(
      ELASTIC_INDEX.BAO_CAO,
      payload,
      [
        'baoCao_tenBaoCao',
        'baoCao_noiDung',
        'baoCao_ghiChu',
        'thoiGian_ten',
        'thoiGian_moTa',
        'nguoiBaoCao_fullName',
        'nguoiBaoCao_email',
        'organization_name',
      ],
      'baoCao_id',
      'desc'
    );
  }
}

