import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { extname, join } from 'path';
import { Like, Repository } from 'typeorm';

import { LoaiSuKien } from '../../databases/entities/LoaiSuKien.entity';
import { SuKien } from '../../databases/entities/SuKien.entity';
import { User } from '../../databases/entities/user.entity';
import {
  CreateSuKienDto,
  ListSuKienDto,
  UpdateSuKienDto
} from './dto/su-kien.dto';
import { FileService } from './file.service';

@Injectable()
export class SuKienService {
  constructor(
    @InjectRepository(SuKien)
    private readonly suKienRepository: Repository<SuKien>,
    @InjectRepository(LoaiSuKien)
    private readonly loaiSuKienRepository: Repository<LoaiSuKien>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
  ) { }

  /**
   * Tính trạng thái động của sự kiện dựa vào thời gian
   */
  private getTrangThaiDong(suKien: SuKien): string {
    // Nếu sự kiện đã bị hủy thì giữ nguyên trạng thái
    if (suKien.trangThai === 'Đã hủy') {
      return 'Đã hủy';
    }

    const now = new Date();
    const thoiGianBatDau = new Date(suKien.thoiGianBatDau);
    const thoiGianKetThuc = new Date(suKien.thoiGianKetThuc);

    if (now < thoiGianBatDau) {
      return 'Đang chuẩn bị';
    } else if (now >= thoiGianBatDau && now <= thoiGianKetThuc) {
      return 'Đang diễn ra';
    } else {
      return 'Đã kết thúc';
    }
  }

  /**
   * Áp dụng trạng thái động cho một sự kiện
   */
  private applyTrangThaiDong(suKien: SuKien): SuKien {
    suKien.trangThai = this.getTrangThaiDong(suKien);
    return suKien;
  }

  /**
   * Áp dụng trạng thái động cho danh sách sự kiện
   */
  private applyTrangThaiDongList(suKienList: SuKien[]): SuKien[] {
    return suKienList.map(sk => this.applyTrangThaiDong(sk));
  }

  async create(createDto: CreateSuKienDto, files?: Express.Multer.File[]): Promise<SuKien> {
    try {
      // Validate thời gian
      const startTime = new Date(createDto.thoiGianBatDau);
      const endTime = new Date(createDto.thoiGianKetThuc);

      if (endTime <= startTime) {
        throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
      }

      // Validate user exists (nguoiTao sẽ được set từ JWT trong controller)
      if (createDto.nguoiTao) {
        const user = await this.userRepository.findOne({
          where: { id: createDto.nguoiTao }
        });
        if (!user) {
          throw new BadRequestException(`Người tạo với ID ${createDto.nguoiTao} không tồn tại trong hệ thống`);
        }
      }

      // Validate loại sự kiện exists
      if (createDto.loaiSuKienId) {
        const loaiSuKien = await this.loaiSuKienRepository.findOne({
          where: { id: createDto.loaiSuKienId }
        });
        if (!loaiSuKien) {
          throw new BadRequestException('Loại sự kiện không tồn tại');
        }
      }

      // Upload files if provided
      let fileDinhKem = null;
      if (files && files.length > 0) {
        const uploadedPaths = await this.fileService.uploadFiles(files);
        fileDinhKem = this.fileService.createFileMetadata(files, uploadedPaths);
      }

      const newSuKien = this.suKienRepository.create({
        ...createDto,
        fileDinhKem,
      });

      return await this.suKienRepository.save(newSuKien);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: ListSuKienDto): Promise<{
    data: SuKien[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, search, trangThai, loaiSuKienId } = query;
      const skip = (page - 1) * limit;
      const now = new Date();

      // Sử dụng QueryBuilder để filter theo thời gian
      const queryBuilder = this.suKienRepository
        .createQueryBuilder('suKien')
        .leftJoinAndSelect('suKien.user', 'user')
        .leftJoinAndSelect('suKien.loaiSuKien', 'loaiSuKien');

      // Filter theo search
      if (search) {
        queryBuilder.andWhere('suKien.tenSuKien LIKE :search', { search: `%${search}%` });
      }

      // Filter theo loại sự kiện
      if (loaiSuKienId) {
        queryBuilder.andWhere('suKien.loaiSuKienId = :loaiSuKienId', { loaiSuKienId });
      }

      // Filter theo trạng thái động
      if (trangThai) {
        switch (trangThai) {
          case 'Đã hủy':
            queryBuilder.andWhere('suKien.trangThai = :trangThai', { trangThai: 'Đã hủy' });
            break;
          case 'Đang chuẩn bị':
            queryBuilder.andWhere('suKien.trangThai != :daHuy', { daHuy: 'Đã hủy' });
            queryBuilder.andWhere('suKien.thoiGianBatDau > :now', { now });
            break;
          case 'Đang diễn ra':
            queryBuilder.andWhere('suKien.trangThai != :daHuy', { daHuy: 'Đã hủy' });
            queryBuilder.andWhere('suKien.thoiGianBatDau <= :now', { now });
            queryBuilder.andWhere('suKien.thoiGianKetThuc >= :now', { now });
            break;
          case 'Đã kết thúc':
            queryBuilder.andWhere('suKien.trangThai != :daHuy', { daHuy: 'Đã hủy' });
            queryBuilder.andWhere('suKien.thoiGianKetThuc < :now', { now });
            break;
        }
      }

      // Đếm tổng số và lấy dữ liệu
      const total = await queryBuilder.getCount();

      const data = await queryBuilder
        .orderBy('suKien.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      // Tính trạng thái động cho từng sự kiện
      const dataWithDynamicStatus = this.applyTrangThaiDongList(data);

      const totalPages = Math.ceil(total / limit);

      return {
        data: dataWithDynamicStatus,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAll(): Promise<SuKien[]> {
    try {
      const data = await this.suKienRepository.find({
        relations: ['user', 'loaiSuKien'],
        order: { thoiGianBatDau: 'ASC' },
      });

      // Áp dụng trạng thái động
      return this.applyTrangThaiDongList(data);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<SuKien> {
    try {
      const record = await this.suKienRepository.findOne({
        where: { id },
        relations: ['user', 'loaiSuKien'],
      });

      if (!record) {
        throw new NotFoundException(`Không tìm thấy sự kiện với ID ${id}`);
      }

      // Áp dụng trạng thái động
      return this.applyTrangThaiDong(record);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateDto: UpdateSuKienDto, files?: Express.Multer.File[]): Promise<SuKien> {
    try {
      const existingSuKien = await this.findOne(id);

      // Validate thời gian nếu có update
      if (updateDto.thoiGianBatDau || updateDto.thoiGianKetThuc) {
        const startTime = new Date(updateDto.thoiGianBatDau || existingSuKien.thoiGianBatDau);
        const endTime = new Date(updateDto.thoiGianKetThuc || existingSuKien.thoiGianKetThuc);

        if (endTime <= startTime) {
          throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
        }
      }

      // Validate loại sự kiện nếu có update
      if (updateDto.loaiSuKienId) {
        const loaiSuKien = await this.loaiSuKienRepository.findOne({
          where: { id: updateDto.loaiSuKienId }
        });
        if (!loaiSuKien) {
          throw new BadRequestException('Loại sự kiện không tồn tại');
        }
      }

      // Handle file upload
      let fileDinhKem = existingSuKien.fileDinhKem;
      if (files && files.length > 0) {
        const uploadedPaths = await this.fileService.uploadFiles(files);
        const newFileMetadata = this.fileService.createFileMetadata(files, uploadedPaths);

        // Merge with existing files
        if (fileDinhKem) {
          const existingFiles = JSON.parse(fileDinhKem);
          const newFiles = JSON.parse(newFileMetadata);
          existingFiles.files.push(...newFiles.files);
          fileDinhKem = JSON.stringify(existingFiles);
        } else {
          fileDinhKem = newFileMetadata;
        }
      }

      Object.assign(existingSuKien, updateDto, { fileDinhKem });
      return await this.suKienRepository.save(existingSuKien);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const record = await this.findOne(id);

      await this.suKienRepository.remove(record);

      return {
        message: `Xóa sự kiện "${record.tenSuKien}" thành công`
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadFiles(id: number, files: Express.Multer.File[]): Promise<SuKien> {
    try {
      const suKien = await this.findOne(id);

      const uploadedPaths = await this.fileService.uploadFiles(files);
      const newFileMetadata = this.fileService.createFileMetadata(files, uploadedPaths);

      // Merge with existing files
      let fileDinhKem = newFileMetadata;
      if (suKien.fileDinhKem) {
        const existingFiles = JSON.parse(suKien.fileDinhKem);
        const newFiles = JSON.parse(newFileMetadata);
        existingFiles.files.push(...newFiles.files);
        fileDinhKem = JSON.stringify(existingFiles);
      }

      suKien.fileDinhKem = fileDinhKem;
      return await this.suKienRepository.save(suKien);
    } catch (error) {
      throw error;
    }
  }

  async removeFile(id: number, fileName: string): Promise<SuKien> {
    try {
      const suKien = await this.findOne(id);

      if (!suKien.fileDinhKem) {
        throw new BadRequestException('Sự kiện không có file đính kèm');
      }

      const fileData = JSON.parse(suKien.fileDinhKem);
      const updatedFiles = fileData.files.filter(file => !file.path.includes(fileName));

      if (updatedFiles.length === fileData.files.length) {
        throw new NotFoundException(`Không tìm thấy file ${fileName}`);
      }

      suKien.fileDinhKem = updatedFiles.length > 0 ? JSON.stringify({ files: updatedFiles }) : null;
      return await this.suKienRepository.save(suKien);
    } catch (error) {
      throw error;
    }
  }

  async downloadFile(filePath: string, res: any): Promise<void> {
    try {
      // Remove leading slash if exists
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      const fullPath = join(process.cwd(), cleanPath);

      // Check if file exists
      if (!existsSync(fullPath)) {
        return res.status(404).json({
          statusCode: 404,
          message: 'File không tồn tại'
        });
      }

      // Get file info
      const fileName = cleanPath.split('/').pop();
      const fileExt = extname(fileName).toLowerCase();

      // Set appropriate content type
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed'
      };

      const contentType = mimeTypes[fileExt] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      return res.sendFile(fullPath);
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Lỗi khi tải file',
        error: error.message
      });
    }
  }

  async getFileList(id: number): Promise<any[]> {
    try {
      const suKien = await this.findOne(id);

      if (!suKien.fileDinhKem) {
        return [];
      }

      const fileData = JSON.parse(suKien.fileDinhKem);
      return fileData.files || [];
    } catch (error) {
      throw error;
    }
  }
}
