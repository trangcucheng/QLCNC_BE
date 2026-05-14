import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { BackupCronService } from 'src/log/backup/backup-cron.service';

@Module({
  imports: [ConfigModule],
  providers: [BackupService, BackupCronService],
  controllers: [BackupController],
})
export class BackupModule { }
