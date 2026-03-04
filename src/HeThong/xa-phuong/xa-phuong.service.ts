import { BadRequestException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like,Repository } from 'typeorm';
import * as XLSX from 'xlsx';

import { XaPhuong } from '../../databases/entities/XaPhuong.entity';
import {
  CreateXaPhuongDto,
  ListXaPhuongDto,
  UpdateXaPhuongDto} from './dto/xa-phuong.dto';

@Injectable()
export class XaPhuongService {
  constructor(
    @InjectRepository(XaPhuong)
    private readonly xaPhuongRepository: Repository<XaPhuong>,
  ) { }

  async create(createDto: CreateXaPhuongDto): Promise<XaPhuong> {
    try {
      // Kiểm tra tên đã tồn tại
      const existingRecord = await this.xaPhuongRepository.findOne({
        where: { ten: createDto.ten }
      });

      if (existingRecord) {
        throw new BadRequestException('Tên xã phường đã tồn tại');
      }

      const newRecord = this.xaPhuongRepository.create(createDto);
      return await this.xaPhuongRepository.save(newRecord);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListXaPhuongDto): Promise<{
    data: XaPhuong[];
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

      const [data, total] = await this.xaPhuongRepository.findAndCount({
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

  async findOne(id: number): Promise<XaPhuong> {
    try {
      const record = await this.xaPhuongRepository.findOne({
        where: { id }
      });

      if (!record) {
        throw new NotFoundException('Không tìm thấy xã phường');
      }

      return record;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateXaPhuongDto): Promise<XaPhuong> {
    try {
      const record = await this.findOne(id);

      // Kiểm tra tên trùng (nếu có thay đổi tên)
      if (updateDto.ten && updateDto.ten !== record.ten) {
        const existingRecord = await this.xaPhuongRepository.findOne({
          where: { ten: updateDto.ten }
        });

        if (existingRecord) {
          throw new BadRequestException('Tên xã phường đã tồn tại');
        }
      }

      await this.xaPhuongRepository.update(id, updateDto);
      return await this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const record = await this.findOne(id);
      await this.xaPhuongRepository.remove(record);

      return { message: 'Xóa xã phường thành công' };
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<XaPhuong[]> {
    try {
      return await this.xaPhuongRepository.find({
        order: { ten: 'ASC' }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xuất Excel danh sách xã phường (ID và Tên)
   */
  async exportToExcel(): Promise<Buffer> {
    try {
      // Lấy toàn bộ danh sách xã phường
      const xaPhuongList = await this.xaPhuongRepository
        .createQueryBuilder('xp')
        .select(['xp.id', 'xp.ten'])
        .orderBy('xp.id', 'ASC')
        .getMany();

      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // Tạo dữ liệu cho sheet
      const worksheetData = [
        ['STT', 'ID', 'Tên Xã Phường'], // Header
        ...xaPhuongList.map((xp, index) => [
          index + 1,
          xp.id,
          xp.ten
        ])
      ];

      // Tạo worksheet từ dữ liệu
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set độ rộng cột
      worksheet['!cols'] = [
        { wch: 8 },  // STT
        { wch: 10 }, // ID
        { wch: 50 }  // Tên Xã Phường
      ];

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách xã phường');

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
