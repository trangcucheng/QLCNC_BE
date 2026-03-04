import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/databases/entities/role.entity';
import { User } from 'src/databases/entities/user.entity';
import { Repository } from 'typeorm';

import { getDetailRoleDto, listAllRoleDto } from './dto/list-all-role-dto.dto';
import { createRoleDto, updateRoleDto } from './dto/role-dto.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }
  async createRole(input: createRoleDto) {
    try {
      const newRole = this.roleRepository.create(input);
      return await newRole.save();
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra!')
    }

  }

  async listAllRole(payload: listAllRoleDto) {
    const { search, limit, page } = payload;
    const listRole = this.roleRepository
      .createQueryBuilder('b')
      .select('b.*')
      .orderBy('b.id', 'ASC')
      .limit(limit)
      .offset(limit * (page - 1));
    if (search) {
      //viết hết tất car các trường cần tìm kiếm
      listRole.andWhere(
        '( b.name LIKE :search OR b.description LIKE :search )',
        { search: `%${search}%` }
      );
    }
    try {
      const [list, count] = await Promise.all([
        listRole.getRawMany(),
        listRole.getCount()
      ]);
      for (const item of list) {
        const countUser = await this.userRepository.count({ roleId: item.id });
        item.countUser = countUser;
      }

      return { list, count };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra!')
    }

  }

  async getDetailRole(payload: getDetailRoleDto) {
    const { roleId } = payload;

    // Sử dụng cú pháp TypeORM mới và select tất cả fields
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      select: ['id', 'name', 'isActive', 'permissions', 'description', 'createdAt', 'updatedAt']
    });

    if (!role) {
      throw new BadRequestException('Role không tồn tại');
    }

    // Log để debug permissions field
    console.log(`🔍 Role ${roleId} permissions length:`, role.permissions?.length);
    console.log(`🔍 Role ${roleId} permissions data:`, role.permissions);

    return role;
  }

  async updateRole(payload: updateRoleDto) {
    // Sử dụng cú pháp TypeORM mới
    const findRoleById = await this.roleRepository.findOne({
      where: { id: payload.roleId }
    });

    if (!findRoleById) {
      throw new BadRequestException("Role_is_not_exist");
    }

    // Log để debug permissions update
    if (payload.permissions) {
      console.log(`🔍 Updating role ${payload.roleId} permissions:`, payload.permissions?.length, 'chars');
    }

    const updatedItem = { ...findRoleById, ...payload };
    return await this.roleRepository.save(updatedItem);
  }

  async deleteRole(payload: getDetailRoleDto) {
    const { roleId } = payload;

    // Sử dụng cú pháp TypeORM mới
    const role = await this.roleRepository.findOne({
      where: { id: roleId }
    });

    if (!role) {
      throw new BadRequestException("Role_is_not_exist");
    }

    await this.roleRepository.remove(role);
    return { status: 200, message: 'Xóa thành công!' };
  }
}
