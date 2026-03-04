import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../../databases/entities/Organization.entity';
import { Role } from '../../databases/entities/role.entity';
import { User } from '../../databases/entities/user.entity';
import { createStaffDto, updateStaffDto } from './dto/create-staff-dto.dto';
import { getDetailStaffDto, listAllStaffDto } from './dto/list-all-staff-dto.dto';
import { StaffRepository } from './staff.repository';

@Injectable()
export class StaffService {

  constructor(
    private readonly staffRepository: StaffRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) { }

  async createStaff(input: createStaffDto) {
    try {
      const newStaff = this.staffRepository.create(input);
      return await this.staffRepository.save(newStaff);
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo cán bộ!')
    }
  }

  async listAllStaff(userID: string, payload: listAllStaffDto) {
    const { search, limit, page, organizationId } = payload;

    // Lấy thông tin user để phân quyền
    const userDetail = await this.userRepository.findOne({ where: { id: userID } });
    if (!userDetail) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng!');
    }

    const role = await this.roleRepository.findOne({ where: { id: userDetail.roleId } });
    if (!role) {
      throw new BadRequestException('Không tìm thấy thông tin quyền!');
    }

    const isAdmin = ['ADMIN', 'QT', 'LD', 'CV'].includes(role.description);

    const listStaff = this.staffRepository
      .createQueryBuilder('s')
      .select([
        's.*',
        'org.name as organizationName',
        'cv.tenChucVu as chucVuName'
      ])
      .leftJoin('organization', 'org', 's.organizationId = org.id')
      .leftJoin('chuc_vu', 'cv', 's.chucVuId = cv.id')
      .orderBy('s.id', 'ASC')
      .limit(limit)
      .offset(limit * (page - 1));

    // Phân quyền theo organization
    if (!isAdmin) {
      if (userDetail.organizationId && !userDetail.cumKhuCnId && !userDetail.xaPhuongId) {
        // Lấy danh sách organizationIds bao gồm org hiện tại và các org con
        const childrenIds = await this.getChildrenOrgIds(userDetail.organizationId);
        const orgIds = [userDetail.organizationId, ...childrenIds];
        listStaff.andWhere('s.organizationId IN (:...orgIds)', { orgIds });
      } else if (userDetail.cumKhuCnId) {
        // Nếu user thuộc cụm KCN, lấy cán bộ của các CĐCS trong cụm đó
        listStaff.andWhere('org.cumKhuCnId = :cumKhuCnId', { cumKhuCnId: userDetail.cumKhuCnId });
      } else if (userDetail.xaPhuongId) {
        // Nếu user thuộc xã phường, lấy cán bộ của các CĐCS trong xã đó
        listStaff.andWhere('org.xaPhuongId = :xaPhuongId', { xaPhuongId: userDetail.xaPhuongId });
      } else {
        // User không thuộc org/cụm/xã nào → không có quyền xem
        return { list: [], count: 0 };
      }
    }

    if (search) {
      listStaff.andWhere(
        `(
          s.name LIKE :search OR
          s.phone LIKE :search OR
          org.name LIKE :search OR
          cv.tenChucVu LIKE :search
        )`,
        { search: `%${search}%` }
      );
    }

    if (organizationId) {
      listStaff.andWhere('s.organizationId = :organizationId', { organizationId });
    }

    try {
      const [list, count] = await Promise.all([
        listStaff.getRawMany(),
        listStaff.getCount()
      ]);

      return { list, count };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi lấy danh sách cán bộ!')
    }
  }

  /**
   * Lấy danh sách ID của các organization con (đệ quy 3 cấp)
   */
  private async getChildrenOrgIds(parentId: number): Promise<number[]> {
    const data: { id: number; o1id: number; o2id: number }[] = await this.organizationRepository
      .createQueryBuilder('o')
      .where('o.organizationParentId = :parentId', { parentId })
      .select('o.id', 'id')
      .leftJoin(Organization, 'o1', 'o1.organizationParentId = o.id')
      .addSelect('o1.id', 'o1id')
      .leftJoin(Organization, 'o2', 'o2.organizationParentId = o1.id')
      .addSelect('o2.id', 'o2id')
      .getRawMany();

    const ids = new Set<number>();
    data.forEach((o) => {
      Object.values(o).forEach((v) => {
        if (v) ids.add(v);
      });
    });

    return Array.from(ids);
  }

  async getDetailStaff(payload: getDetailStaffDto) {
    const { StaffId } = payload;
    const staff = await this.staffRepository
      .createQueryBuilder('s')
      .select([
        's.*',
        'org.name as organizationName',
        'cv.tenChucVu as chucVuName'
      ])
      .leftJoin('organization', 'org', 's.organizationId = org.id')
      .leftJoin('chuc_vu', 'cv', 's.chucVuId = cv.id')
      .where('s.id = :StaffId', { StaffId })
      .getRawOne();

    if (!staff) {
      throw new BadRequestException('Không tìm thấy cán bộ');
    }

    return staff;
  }

  async updateStaff(payload: updateStaffDto) {
    const findStaffById = await this.staffRepository.findOne(payload.id);
    if (!findStaffById) {
      throw new BadRequestException('Không tìm thấy cán bộ cần cập nhật');
    }
    const updatedItem = { ...findStaffById, ...payload };
    return await this.staffRepository.save(updatedItem);
  }

  async deleteStaff(payload: getDetailStaffDto) {
    const { StaffId } = payload;
    const staff = await this.staffRepository.findOne(StaffId);
    if (!staff) {
      throw new BadRequestException('Không tìm thấy cán bộ cần xóa');
    }
    await this.staffRepository.remove(staff);
    return { status: 200, message: 'Xóa cán bộ thành công!' };
  }
}
