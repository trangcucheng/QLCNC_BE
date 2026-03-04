import { Body, Controller, Delete, Get, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FlexibleAuthGuard } from 'src/HeThong/auth/guards/flexible-auth.guard';
import { listAllRoleDto } from 'src/HeThong/role/dto/list-all-role-dto.dto';

import { getDetailUserByRegistrationFormIdDto, getDetailUserDto, getTTCN, listAllUserDto, listUserAdminDto } from './dto/list-all-user-dto.dto';
import { updateStudentDto, updateUserDto } from './dto/user-dto.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,

  ) { }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-all')
  async listAllUser(@Query() payload: listAllUserDto) {
    return this.userService.listAllUser(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put('update')
  async updateUser(
    @Body() payload: updateUserDto
  ) {
    return await this.userService.updateUser(
      payload
    );
  }


  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Delete('delete')
  async deleteUser(@Query() payload: getTTCN) {
    return this.userService.deleteUser(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Delete('delete-user-temp')
  async deleteUserTemp(@Query() payload: getTTCN) {
    return this.userService.deleteUserTemp(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put('update-student')
  async updateStudent(
    @Body() payload: updateStudentDto
  ) {
    return await this.userService.updateStudent(
      payload
    );
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-user-admin')
  async listUserAdmin(@Query() payload: listUserAdminDto) {
    return this.userService.listUserAdmin(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('get-user')
  async getUser(@Req() req) {
    return this.userService.getUser(req.user.id);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import')
  @ApiOperation({
    summary: 'Import danh sách người dùng từ Excel',
    description: 'Upload file Excel với các cột: STT, Họ và tên, Email, SĐT, CMND/CCCD, Mật khẩu, Vai trò, Công đoàn cơ sở, Cụm khu CN, Xã phường. Nếu có lỗi, sẽ trả về file Excel đã note lỗi.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel chứa danh sách người dùng'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async importUsers(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    if (!file) {
      return res.status(400).json({
        message: 'Vui lòng upload file Excel'
      });
    }

    // Kiểm tra định dạng file
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: 'File không đúng định dạng. Vui lòng upload file Excel (.xlsx hoặc .xls)'
      });
    }

    const { result, errorFile } = await this.userService.importFromExcelFile(file);

    // Trường hợp 1: Tất cả dòng đều lỗi (không có dòng nào thành công)
    if (result.errorCount > 0 && result.successCount === 0) {
      if (errorFile) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=import-users-errors.xlsx');
        res.setHeader('X-Import-Status', 'all-failed');
        res.setHeader('X-Error-Count', result.errorCount.toString());
        return res.status(400).send(errorFile);
      }
      return res.status(400).json({
        message: 'Import thất bại - Tất cả các dòng đều có lỗi',
        data: result
      });
    }

    // Trường hợp 2: Có một số dòng lỗi (import thành công một phần)
    if (errorFile) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=import-users-errors.xlsx');
      res.setHeader('X-Import-Status', 'partial-success');
      res.setHeader('X-Success-Count', result.successCount.toString());
      res.setHeader('X-Error-Count', result.errorCount.toString());
      return res.send(errorFile);
    }

    // Trường hợp 3: Không có lỗi - Import hoàn toàn thành công
    return res.json({
      message: 'Import thành công',
      data: result
    });
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import-with-zalo-link')
  @ApiOperation({
    summary: 'Import danh sách người dùng từ Excel và tự động liên kết Zalo',
    description: `Upload file Excel với các cột: 
    - STT
    - Họ và tên
    - Email  
    - SĐT Đăng ký Zalo (sẽ dùng để liên kết với tài khoản Zalo)
    - CMND/CCCD
    - Vai trò (description từ bảng role)
    - Công đoàn cơ sở
    - ID CĐCS (nếu trống và có tên CĐCS sẽ tạo mới, nếu có ID sẽ kiểm tra tồn tại)
    - Cụm khu CN
    - ID Cụm KCN (nếu trống và có tên sẽ tạo mới, nếu có ID sẽ kiểm tra tồn tại)
    - Xã phường
    - ID xã phường (nếu trống và có tên sẽ tạo mới, nếu có ID sẽ kiểm tra tồn tại)
    - Tên tài khoản Zalo
    
    Tính năng:
    - Tự động tạo username theo vai trò:
      + CV/LD: _ + họ tên viết tắt (ví dụ: Nguyễn Đức Trường → _truongnd)
      + CDCS: cdcs_ + id công đoàn cơ sở
      + CKCN/XP: pt_ + tên viết tắt (ví dụ: pt_phuongthuanthanh)
    - Nếu user đã tồn tại (theo username), không tạo mới mà chỉ liên kết với Zalo
    - Một user có thể liên kết với nhiều tài khoản Zalo
    - Mật khẩu mặc định: Aabc@123
    - Tự động tìm và liên kết với tài khoản Zalo qua SĐT
    - Nếu có lỗi, trả về file Excel đã note lỗi và cảnh báo`
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel chứa danh sách người dùng'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async importUsersWithZaloLink(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    if (!file) {
      return res.status(400).json({
        message: 'Vui lòng upload file Excel'
      });
    }

    // Kiểm tra định dạng file
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: 'File không đúng định dạng. Vui lòng upload file Excel (.xlsx hoặc .xls)'
      });
    }

    const { result, errorFile } = await this.userService.importUsersWithZaloLinkFromExcelFile(file);

    // Trường hợp 1: Tất cả dòng đều lỗi
    if (result.errorCount > 0 && result.successCount === 0) {
      if (errorFile) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=import-users-zalo-errors.xlsx');
        res.setHeader('X-Import-Status', 'all-failed');
        res.setHeader('X-Error-Count', result.errorCount.toString());
        return res.status(400).send(errorFile);
      }
      return res.status(400).json({
        message: 'Import thất bại - Tất cả các dòng đều có lỗi',
        data: result
      });
    }

    // Trường hợp 2: Có một số dòng lỗi hoặc cảnh báo
    if (errorFile) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=import-users-zalo-warnings.xlsx');
      res.setHeader('X-Import-Status', 'partial-success');
      res.setHeader('X-Success-Count', result.successCount.toString());
      res.setHeader('X-Error-Count', result.errorCount.toString());
      res.setHeader('X-Zalo-Linked', (result.zaloLinkedCount || 0).toString());
      res.setHeader('X-Zalo-Not-Found', (result.zaloNotFoundCount || 0).toString());
      return res.send(errorFile);
    }

    // Trường hợp 3: Import hoàn toàn thành công
    return res.json({
      message: 'Import thành công',
      data: {
        ...result,
        summary: `Đã tạo ${result.successCount} tài khoản, liên kết ${result.zaloLinkedCount || 0} tài khoản Zalo`
      }
    });
  }
}
