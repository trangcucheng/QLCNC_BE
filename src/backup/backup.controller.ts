import { Body, Controller, Get, Post } from '@nestjs/common';
import { BackupService } from './backup.service';
import { Permissions } from 'src/decorator/permissions.decorator';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Backup & Restore')
@ApiBearerAuth('access-token')
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) { }

  @Get('/list')
  @Permissions('backup:read')
  @ApiOperation({ summary: 'Lấy danh sách file backup' })
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Post('/manual')
  @Permissions('backup:create')
  @ApiOperation({ summary: 'Sao lưu dữ liệu thủ công' })
  async manualBackup() {
    return this.backupService.backupDatabase();
  }

  @Post('/restore')
  @Permissions('backup:restore')
  @ApiOperation({ summary: 'Khôi phục dữ liệu từ file backup' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        backupFileName: { type: 'string' },
      },
      required: ['backupFileName'],
    },
  })
  async restoreDatabase(@Body('backupFileName') backupFileName: string) {
    return this.backupService.restoreDatabase(backupFileName);
  }
}
