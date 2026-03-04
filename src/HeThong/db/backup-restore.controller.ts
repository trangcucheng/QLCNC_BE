
import { BadRequestException, Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BackupCronService } from './backup-cron.service';
import { BackupRestoreService } from './backup-restore.service';
import { S3BackupService } from './s3-backup.service';

@ApiTags('Backup & Restore')
@Controller('backup-restore')
export class BackupRestoreController {
  constructor(
    private readonly backupRestoreService: BackupRestoreService,
    private readonly backupCronService: BackupCronService,
    private readonly s3BackupService: S3BackupService,
  ) { }

  @Get('backup')
  @ApiOperation({ summary: 'Tạo backup thủ công' })
  @ApiResponse({ status: 200, description: 'Backup thành công' })
  async backup() {
    return await this.backupRestoreService.backupDatabase('manual');
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore database từ file backup' })
  @ApiResponse({ status: 200, description: 'Restore thành công' })
  async restore(@Body('filePath') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }
    return await this.backupRestoreService.restoreDatabase(filePath);
  }

  @Get('backups')
  @ApiOperation({ summary: 'Lấy danh sách tất cả backups' })
  @ApiQuery({ name: 'type', required: false, enum: ['manual', 'daily', 'weekly', 'monthly'] })
  async listBackups(@Query('type') type?: 'manual' | 'daily' | 'weekly' | 'monthly') {
    return await this.backupRestoreService.getBackupList(type);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Lấy thông tin tổng quan về backups' })
  @ApiResponse({ status: 200, description: 'Thông tin backup' })
  async getBackupSummary() {
    return await this.backupRestoreService.getBackupSummary();
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Xóa một backup cụ thể' })
  @ApiResponse({ status: 200, description: 'Xóa backup thành công' })
  async deleteBackup(@Body('filePath') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }
    return await this.backupRestoreService.deleteBackup(filePath);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup backups cũ theo retention policy' })
  @ApiQuery({ name: 'type', required: true, enum: ['manual', 'daily', 'weekly', 'monthly'] })
  async cleanupBackups(@Query('type') type: 'manual' | 'daily' | 'weekly' | 'monthly') {
    if (!type) {
      throw new BadRequestException('Backup type is required');
    }
    await this.backupRestoreService.cleanupOldBackups(type);
    return { message: `Cleaned up old ${type} backups successfully` };
  }

  @Post('test-cron')
  @ApiOperation({ summary: 'Test backup cron job ngay lập tức' })
  @ApiResponse({ status: 200, description: 'Test backup thành công' })
  async testBackupCron() {
    return await this.backupCronService.testBackup();
  }

  @Get('s3/list')
  @ApiOperation({ summary: 'Lấy danh sách backups trên S3' })
  @ApiQuery({ name: 'prefix', required: false, description: 'S3 prefix (mặc định: qlcd/)' })
  @ApiResponse({ status: 200, description: 'Danh sách S3 backups' })
  async listS3Backups(@Query('prefix') prefix?: string) {
    return await this.s3BackupService.listBackups(prefix || 'qlcd/');
  }

  @Post('s3/upload')
  @ApiOperation({ summary: 'Upload local backup lên S3' })
  @ApiResponse({ status: 200, description: 'Upload thành công' })
  async uploadToS3(@Body('filePath') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('File path is required');
    }
    const s3Key = await this.s3BackupService.uploadBackup(filePath);
    return { message: 'Upload successful', s3Key };
  }

  @Post('s3/download')
  @ApiOperation({ summary: 'Download backup từ S3' })
  @ApiResponse({ status: 200, description: 'Download thành công' })
  async downloadFromS3(
    @Body('s3Key') s3Key: string,
    @Body('localPath') localPath: string,
  ) {
    if (!s3Key || !localPath) {
      throw new BadRequestException('S3 key and local path are required');
    }
    await this.s3BackupService.downloadBackup(s3Key, localPath);
    return { message: 'Download successful', localPath };
  }

  @Delete('s3/delete')
  @ApiOperation({ summary: 'Xóa backup trên S3' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteS3Backup(@Body('s3Key') s3Key: string) {
    if (!s3Key) {
      throw new BadRequestException('S3 key is required');
    }
    await this.s3BackupService.deleteBackup(s3Key);
    return { message: 'S3 backup deleted successfully' };
  }

  @Get('s3/test')
  @ApiOperation({ summary: 'Test kết nối S3' })
  @ApiResponse({ status: 200, description: 'Test connection result' })
  async testS3Connection() {
    return await this.s3BackupService.testConnection();
  }
}
