import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
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

  /**
   * Kiểm tra có dùng WSL không (USE_WSL=true trong .env)
   */
  private useWsl(): boolean {
    return this.configService.get<string>('USE_WSL') === 'true';
  }

  /**
   * Build lệnh và args phù hợp với môi trường (WSL hoặc native)
   * - WSL: wsl mysqldump [args...]
   * - Native: mysqldump [args...]  (hoặc /path/to/mysqldump nếu có MYSQL_BIN_PATH)
   */
  private buildCommand(mysqlCommand: string, args: string[]): { cmd: string; args: string[] } {
    if (this.useWsl()) {
      return {
        cmd: 'wsl',
        args: [mysqlCommand, ...args],
      };
    }

    const mysqlBinPath = this.configService.get<string>('MYSQL_BIN_PATH');
    const fullCommand =
      mysqlBinPath && mysqlBinPath.trim()
        ? path.join(mysqlBinPath, mysqlCommand)
        : mysqlCommand;

    return { cmd: fullCommand, args };
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

  async backupDatabase() {
    try {
      const backupDir = this.getBackupDir();
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupFileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      const backupPath = path.join(backupDir, backupFileName);

      const dbHost = this.configService.get<string>('DB_HOST') || '127.0.0.1';
      const dbPort = this.configService.get<string>('DB_PORT') || '3306';
      const dbUser = this.configService.get<string>('DB_USER') || '';
      const dbPassword = this.configService.get<string>('DB_PASSWORD') || '';
      const dbName = this.configService.get<string>('DB_NAME') || '';

      const mysqldumpArgs = [
        `-h`, dbHost,
        `-P`, dbPort,
        `-u`, dbUser,
        `-p${dbPassword}`,
        dbName,
      ];

      const { cmd, args } = this.buildCommand('mysqldump', mysqldumpArgs);

      console.log('[Backup] Creating backup...', this.useWsl() ? '(via WSL)' : '(native)');

      return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { shell: false });
        const writeStream = fs.createWriteStream(backupPath);

        // Pipe stdout (dữ liệu SQL) vào file
        child.stdout.pipe(writeStream);

        let stderrOutput = '';
        child.stderr.on('data', (data) => {
          const msg = data.toString();
          // mysqldump thường in password warning ra stderr — bỏ qua
          if (!msg.toLowerCase().includes('warning')) {
            stderrOutput += msg;
          }
        });

        child.on('close', (code) => {
          writeStream.close();
          if (code !== 0 && stderrOutput) {
            console.error('[Backup] Error:', stderrOutput);
            // Xóa file rỗng/lỗi nếu thất bại
            if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
            reject({
              statusCode: 500,
              message: 'Sao lưu dữ liệu thất bại',
              error: stderrOutput,
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

        child.on('error', (err) => {
          writeStream.close();
          if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
          console.error('[Backup] Spawn error:', err.message);
          reject({
            statusCode: 500,
            message: this.useWsl()
              ? 'Không tìm thấy mysqldump trong WSL. Chạy: sudo apt install mysql-client'
              : 'Không tìm thấy mysqldump. Kiểm tra MYSQL_BIN_PATH trong .env',
            error: err.message,
          });
        });
      });
    } catch (err) {
      console.error('[Backup] Exception:', err.message);
      return { statusCode: 500, message: err.message };
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

      const dbHost = this.configService.get<string>('DB_HOST') || '127.0.0.1';
      const dbPort = this.configService.get<string>('DB_PORT') || '3306';
      const dbUser = this.configService.get<string>('DB_USER') || '';
      const dbPassword = this.configService.get<string>('DB_PASSWORD') || '';
      const dbName = this.configService.get<string>('DB_NAME') || '';

      const mysqlArgs = [
        `-h`, dbHost,
        `-P`, dbPort,
        `-u`, dbUser,
        `-p${dbPassword}`,
        dbName,
      ];

      const { cmd, args } = this.buildCommand('mysql', mysqlArgs);

      console.log('[Restore] Running restore...', this.useWsl() ? '(via WSL)' : '(native)');

      return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { shell: false });

        // Pipe file SQL vào stdin của mysql/wsl
        const readStream = fs.createReadStream(backupPath);
        readStream.pipe(child.stdin);

        let stderrOutput = '';
        child.stderr.on('data', (data) => {
          const msg = data.toString();
          if (!msg.toLowerCase().includes('warning')) {
            stderrOutput += msg;
          }
        });

        child.on('close', (code) => {
          if (code !== 0 && stderrOutput) {
            console.error('[Restore] Error:', stderrOutput);
            reject({
              statusCode: 500,
              message: 'Khôi phục dữ liệu thất bại',
              error: stderrOutput,
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

        child.on('error', (err) => {
          console.error('[Restore] Spawn error:', err.message);
          reject({
            statusCode: 500,
            message: this.useWsl()
              ? 'Không tìm thấy mysql trong WSL. Chạy: sudo apt install mysql-client'
              : 'Không tìm thấy mysql. Kiểm tra MYSQL_BIN_PATH trong .env',
            error: err.message,
          });
        });
      });
    } catch (err) {
      console.error('[Restore] Exception:', err.message);
      return { statusCode: 500, message: err.message };
    }
  }
}
