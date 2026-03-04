import { Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { createStaffDto, updateStaffDto } from './dto/create-staff-dto.dto';
import { getDetailStaffDto, listAllStaffDto } from './dto/list-all-staff-dto.dto';
import { StaffService } from './staff.service';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService
  ) { }


  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiBody({ type: createStaffDto })
  async create(@Body() payload: createStaffDto) {
    return this.staffService.createStaff(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-all')
  async listAllStaff(@Req() req: any, @Query() payload: listAllStaffDto) {
    const userID = req.user?.userId || req.user?.id;
    return this.staffService.listAllStaff(userID, payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('detail')
  async getDetailStaff(@Query() payload: getDetailStaffDto) {
    return this.staffService.getDetailStaff(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  async updateStaff(
    @Body() payload: updateStaffDto
  ) {
    return await this.staffService.updateStaff(
      payload
    );
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  async deleteStaff(@Query() payload: getDetailStaffDto) {
    return this.staffService.deleteStaff(payload);
  }

  @Get('image/:imageName')
  async getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    const imagePath = path.join(process.cwd(), 'imageStaff', imageName);
    if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath);
    } else {
      return res.status(404).json({ message: 'Image not found' });
    }
  }
}
