import { BadRequestException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like,Repository } from 'typeorm';
import * as XLSX from 'xlsx';

import { CumKhuCongNghiep } from '../../databases/entities/CumKhuCongNghiep.entity';
import {
  CreateCumKhuCongNghiepDto,
  ListCumKhuCongNghiepDto,
  UpdateCumKhuCongNghiepDto} from './dto/cum-khu-cong-nghiep.dto';

@Injectable()
export class CumKhuCongNghiepService {
  constructor(
    @InjectRepository(CumKhuCongNghiep)
    private readonly cumKhuCongNghiepRepository: Repository<CumKhuCongNghiep>,
  ) { }

  async create(createDto: CreateCumKhuCongNghiepDto): Promise<CumKhuCongNghiep> {
    try {
      // Kiểm tra tên đã tồn tại
      const existingRecord = await this.cumKhuCongNghiepRepository.findOne({
        where: { ten: createDto.ten }
      });

      if (existingRecord) {
        throw new BadRequestException('Tên cụm khu công nghiệp đã tồn tại');
      }

      const newRecord = this.cumKhuCongNghiepRepository.create(createDto);
      return await this.cumKhuCongNghiepRepository.save(newRecord);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListCumKhuCongNghiepDto): Promise<{
    data: CumKhuCongNghiep[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search } = query;
      const skip = (page - 1) * limit;

      const whereCondition: any = {};

      if (search) {
        whereCondition.ten = Like(`%${search}%`);
      }

      const [data, total] = await this.cumKhuCongNghiepRepository.findAndCount({
        where: whereCondition,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<CumKhuCongNghiep> {
    try {
      const record = await this.cumKhuCongNghiepRepository.findOne({
        where: { id }
      });

      if (!record) {
        throw new NotFoundException('Không tìm thấy cụm khu công nghiệp');
      }

      return record;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateCumKhuCongNghiepDto): Promise<CumKhuCongNghiep> {
    try {
      const record = await this.findOne(id);

      // Kiểm tra tên trùng (nếu có thay đổi tên)
      if (updateDto.ten && updateDto.ten !== record.ten) {
        const existingRecord = await this.cumKhuCongNghiepRepository.findOne({
          where: { ten: updateDto.ten }
        });

        if (existingRecord) {
          throw new BadRequestException('Tên cụm khu công nghiệp đã tồn tại');
        }
      }

      await this.cumKhuCongNghiepRepository.update(id, updateDto);
      return await this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const record = await this.findOne(id);
      await this.cumKhuCongNghiepRepository.remove(record);

      return { message: 'Xóa cụm khu công nghiệp thành công' };
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<CumKhuCongNghiep[]> {
    try {
      return await this.cumKhuCongNghiepRepository.find({
        order: { ten: 'ASC' }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xuất Excel danh sách cụm khu công nghiệp (ID và Tên)
   */
  async exportToExcel(): Promise<Buffer> {
    try {
      // Lấy toàn bộ danh sách cụm khu công nghiệp
      const cumKhuList = await this.cumKhuCongNghiepRepository
        .createQueryBuilder('ckc')
        .select(['ckc.id', 'ckc.ten'])
        .orderBy('ckc.id', 'ASC')
        .getMany();

      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // Tạo dữ liệu cho sheet
      const worksheetData = [
        ['STT', 'ID', 'Tên Cụm Khu Công Nghiệp'], // Header
        ...cumKhuList.map((ckc, index) => [
          index + 1,
          ckc.id,
          ckc.ten
        ])
      ];

      // Tạo worksheet từ dữ liệu
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set độ rộng cột
      worksheet['!cols'] = [
        { wch: 8 },  // STT
        { wch: 10 }, // ID
        { wch: 50 }  // Tên Cụm Khu CN
      ];

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách cụm khu CN');

      // Chuyển workbook thành buffer
      const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
        compression: true
      }) as Buffer;

      return buffer;
    } catch (error) {
      console.error('Error in exportToExcel:', error);
      throw new BadRequestException('Không thể xuất file Excel');
    }
  }
}
