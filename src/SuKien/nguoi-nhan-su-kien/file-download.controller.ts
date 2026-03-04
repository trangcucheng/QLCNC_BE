import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('File Download')
@Controller()
export class FileDownloadController {
  private readonly uploadsDir = 'uploads';

  @Get('uploads/su-kien/:year/:month/:filename')
  @ApiOperation({
    summary: 'Tải file đính kèm từ sự kiện',
    description: 'API để tải file đính kèm đã upload trong thông báo sự kiện'
  })
  @ApiParam({ name: 'year', description: 'Năm', example: '2025' })
  @ApiParam({ name: 'month', description: 'Tháng', example: '10' })
  @ApiParam({ name: 'filename', description: 'Tên file', example: 'document.xlsx' })
  @ApiResponse({
    status: 200,
    description: 'File được tải thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'File không tồn tại'
  })
  async downloadFile(
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    try {
      // Tạo đường dẫn đầy đủ: uploads/su-kien/year/month/filename
      const relativePath = path.join(year, month, filename);
      const fullPath = path.join(this.uploadsDir, 'su-kien', relativePath);

      console.log(`📁 [FileDownload] Trying to access: ${fullPath}`);

      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ [FileDownload] File not found: ${fullPath}`);
        throw new NotFoundException(`File không tồn tại: ${relativePath}`);
      }

      // Kiểm tra file có phải trong thư mục uploads không (security check)
      const absolutePath = path.resolve(fullPath);
      const uploadsPath = path.resolve(this.uploadsDir);
      if (!absolutePath.startsWith(uploadsPath)) {
        console.log(`⚠️ [FileDownload] Security check failed: ${absolutePath}`);
        throw new NotFoundException('File không hợp lệ');
      }

      // Lấy thông tin file
      const stats = fs.statSync(fullPath);
      const fileSize = stats.size;

      console.log(`✅ [FileDownload] File found: ${filename}, size: ${fileSize} bytes`);

      // Set headers
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Xác định content-type dựa trên extension
      const ext = path.extname(filename).toLowerCase();
      const contentType = this.getContentType(ext);
      res.setHeader('Content-Type', contentType);

      // Stream file
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Không thể tải file');
    }
  }

  private getContentType(ext: string): string {
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain'
    };

    return contentTypes[ext] || 'application/octet-stream';
  }
}
