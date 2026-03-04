
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as zlib from 'zlib';

import { S3BackupService } from './s3-backup.service';

const execPromise = promisify(exec);

type BackupType = 'manual' | 'daily' | 'weekly' | 'monthly';

interface BackupConfig {
  maxBackups: number; // Số lượng backup tối đa giữ lại
  compressionLevel: number; // Mức nén (1-9)
}

@Injectable()
export class BackupRestoreService {
  private readonly logger = new Logger(BackupRestoreService.name);

  // Thư mục lưu backup - NÊN LƯU Ở:
  // 1. Local: backups/ (development)
  // 2. Production: /var/backups/qlcd hoặc mounted volume
  // 3. Cloud: S3, Google Cloud Storage, Azure Blob (tốt nhất)
  private backupDir = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', '..', 'backups');

  // Retention policy - Giữ bao nhiêu bản backup
  private backupConfig: Record<BackupType, BackupConfig> = {
    manual: { maxBackups: 5, compressionLevel: 6 },
    daily: { maxBackups: 7, compressionLevel: 6 },    // Giữ 7 ngày
    weekly: { maxBackups: 4, compressionLevel: 9 },   // Giữ 4 tuần
    monthly: { maxBackups: 12, compressionLevel: 9 }, // Giữ 12 tháng
  };

  constructor(private readonly s3BackupService: S3BackupService) {
    // Tạo thư mục backup nếu chưa có
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Tạo các thư mục con cho từng loại backup
    ['manual', 'daily', 'weekly', 'monthly'].forEach(type => {
      const typeDir = path.join(this.backupDir, type);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }
    });
  }

  async backupDatabase(type: BackupType = 'manual'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${type}-${timestamp}.sql`;
    const backupFilePath = path.join(this.backupDir, type, backupFileName);
    const compressedFilePath = `${backupFilePath}.gz`;

    try {
      // Step 1: Dump database
      console.log(`📦 Dumping database to ${backupFilePath}...`);

      const dumpCommand = this.getDumpCommand(backupFilePath);
      await execPromise(dumpCommand);

      // Step 2: Compress backup file
      console.log(`🗜️  Compressing backup file...`);
      await this.compressFile(
        backupFilePath,
        compressedFilePath,
        this.backupConfig[type].compressionLevel
      );

      // Step 3: Delete uncompressed file
      fs.unlinkSync(backupFilePath);

      // Step 4: Get file size
      const stats = fs.statSync(compressedFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      this.logger.log(`✅ Local backup completed: ${compressedFilePath} (${fileSizeMB} MB)`);

      // Step 5: Upload to S3 (if enabled)
      let s3Key = null;
      if (this.s3BackupService.isEnabled()) {
        try {
          s3Key = await this.s3BackupService.uploadBackup(compressedFilePath);
          this.logger.log(`☁️  S3 backup completed: ${s3Key}`);
        } catch (s3Error) {
          this.logger.error(`⚠️  S3 upload failed but local backup OK: ${s3Error.message}`);
          // Continue - local backup vẫn thành công
        }
      }

      const result = s3Key
        ? `Backup completed - Local: ${compressedFilePath} (${fileSizeMB} MB) | S3: ${s3Key}`
        : `Backup completed - Local only: ${compressedFilePath} (${fileSizeMB} MB)`;

      return result;
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(backupFilePath)) fs.unlinkSync(backupFilePath);
      if (fs.existsSync(compressedFilePath)) fs.unlinkSync(compressedFilePath);

      throw new BadRequestException(`Backup failed: ${error.message}`);
    }
  }

  /**
   * Nén file backup bằng gzip
   */
  private async compressFile(
    inputPath: string,
    outputPath: string,
    compressionLevel: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const gzip = zlib.createGzip({ level: compressionLevel });
      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(outputPath);

      input
        .pipe(gzip)
        .pipe(output)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Giải nén file backup
   */
  private async decompressFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const gunzip = zlib.createGunzip();
      const input = fs.createReadStream(inputPath);
      const output = fs.createWriteStream(outputPath);

      input
        .pipe(gunzip)
        .pipe(output)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Lấy command dump database theo loại DB
   */
  private getDumpCommand(outputPath: string): string {
    const dbType = process.env.DB_TYPE || 'mysql';

    if (dbType === 'postgres') {
      return `PGPASSWORD="${process.env.DB_PASS}" pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F p -f ${outputPath}`;
    } else {
      // MySQL/MariaDB
      return `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASS} ${process.env.DB_NAME} > ${outputPath}`;
    }
  }

  async restoreDatabase(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Backup file not found');
    }

    try {
      let sqlFilePath = filePath;

      // Nếu file là .gz, giải nén trước
      if (filePath.endsWith('.gz')) {
        console.log('🗜️  Decompressing backup file...');
        sqlFilePath = filePath.replace('.gz', '');
        await this.decompressFile(filePath, sqlFilePath);
      }

      // Restore database
      console.log('📥 Restoring database...');
      const restoreCommand = this.getRestoreCommand(sqlFilePath);
      await execPromise(restoreCommand);

      // Cleanup decompressed file nếu có
      if (filePath.endsWith('.gz') && fs.existsSync(sqlFilePath)) {
        fs.unlinkSync(sqlFilePath);
      }

      console.log('✅ Restore completed successfully');
      return `Restore completed successfully from ${filePath}`;
    } catch (error) {
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  /**
   * Lấy command restore database
   */
  private getRestoreCommand(inputPath: string): string {
    const dbType = process.env.DB_TYPE || 'mysql';

    if (dbType === 'postgres') {
      return `PGPASSWORD="${process.env.DB_PASS}" psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${inputPath}`;
    } else {
      // MySQL/MariaDB
      return `mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASS} ${process.env.DB_NAME} < ${inputPath}`;
    }
  }

  /**
   * Lấy danh sách file backup
   */
  async getBackupList(type?: BackupType): Promise<{
    type: string;
    files: { fileName: string; filePath: string; size: string; createdAt: string }[];
  }[]> {
    const types: BackupType[] = type ? [type] : ['manual', 'daily', 'weekly', 'monthly'];
    const result = [];

    for (const backupType of types) {
      const typeDir = path.join(this.backupDir, backupType);

      if (!fs.existsSync(typeDir)) {
        continue;
      }

      const files = fs.readdirSync(typeDir)
        .filter(file => file.endsWith('.sql.gz'))
        .map(file => {
          const filePath = path.join(typeDir, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

          return {
            fileName: file,
            filePath,
            size: `${sizeMB} MB`,
            createdAt: stats.mtime.toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      result.push({
        type: backupType,
        files,
      });
    }

    return result;
  }

  /**
   * Xóa các backup cũ theo retention policy
   */
  async cleanupOldBackups(type: BackupType): Promise<void> {
    const typeDir = path.join(this.backupDir, type);
    const config = this.backupConfig[type];

    // Cleanup local backups
    if (fs.existsSync(typeDir)) {
      const files = fs.readdirSync(typeDir)
        .filter(file => file.endsWith('.sql.gz'))
        .map(file => ({
          name: file,
          path: path.join(typeDir, file),
          time: fs.statSync(path.join(typeDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Sắp xếp mới nhất lên đầu

      // Xóa các file cũ vượt quá maxBackups
      if (files.length > config.maxBackups) {
        const filesToDelete = files.slice(config.maxBackups);

        this.logger.log(`🗑️  Cleaning up ${filesToDelete.length} old ${type} local backups...`);

        for (const file of filesToDelete) {
          fs.unlinkSync(file.path);
          this.logger.log(`   Deleted local: ${file.name}`);
        }
      }
    }

    // Cleanup S3 backups
    if (this.s3BackupService.isEnabled()) {
      try {
        const s3Prefix = `qlcd/${type}/`;
        await this.s3BackupService.cleanupOldBackups(s3Prefix, config.maxBackups);
      } catch (s3Error) {
        this.logger.error(`⚠️  S3 cleanup failed: ${s3Error.message}`);
      }
    }
  }

  /**
   * Xóa một backup cụ thể
   */
  async deleteBackup(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Backup file not found');
    }

    fs.unlinkSync(filePath);
    return `Backup deleted: ${filePath}`;
  }

  /**
   * Lấy thông tin tổng quan về backups
   */
  async getBackupSummary(): Promise<any> {
    const summary = {
      totalBackups: 0,
      totalSize: '0 MB',
      byType: {} as any,
    };
    let totalSizeBytes = 0;

    for (const type of ['manual', 'daily', 'weekly', 'monthly']) {
      const typeDir = path.join(this.backupDir, type);

      if (!fs.existsSync(typeDir)) {
        continue;
      }

      const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.sql.gz'));
      const totalSize = files.reduce((sum, file) => {
        const stats = fs.statSync(path.join(typeDir, file));
        return sum + stats.size;
      }, 0);

      summary.byType[type] = {
        count: files.length,
        maxAllowed: this.backupConfig[type].maxBackups,
        totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
      };

      summary.totalBackups += files.length;
      totalSizeBytes += totalSize;
    }

    summary.totalSize = `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`;

    return summary;
  }
}
