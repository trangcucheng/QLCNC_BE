import { BadRequestException,Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

@Injectable()
export class FileService {
  private readonly uploadDir = 'uploads/su-kien';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar'];

  constructor() {
    // Tạo thư mục upload nếu chưa tồn tại
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const fullPath = join(this.uploadDir, String(currentYear), currentMonth);

    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadedFiles: string[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    for (const file of files) {
      // Validation
      this.validateFile(file);

      // Generate unique filename based on original name
      const fileExt = extname(file.originalname);
      const baseName = file.originalname.replace(fileExt, '');
      const timestamp = Date.now();
      const fileName = `${baseName}_${timestamp}${fileExt}`;
      const relativePath = join(this.uploadDir, String(currentYear), currentMonth, fileName);
      const fullPath = join(process.cwd(), relativePath);

      try {
        // Ensure directory exists
        this.ensureUploadDir();

        // Save file
        writeFileSync(fullPath, file.buffer);

        // Store relative path for database
        uploadedFiles.push(`/${relativePath.replace(/\\/g, '/')}`);
      } catch (error) {
        throw new BadRequestException(`Không thể lưu file ${file.originalname}: ${error.message}`);
      }
    }

    return uploadedFiles;
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File ${file.originalname} quá lớn. Kích thước tối đa cho phép: ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Check file extension
    const fileExt = extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.includes(fileExt)) {
      throw new BadRequestException(
        `File ${file.originalname} có định dạng không được hỗ trợ. Các định dạng cho phép: ${this.allowedExtensions.join(', ')}`
      );
    }
  }

  createFileMetadata(files: Express.Multer.File[], savedPaths: string[]): string {
    if (files.length !== savedPaths.length) {
      throw new BadRequestException('Số lượng file và đường dẫn không khớp');
    }

    const metadata = files.map((file, index) => ({
      originalName: file.originalname,
      fileName: savedPaths[index].split('/').pop(),
      path: savedPaths[index],
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString()
    }));

    return JSON.stringify({ files: metadata });
  }
}
