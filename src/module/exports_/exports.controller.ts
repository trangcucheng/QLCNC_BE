import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './exports.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('/users/pdf')
  async exportPdf(@Res() res: Response) {
    const result = await this.exportService.exportUsersPdf();
    return res.download(result.file);
  }

  @Get('/users/docx')
  async exportDocx(@Res() res: Response) {
    const result = await this.exportService.exportUsersDocx();
    return res.download(result.file);
  }
}
