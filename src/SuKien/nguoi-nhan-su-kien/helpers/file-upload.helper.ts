import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface FileInfo {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

export class FileUploadHelper {
  private static readonly UPLOAD_DIR = 'uploads/su-kien';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  /**
   * Tạo thư mục upload nếu chưa tồn tại
   */
  static ensureUploadDirectory(): void {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Validate file trước khi upload
   */
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Kiểm tra kích thước file
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File quá lớn. Kích thước tối đa là 10MB' };
    }

    // Kiểm tra loại file
    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      return { valid: false, error: 'Loại file không được hỗ trợ' };
    }

    return { valid: true };
  }

  /**
   * Tạo tên file unique
   */
  static generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const uuid = randomUUID();
    return `${name}_${timestamp}_${uuid}${ext}`;
  }

  /**
   * Lưu file và trả về thông tin file
   */
  static async saveFile(file: Express.Multer.File): Promise<FileInfo> {
    this.ensureUploadDirectory();

    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateFileName(file.originalname);
    const filePath = path.join(this.UPLOAD_DIR, fileName);

    // Lưu file
    fs.writeFileSync(filePath, file.buffer);

    return {
      filename: fileName,
      originalname: file.originalname,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    };
  }

  /**
   * Lưu multiple files
   */
  static async saveFiles(files: Express.Multer.File[]): Promise<FileInfo[]> {
    const fileInfos: FileInfo[] = [];

    for (const file of files) {
      try {
        const fileInfo = await this.saveFile(file);
        fileInfos.push(fileInfo);
      } catch (error) {
        throw new Error(`Lỗi upload file ${file.originalname}: ${error.message}`);
      }
    }

    return fileInfos;
  }

  /**
   * Tạo URL download cho file
   */
  static getDownloadUrl(fileName: string, baseUrl: string): string {
    return `${baseUrl}/api/uploads/su-kien/${fileName}`;
  }

  /**
   * Tạo danh sách download URLs
   */
  static getDownloadUrls(fileNames: string[], baseUrl: string): string[] {
    return fileNames.map(fileName => this.getDownloadUrl(fileName, baseUrl));
  }

  /**
   * Xóa file
   */
  static deleteFile(fileName: string): void {
    const filePath = path.join(this.UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Tạo attachment info cho Zalo OA
   */
  static createZaloAttachments(fileInfos: FileInfo[], baseUrl: string): Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }> {
    return fileInfos.map(fileInfo => ({
      type: fileInfo.mimetype.startsWith('image/') ? 'image' : 'file',
      url: this.getDownloadUrl(fileInfo.filename, baseUrl),
      name: fileInfo.originalname
    }));
  }
}
