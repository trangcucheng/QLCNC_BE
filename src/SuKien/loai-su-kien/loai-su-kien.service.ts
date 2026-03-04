import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { LoaiSuKien } from '../../databases/entities/LoaiSuKien.entity';
import {
  CreateLoaiSuKienDto,
  UpdateLoaiSuKienDto,
  ListLoaiSuKienDto
} from './dto/tao-loai-su-kien.dto';

@Injectable()
export class LoaiSuKienService {
  constructor(
    @InjectRepository(LoaiSuKien)
    private readonly loaiSuKienRepository: Repository<LoaiSuKien>,
  ) { }

  async create(createDto: CreateLoaiSuKienDto): Promise<LoaiSuKien> {
    try {
      // Kiểm tra tên đã tồn tại
      const existingRecord = await this.loaiSuKienRepository.findOne({
        where: { ten: createDto.ten }
      });

      if (existingRecord) {
        throw new BadRequestException('Tên loại sự kiện đã tồn tại');
      }

      const newRecord = this.loaiSuKienRepository.create(createDto);
      return await this.loaiSuKienRepository.save(newRecord);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListLoaiSuKienDto): Promise<{
    data: LoaiSuKien[];
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

      const [data, total] = await this.loaiSuKienRepository.findAndCount({
        where: whereCondition,
        order: { createdAt: 'DESC' },
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

  async getAll(): Promise<LoaiSuKien[]> {
    try {
      return await this.loaiSuKienRepository.find({
        where: { trangThai: true },
        order: { ten: 'ASC' },
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<LoaiSuKien> {
    try {
      const record = await this.loaiSuKienRepository.findOne({
        where: { id },
      });

      if (!record) {
        throw new NotFoundException(`Không tìm thấy loại sự kiện với ID ${id}`);
      }

      return record;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateLoaiSuKienDto): Promise<LoaiSuKien> {
    try {
      const existingRecord = await this.findOne(id);

      // Kiểm tra tên đã tồn tại (nếu có thay đổi tên)
      if (updateDto.ten && updateDto.ten !== existingRecord.ten) {
        const duplicateRecord = await this.loaiSuKienRepository.findOne({
          where: { ten: updateDto.ten }
        });

        if (duplicateRecord) {
          throw new BadRequestException('Tên loại sự kiện đã tồn tại');
        }
      }

      Object.assign(existingRecord, updateDto);
      return await this.loaiSuKienRepository.save(existingRecord);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const record = await this.findOne(id);

      await this.loaiSuKienRepository.remove(record);

      return {
        message: `Xóa loại sự kiện "${record.ten}" thành công`
      };
    } catch (error) {
      throw error;
    }
  }
}
