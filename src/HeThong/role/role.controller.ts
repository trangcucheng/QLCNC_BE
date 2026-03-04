import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/HeThong/auth/guards/flexible-auth.guard';

import { getDetailRoleDto, listAllRoleDto } from './dto/list-all-role-dto.dto';
import { createRoleDto, updateRoleDto } from './dto/role-dto.dto';
import { RoleService } from './role.service';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService
  ) { }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  async createRole(
    @Body() payload: createRoleDto
  ) {
    return this.roleService.createRole(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-all')
  async listAllRole(@Query() payload: listAllRoleDto) {
    return this.roleService.listAllRole(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('detail')
  async getDetailRole(@Query() payload: getDetailRoleDto) {
    return this.roleService.getDetailRole(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('update')
  async updateRole(
    @Body() payload: updateRoleDto
  ) {
    return await this.roleService.updateRole(
      payload
    );
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('delete')
  async deleteRole(@Query() payload: getDetailRoleDto) {
    return this.roleService.deleteRole(payload);
  }

}
