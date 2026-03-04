import { BadRequestException,Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like,Repository } from 'typeorm';

import { ChucVu } from '../../databases/entities/ChucVu.entity';
import {
  CreateChucVuDto,
  ListChucVuDto,
  UpdateChucVuDto} from './dto/chuc-vu.dto';

@Injectable()
export class ChucVuService {
  constructor(
    @InjectRepository(ChucVu)
    private readonly chucVuRepository: Repository<ChucVu>,
  ) { }

  async create(createDto: CreateChucVuDto): Promise<ChucVu> {
    try {
      // Kiểm tra tên đã tồn tại
      const existingRecord = await this.chucVuRepository.findOne({
        where: { tenChucVu: createDto.tenChucVu }
      });

      if (existingRecord) {
        throw new BadRequestException('Tên chức vụ đã tồn tại');
      }

      const newRecord = this.chucVuRepository.create(createDto);
      return await this.chucVuRepository.save(newRecord);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListChucVuDto): Promise<{
    data: ChucVu[];
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
        whereCondition.tenChucVu = Like(`%${search}%`);
      }

      const [data, total] = await this.chucVuRepository.findAndCount({
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

  async findOne(id: number): Promise<ChucVu> {
    try {
      const record = await this.chucVuRepository.findOne({
        where: { id }
      });

      if (!record) {
        throw new NotFoundException('Không tìm thấy chức vụ');
      }

      return record;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateChucVuDto): Promise<ChucVu> {
    try {
      const record = await this.findOne(id);

      // Kiểm tra tên trùng (nếu có thay đổi tên)
      if (updateDto.tenChucVu && updateDto.tenChucVu !== record.tenChucVu) {
        const existingRecord = await this.chucVuRepository.findOne({
          where: { tenChucVu: updateDto.tenChucVu }
        });

        if (existingRecord) {
          throw new BadRequestException('Tên chức vụ đã tồn tại');
        }
      }

      await this.chucVuRepository.update(id, updateDto);
      return await this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const record = await this.findOne(id);
      await this.chucVuRepository.remove(record);

      return { message: 'Xóa chức vụ thành công' };
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<ChucVu[]> {
    try {
      return await this.chucVuRepository.find({
        order: { tenChucVu: 'ASC' }
      });
    } catch (error) {
      throw error;
    }
  }
}
