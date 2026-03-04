import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CongTyChuaCoCD } from 'src/databases/entities/CongTyChuaCoCD.entity';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

import { CreateCongTyChuaCoCDDto } from './dto/create-cong-ty-chua-co-cd.dto';
import { ImportCongTyResultDto } from './dto/import-cong-ty.dto';
import { ListCongTyChuaCoCDDto } from './dto/list-cong-ty-chua-co-cd.dto';
import { UpdateCongTyChuaCoCDDto } from './dto/update-cong-ty-chua-co-cd.dto';

@Injectable()
export class CongTyChuaCoCDService {
  constructor(
    @InjectRepository(CongTyChuaCoCD)
    private readonly congTyRepository: Repository<CongTyChuaCoCD>,
    @InjectRepository(CumKhuCongNghiep)
    private readonly cumKhuRepository: Repository<CumKhuCongNghiep>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) { }

  async create(createDto: CreateCongTyChuaCoCDDto): Promise<CongTyChuaCoCD> {
    try {
      const existingCompany = await this.congTyRepository.findOne({
        where: { ten: createDto.ten }
      });

      if (existingCompany) {
        throw new BadRequestException('Tên công ty đã tồn tại');
      }

      if (createDto.cumKCNId) {
        const cumKhu = await this.cumKhuRepository.findOne({ where: { id: createDto.cumKCNId } });
        if (!cumKhu) {
          throw new NotFoundException('Cụm khu công nghiệp không tồn tại');
        }
      }

      const newRecord = this.congTyRepository.create(createDto);
      return await this.congTyRepository.save(newRecord);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListCongTyChuaCoCDDto): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search, cumKCNId } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.congTyRepository
        .createQueryBuilder('ct')
        .leftJoinAndSelect('ct.cumKhuCongNghiep', 'ckc')
        .orderBy('ct.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (search) {
        queryBuilder.andWhere(
          '(ct.ten LIKE :search OR ckc.ten LIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (cumKCNId) {
        queryBuilder.andWhere('ct.cumKCNId = :cumKCNId', { cumKCNId });
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      const mappedData = data.map(item => ({
        id: item.id,
        ten: item.ten,
        cumKCNId: item.cumKCNId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        cumKhuCongNghiepTen: item.cumKhuCongNghiep?.ten || null
      }));

      return {
        data: mappedData,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const record = await this.congTyRepository
        .createQueryBuilder('ct')
        .leftJoinAndSelect('ct.cumKhuCongNghiep', 'ckc')
        .where('ct.id = :id', { id })
        .getOne();

      if (!record) {
        throw new NotFoundException('Công ty không tồn tại');
      }

      return {
        id: record.id,
        ten: record.ten,
        cumKCNId: record.cumKCNId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        cumKhuCongNghiepTen: record.cumKhuCongNghiep?.ten || null
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateCongTyChuaCoCDDto): Promise<CongTyChuaCoCD> {
    try {
      const record = await this.congTyRepository.findOne({ where: { id } });

      if (!record) {
        throw new NotFoundException('Công ty không tồn tại');
      }

      if (updateDto.ten && updateDto.ten !== record.ten) {
        const existingRecord = await this.congTyRepository.findOne({
          where: { ten: updateDto.ten }
        });

        if (existingRecord) {
          throw new BadRequestException('Tên công ty đã tồn tại');
        }
      }

      if (updateDto.cumKCNId) {
        const cumKhu = await this.cumKhuRepository.findOne({ where: { id: updateDto.cumKCNId } });
        if (!cumKhu) {
          throw new NotFoundException('Cụm khu công nghiệp không tồn tại');
        }
      }

      await this.congTyRepository.update(id, updateDto);
      return await this.congTyRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const record = await this.congTyRepository.findOne({ where: { id } });

      if (!record) {
        throw new NotFoundException('Công ty không tồn tại');
      }

      await this.congTyRepository.remove(record);
      return { message: 'Xóa công ty thành công' };
    } catch (error) {
      throw error;
    }
  }

  async thongKeSoLuongTheoCumKhu(): Promise<any[]> {
    try {
      const result = await this.congTyRepository
        .createQueryBuilder('ct')
        .select('ct.cumKCNId', 'cumKCNId')
        .addSelect('ckc.ten', 'cumKhuCongNghiepTen')
        .addSelect('COUNT(ct.id)', 'soLuongCongTy')
        .leftJoin('cum_khu_cong_nghiep', 'ckc', 'ct.cumKCNId = ckc.id')
        .groupBy('ct.cumKCNId')
        .addGroupBy('ckc.ten')
        .orderBy('soLuongCongTy', 'DESC')
        .getRawMany();

      return result.map(item => ({
        cumKCNId: item.cumKCNId,
        cumKhuCongNghiepTen: item.cumKhuCongNghiepTen || 'Chưa phân loại',
        soLuongCongTy: parseInt(item.soLuongCongTy, 10)
      }));
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi thống kê!');
    }
  }

  async thongKeCongTyVaOrganization(): Promise<any[]> {
    try {
      // Lấy thống kê công ty theo cụm khu
      const congTyStats = await this.congTyRepository
        .createQueryBuilder('ct')
        .select('ct.cumKCNId', 'cumKCNId')
        .addSelect('COUNT(ct.id)', 'soLuongCongTy')
        .groupBy('ct.cumKCNId')
        .getRawMany();

      // Lấy thống kê organization theo cụm khu
      const orgStats = await this.organizationRepository
        .createQueryBuilder('org')
        .select('org.cumKhuCnId', 'cumKCNId')
        .addSelect('COUNT(org.id)', 'soLuongOrganization')
        .groupBy('org.cumKhuCnId')
        .getRawMany();

      // Lấy tất cả cụm khu công nghiệp
      const allCumKhu = await this.cumKhuRepository.find();

      // Tạo map để merge data
      const statsMap = new Map<number, any>();

      // Merge công ty stats
      congTyStats.forEach(item => {
        if (item.cumKCNId) {
          statsMap.set(item.cumKCNId, {
            cumKCNId: item.cumKCNId,
            soLuongCongTy: parseInt(item.soLuongCongTy, 10),
            soLuongOrganization: 0
          });
        }
      });

      // Merge organization stats
      orgStats.forEach(item => {
        if (item.cumKCNId) {
          if (statsMap.has(item.cumKCNId)) {
            statsMap.get(item.cumKCNId).soLuongOrganization = parseInt(item.soLuongOrganization, 10);
          } else {
            statsMap.set(item.cumKCNId, {
              cumKCNId: item.cumKCNId,
              soLuongCongTy: 0,
              soLuongOrganization: parseInt(item.soLuongOrganization, 10)
            });
          }
        }
      });

      // Thêm tên cụm khu công nghiệp và format kết quả
      const result = Array.from(statsMap.values()).map(item => {
        const cumKhu = allCumKhu.find(ck => ck.id === item.cumKCNId);
        return {
          cumKCNId: item.cumKCNId,
          cumKhuCongNghiepTen: cumKhu?.ten || 'Không xác định',
          soLuongCongTy: item.soLuongCongTy,
          soLuongOrganization: item.soLuongOrganization,
          tongSo: item.soLuongCongTy + item.soLuongOrganization
        };
      });

      // Sắp xếp theo tổng số giảm dần
      return result.sort((a, b) => b.tongSo - a.tongSo);
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi thống kê!');
    }
  }

  async getAll(): Promise<CongTyChuaCoCD[]> {
    try {
      return await this.congTyRepository.find({
        order: { ten: 'ASC' }
      });
    } catch (error) {
      throw error;
    }
  }

  async importFromExcel(file: Express.Multer.File): Promise<ImportCongTyResultDto> {
    const result: ImportCongTyResultDto = {
      successCount: 0,
      errorCount: 0,
      errors: {},
      createdIds: [],
      newCumKhuCount: 0,
      newCumKhuNames: []
    };

    try {
      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      // Cache cụm khu công nghiệp để tránh query nhiều lần
      const cumKhuCache = new Map<string, CumKhuCongNghiep>();

      // Lấy tất cả cụm khu công nghiệp hiện có
      const allCumKhu = await this.cumKhuRepository.find();
      allCumKhu.forEach(ck => cumKhuCache.set(ck.ten.toLowerCase().trim(), ck));

      // Duyệt qua từng sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const cumKhuCongNghiepTen = sheetName.trim();

        result.errors[sheetName] = {};

        // Tìm hoặc tạo mới cụm khu công nghiệp
        let cumKhuCongNghiep: CumKhuCongNghiep;
        const cumKhuKey = cumKhuCongNghiepTen.toLowerCase();

        if (cumKhuCache.has(cumKhuKey)) {
          cumKhuCongNghiep = cumKhuCache.get(cumKhuKey);
        } else {
          // Tạo mới cụm khu công nghiệp
          cumKhuCongNghiep = this.cumKhuRepository.create({
            ten: cumKhuCongNghiepTen,
            moTa: `Tự động tạo từ import file Excel`,
            diaChi: null
          });
          cumKhuCongNghiep = await this.cumKhuRepository.save(cumKhuCongNghiep);
          cumKhuCache.set(cumKhuKey, cumKhuCongNghiep);
          result.newCumKhuCount++;
          result.newCumKhuNames.push(cumKhuCongNghiepTen);
        }

        // Chuyển sheet thành array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Tìm row bắt đầu (row có STT = 1)
        let startRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const firstCell = jsonData[i][0];
          if (firstCell === 1 || firstCell === '1') {
            startRowIndex = i;
            break;
          }
        }

        if (startRowIndex === -1) {
          result.errors[sheetName][0] = [`Không tìm thấy dòng bắt đầu với STT = 1`];
          continue;
        }

        // Xử lý từng row
        for (let i = startRowIndex; i < jsonData.length; i++) {
          const row = jsonData[i];
          const stt = row[0];
          const tenCongTy = row[1];

          // Kết thúc khi cột STT không còn giá trị
          if (!stt || stt === '') {
            break;
          }

          const errors: string[] = [];
          const actualRowNumber = i + 1; // Row number trong Excel (1-indexed)

          try {
            // Validate tên công ty
            if (!tenCongTy || tenCongTy.toString().trim() === '') {
              errors.push('Tên công ty không được để trống');
            }

            if (errors.length > 0) {
              result.errorCount++;
              result.errors[sheetName][actualRowNumber] = errors;
              continue;
            }

            const tenCongTyTrimmed = tenCongTy.toString().trim();

            // Kiểm tra trùng lặp tên công ty
            const existingCompany = await this.congTyRepository.findOne({
              where: { ten: tenCongTyTrimmed }
            });

            if (existingCompany) {
              errors.push(`Công ty "${tenCongTyTrimmed}" đã tồn tại trong hệ thống`);
              result.errorCount++;
              result.errors[sheetName][actualRowNumber] = errors;
              continue;
            }

            // Tạo công ty mới
            const newCongTy = this.congTyRepository.create({
              ten: tenCongTyTrimmed,
              cumKCNId: cumKhuCongNghiep.id
            });

            const saved = await this.congTyRepository.save(newCongTy);
            result.successCount++;
            result.createdIds.push(saved.id);

          } catch (error) {
            result.errorCount++;
            const errorMessage = `Lỗi: ${error.message || 'Unknown error'}`;
            result.errors[sheetName][actualRowNumber] = [errorMessage];
          }
        }
      }

      // Xóa các sheet không có lỗi khỏi errors object
      Object.keys(result.errors).forEach(sheetName => {
        if (Object.keys(result.errors[sheetName]).length === 0) {
          delete result.errors[sheetName];
        }
      });

      return result;
    } catch (error) {
      console.error('Lỗi khi đọc file Excel:', error);
      throw new BadRequestException(`Không thể đọc file Excel: ${error.message}`);
    }
  }
}
