import { DeleteObjectCommand,GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3BackupService {
  private readonly logger = new Logger(S3BackupService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private enabled: boolean;

  constructor() {
    // Kiểm tra xem có config AWS không
    this.enabled = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_BACKUP_BUCKET
    );

    if (this.enabled) {
      this.bucketName = process.env.AWS_BACKUP_BUCKET;
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'ap-southeast-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.logger.log(`✅ S3 Backup enabled - Bucket: ${this.bucketName}`);
    } else {
      this.logger.warn('⚠️  S3 Backup disabled - Missing AWS credentials');
    }
  }

  /**
   * Upload file backup lên S3
   */
  async uploadBackup(localFilePath: string, s3Key?: string): Promise<string> {
    if (!this.enabled) {
      this.logger.warn('S3 Backup is disabled - skipping upload');
      return null;
    }

    try {
      // S3 key: qlcd/daily/backup-daily-2024-01-15T02-00-00.sql.gz
      const key = s3Key || `qlcd/${path.basename(path.dirname(localFilePath))}/${path.basename(localFilePath)}`;

      this.logger.log(`☁️  Uploading to S3: ${key}...`);

      const fileStream = fs.createReadStream(localFilePath);
      const stats = fs.statSync(localFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      // Sử dụng Upload để hỗ trợ multipart upload cho file lớn
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileStream,
          ContentType: 'application/gzip',
          ServerSideEncryption: 'AES256', // Encrypt at rest
          StorageClass: 'STANDARD_IA', // Infrequent Access - rẻ hơn cho backup
          Metadata: {
            'original-name': path.basename(localFilePath),
            'uploaded-at': new Date().toISOString(),
            'file-size-mb': fileSizeMB,
          },
        },
      });

      await upload.done();

      this.logger.log(`✅ S3 upload completed: s3://${this.bucketName}/${key} (${fileSizeMB} MB)`);

      return key;
    } catch (error) {
      this.logger.error(`❌ S3 upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Download backup từ S3
   */
  async downloadBackup(s3Key: string, localFilePath: string): Promise<string> {
    if (!this.enabled) {
      throw new Error('S3 Backup is disabled');
    }

    try {
      this.logger.log(`☁️  Downloading from S3: ${s3Key}...`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);
      const writeStream = fs.createWriteStream(localFilePath);

      await new Promise((resolve, reject) => {
        // AWS SDK v3 returns a readable stream that needs to be cast
        const readableStream = response.Body as any;
        readableStream.pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject);
      });

      const stats = fs.statSync(localFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      this.logger.log(`✅ S3 download completed: ${localFilePath} (${fileSizeMB} MB)`);

      return localFilePath;
    } catch (error) {
      this.logger.error(`❌ S3 download failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lấy danh sách backups trên S3
   */
  async listBackups(prefix = 'qlcd/'): Promise<any[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      return response.Contents.map(item => ({
        key: item.Key,
        size: `${(item.Size / (1024 * 1024)).toFixed(2)} MB`,
        lastModified: item.LastModified.toISOString(),
        storageClass: item.StorageClass,
      })).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    } catch (error) {
      this.logger.error(`❌ S3 list failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Xóa backup trên S3
   */
  async deleteBackup(s3Key: string): Promise<void> {
    if (!this.enabled) {
      throw new Error('S3 Backup is disabled');
    }

    try {
      this.logger.log(`🗑️  Deleting from S3: ${s3Key}...`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.s3Client.send(command);

      this.logger.log(`✅ S3 delete completed: ${s3Key}`);
    } catch (error) {
      this.logger.error(`❌ S3 delete failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cleanup backups cũ trên S3 theo retention policy
   */
  async cleanupOldBackups(prefix: string, maxBackups: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const backups = await this.listBackups(prefix);

      if (backups.length <= maxBackups) {
        this.logger.log(`No cleanup needed - ${backups.length} backups (max: ${maxBackups})`);
        return;
      }

      const backupsToDelete = backups.slice(maxBackups);

      this.logger.log(`🗑️  Cleaning up ${backupsToDelete.length} old S3 backups...`);

      for (const backup of backupsToDelete) {
        await this.deleteBackup(backup.key);
        this.logger.log(`   Deleted: ${backup.key}`);
      }

      this.logger.log(`✅ S3 cleanup completed`);
    } catch (error) {
      this.logger.error(`❌ S3 cleanup failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Kiểm tra S3 có được enable không
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Test S3 connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.enabled) {
      return {
        success: false,
        message: 'S3 Backup is disabled - Missing AWS credentials',
      };
    }

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);

      return {
        success: true,
        message: `S3 connection successful - Bucket: ${this.bucketName}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `S3 connection failed: ${error.message}`,
      };
    }
  }
}
