import { Module } from '@nestjs/common';

import { BackupCronService } from './backup-cron.service';
import { BackupRestoreController } from './backup-restore.controller';
import { BackupRestoreService } from './backup-restore.service';
import { S3BackupService } from './s3-backup.service';

@Module({
  controllers: [BackupRestoreController],
  providers: [BackupRestoreService, BackupCronService, S3BackupService],
  exports: [BackupRestoreService, S3BackupService],
})
export class BackupRestoreModule { }
