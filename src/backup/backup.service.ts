import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BackupService {
  constructor(private configService: ConfigService) { }

  private getBackupDir(): string {
    return path.join(process.cwd(), 'log', 'backup');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async listBackups() {
    try {
      const backupDir = this.getBackupDir();

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        return {
          statusCode: 200,
          message: 'Danh sách backup',
          data: [],
          total: 0,
        };
      }

      const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.sql'));

      const backupList = files.map(fileName => {
        const filePath = path.join(backupDir, fileName);
        const stats = fs.statSync(filePath);
        return {
          fileName,
          fileSize: this.formatBytes(stats.size),
          createdAt: stats.birthtime.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          timestamp: stats.birthtime.getTime(),
        };
      });

      // Sort by newest first
      backupList.sort((a, b) => b.timestamp - a.timestamp);

      return {
        statusCode: 200,
        message: 'Danh sách backup',
        data: backupList,
        total: backupList.length,
      };
    } catch (error) {
      console.error('[List Backups] Error:', error);
      return {
        statusCode: 500,
        message: 'Lỗi khi lấy danh sách backup',
        error: error.message,
      };
    }
  }

  private getMySqlCommand(command: string): string {
    const mysqlBinPath = this.configService.get<string>('MYSQL_BIN_PATH');
    if (mysqlBinPath && mysqlBinPath.trim()) {
      return path.join(mysqlBinPath, command);
    }
    return command;
  }

  async backupDatabase() {
    try {
      const backupDir = this.getBackupDir();

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupFileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      const backupPath = path.join(backupDir, backupFileName);

      const dbHost = this.configService.get<string>('DB_HOST');
      const dbPort = this.configService.get<string>('DB_PORT');
      const dbUser = this.configService.get<string>('DB_USER');
      const dbPassword = this.configService.get<string>('DB_PASSWORD');
      const dbName = this.configService.get<string>('DB_NAME');

      // MySQL backup command with configurable path
      const mysqldump = this.getMySqlCommand('mysqldump');
      const command = `"${mysqldump}" -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName} > "${backupPath}"`;

      console.log('[Backup] Creating backup...');

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('[Backup] Error:', stderr || error.message);
            reject({
              statusCode: 500,
              message: 'Sao lưu dữ liệu thất bại',
              error: stderr || error.message,
            });
          } else {
            console.log('[Backup] Success:', backupPath);
            resolve({
              statusCode: 200,
              message: 'Sao lưu dữ liệu thành công',
              data: { fileName: backupFileName },
            });
          }
        });
      });
    } catch (err) {
      console.error('[Backup] Exception:', err.message);
      return {
        statusCode: 500,
        message: err.message,
      };
    }
  }

  async restoreDatabase(backupFileName: string) {
    try {
      if (!backupFileName) {
        throw new Error('Tên file backup là bắt buộc');
      }

      const backupDir = this.getBackupDir();
      const backupPath = path.join(backupDir, backupFileName);

      console.log('[Restore] Backup directory:', backupDir);
      console.log('[Restore] Backup file path:', backupPath);

      if (!fs.existsSync(backupPath)) {
        throw new Error(`Không tìm thấy file backup: ${backupFileName}`);
      }

      const dbHost = this.configService.get<string>('DB_HOST');
      const dbPort = this.configService.get<string>('DB_PORT');
      const dbUser = this.configService.get<string>('DB_USER');
      const dbPassword = this.configService.get<string>('DB_PASSWORD');
      const dbName = this.configService.get<string>('DB_NAME');

      // MySQL restore command with configurable path
      const mysql = this.getMySqlCommand('mysql');
      const command = `"${mysql}" -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName} < "${backupPath}"`;

      console.log('[Restore] Running restore...');

      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('[Restore] Error:', stderr || error.message);
            reject({
              statusCode: 500,
              message: 'Khôi phục dữ liệu thất bại',
              error: stderr || error.message,
            });
          } else {
            console.log('[Restore] Success');
            resolve({
              statusCode: 200,
              message: 'Khôi phục dữ liệu thành công',
              data: { fileName: backupFileName },
            });
          }
        });
      });
    } catch (err) {
      console.error('[Restore] Exception:', err.message);
      return {
        statusCode: 500,
        message: err.message,
      };
    }
  }
}
