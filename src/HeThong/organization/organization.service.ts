import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { OrganizationFieldSchema } from 'src/databases/entities/OrganizationFieldSchema.entity';
import { Role } from 'src/databases/entities/role.entity';
import { User } from 'src/databases/entities/user.entity';
import { XaPhuong } from 'src/databases/entities/XaPhuong.entity';
import { UserService } from 'src/HeThong/user/user.service';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

import { createOrganizationDto, updateOrganizationDto } from './dto/create-organization-dto.dto';
import { CreateDynamicFieldDto, UpdateDynamicFieldDto, UpdateOrganizationWithDynamicFieldsDto } from './dto/dynamic-field.dto';
import { ImportMultiSheetResultDto, ImportOrganizationRowDto as MultiSheetRowDto, ImportSheetDto } from './dto/import-multi-sheet.dto';
import { ImportOrganizationDto, ImportOrganizationRowDto, ImportResultDto } from './dto/import-organization.dto';
import { getDetailOrganizationDto, listAllOrganizationDto } from './dto/list-all-organization-dto.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OrganizationFieldSchema)
    private readonly fieldSchemaRepository: Repository<OrganizationFieldSchema>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(CumKhuCongNghiep)
    private readonly cumKhuCongNghiepRepository: Repository<CumKhuCongNghiep>,
    @InjectRepository(XaPhuong)
    private readonly xaPhuongRepository: Repository<XaPhuong>,
    private readonly userService: UserService,
  ) { }

  async createOrganization(input: createOrganizationDto) {
    try {
      const newOrganization = this.organizationRepository.create(input);

      if (input.organizationParentId) {
        const parent = await this.organizationRepository.findOne({
          where: { id: input.organizationParentId }
        });
        if (parent) {
          newOrganization.organizationLevel = parent.organizationLevel + 1;
        } else {
          throw new BadRequestException('Không tìm thấy tổ chức cha');
        }
      } else {
        newOrganization.organizationLevel = 1;
      }

      await this.organizationRepository.save(newOrganization);
      return newOrganization;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi tạo tổ chức!');
    }
  }

  async listAllOrganization(userID: string, payload: listAllOrganizationDto) {
    const { search, limit, page, cumKhuCnId, xaPhuongId } = payload;

    const userDetail = await this.userRepository.findOne({ where: { id: userID } });
    if (!userDetail) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng!');
    }

    const role = await this.roleRepository.findOne({ where: { id: userDetail.roleId } });
    if (!role) {
      throw new BadRequestException('Không tìm thấy thông tin quyền!');
    }

    const check = 0;
    let checkAdmin = 0;
    if (['ADMIN', 'QT', 'LD', 'CV'].includes(role.description)) {
      checkAdmin = 1;
    }
    const listOrganization = this.organizationRepository
      .createQueryBuilder('u')
      .select([
        'u.*',
        'p.name as parentName',
        'ckh.ten as cumKhuCongNghiepName',
        'xp.ten as xaPhuongName'
      ])
      .leftJoin('Organization', 'p', 'p.id = u.organizationParentId')
      .leftJoin('CumKhuCongNghiep', 'ckh', 'ckh.id = u.cumKhuCnId')
      .leftJoin('XaPhuong', 'xp', 'xp.id = u.xaPhuongId')
      .limit(limit)
      .offset(limit * (page - 1));
    if (search) {
      listOrganization.andWhere(
        '(u.name LIKE :search OR u.diaChi LIKE :search OR p.name LIKE :search OR u.ghiChu LIKE :search OR ckh.ten LIKE :search OR xp.ten LIKE :search)',
        { search: `%${search}%` }
      );
    }
    if (cumKhuCnId) {
      listOrganization.andWhere('u.cumKhuCnId = :cumKhuCnId', { cumKhuCnId });
    }
    if (xaPhuongId) {
      listOrganization.andWhere('u.xaPhuongId = :xaPhuongId', { xaPhuongId });
    }
    if (checkAdmin === 0) {
      if (userDetail) {
        // const listAllOrganization = await this.organizationRepository.find();
        // const parentId = Number(userDetail.organizationId);
        // const listID = await this.findListIDByParent(listAllOrganization, parentId);
        // listID.push(parentId);
        // listOrganization.andWhere('u.id IN (:...listID)', { listID: listID });
        if (userDetail.cumKhuCnId) {
          listOrganization.andWhere('u.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          listOrganization.andWhere('u.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    try {
      const [list, count] = await Promise.all([listOrganization.getRawMany(), listOrganization.getCount()]);
      console.log(list);
      // Lấy schema của dynamic fields để format data
      const dynamicFieldSchemas = await this.getAllDynamicFields();

      // Format list với dynamic fields
      const formattedList = list.map(org => {
        const dynamicFields = org.dynamicFields ? JSON.parse(org.dynamicFields) : {};
        const formattedDynamicFields = {};

        // Format dynamic fields với schema info
        dynamicFieldSchemas.forEach(schema => {
          formattedDynamicFields[schema.fieldKey] = {
            value: dynamicFields[schema.fieldKey] || schema.defaultValue || null,
            fieldName: schema.fieldName,
            fieldType: schema.fieldType,
            isRequired: schema.isRequired
          };
        });

        return {
          ...org,
          dynamicFields: dynamicFields, // Raw dynamic fields
          formattedDynamicFields: formattedDynamicFields // Formatted với schema
        };
      });

      return {
        list: formattedList,
        count,
        dynamicFieldSchemas // Include schema info để FE biết cách render
      };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra!');
    }
  }



  async listAll() {
    const rawList = await this.organizationRepository
      .createQueryBuilder('u')
      .select([
        'u.*',
        'p.name as parentName',
        'ckh.ten as cumKhuCongNghiepName',
        'xp.ten as xaPhuongName'
      ])
      .leftJoin('Organization', 'p', 'p.id = u.organizationParentId')
      .leftJoin('CumKhuCongNghiep', 'ckh', 'ckh.id = u.cumKhuCnId')
      .leftJoin('XaPhuong', 'xp', 'xp.id = u.xaPhuongId')
      .orderBy('u.name', 'ASC')
      .getRawMany();

    // Format với dynamic fields
    const dynamicFieldSchemas = await this.getAllDynamicFields();

    const formattedList = rawList.map(org => {
      let dynamicFields = {};
      try {
        if (org.dynamicFields && typeof org.dynamicFields === 'string' && org.dynamicFields.trim().length > 0) {
          dynamicFields = JSON.parse(org.dynamicFields);
        }
      } catch (error) {
        console.error('Error parsing dynamicFields for organization:', org.id, 'Data:', org.dynamicFields, 'Error:', error.message);
        dynamicFields = {};
      }
      const formattedDynamicFields = {};

      dynamicFieldSchemas.forEach(schema => {
        formattedDynamicFields[schema.fieldKey] = {
          value: dynamicFields[schema.fieldKey] || schema.defaultValue || null,
          fieldName: schema.fieldName,
          fieldType: schema.fieldType
        };
      });

      return {
        ...org,
        dynamicFields: dynamicFields,
        formattedDynamicFields: formattedDynamicFields
      };
    });

    return formattedList;
  }

  async listAllChildOrganizationByParentid(payload: getDetailOrganizationDto) {
    const listAllOrganization = await this.organizationRepository.find();
    const listID = await this.findListIDByParent(listAllOrganization, payload.organizationID);
    return listID;
  }

  async childrenOrgIds(parentId: number): Promise<number[]> {
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

  async getDetailOrganization(payload: getDetailOrganizationDto) {
    try {
      const { organizationID } = payload;
      const organization = await this.organizationRepository
        .createQueryBuilder('u')
        .select([
          'u.*',
          'p.name as parentName',
          'ckh.ten as cumKhuCongNghiepName',
          'xp.ten as xaPhuongName'
        ])
        .leftJoin('Organization', 'p', 'p.id = u.organizationParentId')
        .leftJoin('CumKhuCongNghiep', 'ckh', 'ckh.id = u.cumKhuCnId')
        .leftJoin('XaPhuong', 'xp', 'xp.id = u.xaPhuongId')
        .where('u.id = :id', { id: organizationID })
        .getRawOne();

      if (!organization) {
        throw new BadRequestException('Không tìm thấy tổ chức');
      }
      return organization;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi lấy thông tin tổ chức');
    }
  }

  async updateOrganization(payload: updateOrganizationDto) {
    try {
      const findOrganByOrganId = await this.organizationRepository.findOne({
        where: { id: payload.id }
      });
      if (!findOrganByOrganId) {
        throw new BadRequestException('Không tìm thấy tổ chức cần cập nhật');
      }

      if (payload.organizationParentId) {
        const parent = await this.organizationRepository.findOne({
          where: { id: payload.organizationParentId }
        });
        if (parent) {
          findOrganByOrganId.organizationLevel = parent.organizationLevel + 1;
        } else {
          throw new BadRequestException('Không tìm thấy tổ chức cha');
        }
      } else {
        findOrganByOrganId.organizationLevel = 1;
      }

      const updatedItem = { ...findOrganByOrganId, ...payload };
      return await this.organizationRepository.save(updatedItem);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật tổ chức');
    }
  }

  async deleteOrganization(payload: getDetailOrganizationDto) {
    const { organizationID } = payload;
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationID }
    });
    if (!organization) {
      throw new BadRequestException('Không tìm thấy tổ chức cần xóa!');
    }

    const findChildren = await this.organizationRepository.findOne({
      where: { organizationParentId: organizationID }
    });
    if (findChildren) {
      throw new BadRequestException('Đơn vị này có cấp con nên không thể xóa!');
    }

    await this.organizationRepository.remove(organization);
    return { status: 200, message: 'Xóa tổ chức thành công!' };
  }

  async findListIDByParent(list: Array<Organization>, parentId: number): Promise<number[]> {
    let listOrg = new Array<number>();

    for (const item of list) {
      if (item.organizationParentId === parentId) {
        listOrg.push(item.id);
        listOrg = listOrg.concat(await this.findListIDByParent(list, item.id));
      }
    }
    return listOrg;
  }

  // async FlatToHierarchy(list: Array<TreeOrganization>, parentId: number): Promise<TreeOrganization[]> {
  //   const listOr = new Array<TreeOrganization>();
  //   for (const item of list) {
  //     if (item.type === 0) {
  //       const newTreeOr = new TreeOrganization();
  //       item.type = 2;
  //       newTreeOr.id = item.id;
  //       newTreeOr.key = item.id;
  //       newTreeOr.organizationAddress = item.organizationAddress || '';
  //       newTreeOr.organizationCode = `ORG-${item.id}` || ''; // Generate code since it's not in new entity
  //       newTreeOr.organizationDescription = item.organizationDescription || '';
  //       newTreeOr.organizationLevelID = item.organizationLevelID || 0;
  //       newTreeOr.organizationName = item.organizationName || '';
  //       newTreeOr.organizationParent = item.organizationParent || 0;
  //       newTreeOr.label = item.organizationName || '';
  //       newTreeOr.parentName = item.parentName || '';
  //       newTreeOr.organizationLevelName = item.organizationLevelName || '';
  //       newTreeOr.children = await this.FlatToHierarchy(list, item.id);
  //       listOr.push(newTreeOr);
  //     } else if (item.type === -1) {
  //       const newTreeOr = new TreeOrganization();
  //       item.type = 2;
  //       newTreeOr.id = item.id;
  //       newTreeOr.key = item.id;
  //       newTreeOr.organizationAddress = item.organizationAddress || '';
  //       newTreeOr.organizationCode = `ORG-${item.id}` || '';
  //       newTreeOr.organizationDescription = item.organizationDescription || '';
  //       newTreeOr.organizationLevelID = item.organizationLevelID || 0;
  //       newTreeOr.organizationName = item.organizationName || '';
  //       newTreeOr.organizationParent = item.organizationParent || 0;
  //       newTreeOr.label = item.organizationName || '';
  //       newTreeOr.parentName = item.parentName || '';
  //       newTreeOr.organizationLevelName = item.organizationLevelName || '';
  //       newTreeOr.children = await this.FlatToHierarchy(list, item.id);
  //       listOr.push(newTreeOr);
  //     } else if (item.organizationParent === parentId && item.type === 1) {
  //       const newTreeOr = new TreeOrganization();
  //       newTreeOr.id = item.id;
  //       newTreeOr.key = item.id;
  //       newTreeOr.organizationAddress = item.organizationAddress || '';
  //       newTreeOr.organizationCode = `ORG-${item.id}` || '';
  //       newTreeOr.organizationDescription = item.organizationDescription || '';
  //       newTreeOr.organizationLevelID = item.organizationLevelID || 0;
  //       newTreeOr.organizationName = item.organizationName || '';
  //       newTreeOr.organizationParent = item.organizationParent || 0;
  //       newTreeOr.label = item.organizationName || '';
  //       newTreeOr.parentName = item.parentName || '';
  //       newTreeOr.organizationLevelName = item.organizationLevelName || '';
  //       newTreeOr.children = await this.FlatToHierarchy(list, item.id);
  //       listOr.push(newTreeOr);
  //     }
  //   }
  //   return listOr;
  // }

  // async listOrgPhanCap(userID: string, payload: listAllOrganizationPcDto) {
  //   const { limit, page, search } = payload;
  //   const userDetail = await this.userRepository.findOne({ where: { id: userID } });
  //   if (!userDetail) {
  //     throw new BadRequestException('Không tìm thấy thông tin người dùng');
  //   }

  //   const role = await this.roleRepository.findOne({ where: { id: userDetail.roleId } });
  //   if (!role) {
  //     throw new BadRequestException('Không tìm thấy thông tin quyền người dùng');
  //   }
  //   let checkAdmin = 0;

  //   if (role.name === 'ADMIN') {
  //     checkAdmin = 1;
  //   }
  //   const listOrganization = this.organizationRepository
  //     .createQueryBuilder('u')
  //     .select([
  //       'u.id as id',
  //       'u.name as organizationName',
  //       'u.diaChi as organizationAddress',
  //       'u.ghiChu as organizationDescription',
  //       'u.organizationParentId as organizationParent',
  //       'u.organizationLevel as organizationLevel',
  //       'u.createdAt as createdAt',
  //       'u.updatedAt as updatedAt',
  //       'p.name as parentName'
  //     ])
  //     .leftJoin('Organization', 'p', 'p.id = u.organizationParentId')
  //     .limit(limit)
  //     .offset(limit * (page - 1));
  //   if (search) {
  //     listOrganization.andWhere(
  //       '(u.name LIKE :search OR u.diaChi LIKE :search OR u.ghiChu LIKE :search)',
  //       { search: `%${search}%` }
  //     );
  //   }

  //   if (checkAdmin === 0) {
  //     if (userDetail) {
  //       const childrenIds = await this.childrenOrgIds(userDetail.organizationId);
  //       const orgIds = [userDetail.organizationId, ...childrenIds];
  //       listOrganization.andWhere('u.id IN (:listID)', { listID: orgIds });
  //     }
  //   }

  //   const [listOr, count] = await Promise.all([listOrganization.getRawMany(), listOrganization.getCount()]);

  //   const listParentID = new Array<number>();
  //   for (const item of listOr) {
  //     listParentID.push(item.id);
  //   }
  //   const lst_TreeObj = new Array<TreeOrganization>();
  //   for (const item of listOr) {
  //     const newTreeOr = new TreeOrganization();
  //     const parent = await this.organizationRepository.findOne({
  //       where: { id: item.organizationParent }
  //     });
  //     if (!parent) {
  //       newTreeOr.type = 0;
  //     } else if (!listParentID.includes(parent.id)) {
  //       newTreeOr.type = -1;
  //     } else {
  //       newTreeOr.type = 1;
  //     }
  //     newTreeOr.id = item.id;
  //     newTreeOr.key = item.id;
  //     newTreeOr.organizationAddress = item.organizationAddress || '';
  //     newTreeOr.organizationCode = `ORG-${item.id}`;
  //     newTreeOr.organizationDescription = item.organizationDescription || '';
  //     newTreeOr.organizationLevelID = item.organizationLevel || 0;
  //     newTreeOr.organizationName = item.organizationName || '';
  //     newTreeOr.label = item.organizationName || '';
  //     newTreeOr.organizationParent = item.organizationParent || 0;
  //     newTreeOr.organizationTypeID = 0; // Default since not in new entity
  //     newTreeOr.organizationTypeName = ''; // Default since not in new entity
  //     newTreeOr.parentName = item.parentName || '';
  //     newTreeOr.organizationLevelName = `Cấp ${item.organizationLevel || 1}`;
  //     lst_TreeObj.push(newTreeOr);
  //   }

  //   const fthOrg = await this.FlatToHierarchy(lst_TreeObj, 0);
  //   return { fthOrg, count };
  // }

  // ==================== DYNAMIC FIELDS METHODS ====================

  async createDynamicField(input: CreateDynamicFieldDto) {
    try {
      const existingField = await this.fieldSchemaRepository.findOne({
        where: { fieldKey: input.fieldKey }
      });

      if (existingField) {
        throw new BadRequestException('Field key đã tồn tại');
      }

      const newField = this.fieldSchemaRepository.create(input);
      return await this.fieldSchemaRepository.save(newField);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi tạo field động');
    }
  }

  async updateDynamicField(input: UpdateDynamicFieldDto) {
    try {
      const field = await this.fieldSchemaRepository.findOne({
        where: { id: input.id }
      });

      if (!field) {
        throw new BadRequestException('Không tìm thấy field');
      }

      const updatedField = { ...field, ...input };
      return await this.fieldSchemaRepository.save(updatedField);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật field động');
    }
  }

  async deleteDynamicField(fieldId: number) {
    try {
      const field = await this.fieldSchemaRepository.findOne({
        where: { id: fieldId }
      });

      if (!field) {
        throw new BadRequestException('Không tìm thấy field');
      }

      // Xóa data của field này khỏi tất cả organizations
      await this.organizationRepository
        .createQueryBuilder()
        .update()
        .set({
          dynamicFields: () => `JSON_REMOVE(dynamicFields, '$.${field.fieldKey}')`
        })
        .where('JSON_EXTRACT(dynamicFields, :path) IS NOT NULL', {
          path: `$.${field.fieldKey}`
        })
        .execute();

      await this.fieldSchemaRepository.remove(field);
      return { message: 'Xóa field thành công' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi xóa field động');
    }
  }

  async getAllDynamicFields() {
    return await this.fieldSchemaRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' }
    });
  }

  async updateOrganizationWithDynamicFields(input: UpdateOrganizationWithDynamicFieldsDto) {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { id: input.id }
      });

      if (!organization) {
        throw new BadRequestException('Không tìm thấy tổ chức');
      }

      // Validate dynamic fields theo schema
      if (input.dynamicFields) {
        await this.validateDynamicFields(input.dynamicFields);
      }

      // Merge dynamic fields với existing data
      const existingDynamicFields = organization.dynamicFields || {};
      const updatedDynamicFields = {
        ...existingDynamicFields,
        ...input.dynamicFields
      };

      const updatedOrganization = {
        ...organization,
        ...input,
        dynamicFields: updatedDynamicFields
      };

      return await this.organizationRepository.save(updatedOrganization);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật tổ chức');
    }
  }

  private async validateDynamicFields(dynamicFields: Record<string, any>) {
    const fieldSchemas = await this.getAllDynamicFields();

    for (const schema of fieldSchemas) {
      const value = dynamicFields[schema.fieldKey];

      // Check required fields
      if (schema.isRequired && (value === undefined || value === null || value === '')) {
        throw new BadRequestException(`Field '${schema.fieldName}' là bắt buộc`);
      }

      // Validate field type
      if (value !== undefined && value !== null) {
        switch (schema.fieldType) {
          case 'number':
            if (isNaN(Number(value))) {
              throw new BadRequestException(`Field '${schema.fieldName}' phải là số`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new BadRequestException(`Field '${schema.fieldName}' phải là boolean`);
            }
            break;
          case 'date':
            if (!Date.parse(value)) {
              throw new BadRequestException(`Field '${schema.fieldName}' phải là ngày hợp lệ`);
            }
            break;
          case 'select':
            if (schema.fieldOptions?.options && !schema.fieldOptions.options.includes(value)) {
              throw new BadRequestException(`Field '${schema.fieldName}' có giá trị không hợp lệ`);
            }
            break;
        }
      }
    }
  }

  async getOrganizationWithDynamicFields(organizationId: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new BadRequestException('Không tìm thấy tổ chức');
    }

    const fieldSchemas = await this.getAllDynamicFields();

    // Format dynamic fields với schema info
    const formattedDynamicFields = {};
    for (const schema of fieldSchemas) {
      formattedDynamicFields[schema.fieldKey] = {
        value: organization.dynamicFields?.[schema.fieldKey] || schema.defaultValue,
        schema: {
          fieldName: schema.fieldName,
          fieldType: schema.fieldType,
          isRequired: schema.isRequired,
          fieldOptions: schema.fieldOptions
        }
      };
    }

    return {
      ...organization,
      formattedDynamicFields
    };
  }

  async importOrganizations(importData: ImportOrganizationDto): Promise<ImportResultDto> {
    const result: ImportResultDto = {
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdIds: []
    };

    // Cache để tránh query nhiều lần
    const cumKhuCnCache = new Map<string, number>();
    const xaPhuongCache = new Map<string, number>();

    for (let i = 0; i < importData.data.length; i++) {
      const row = importData.data[i];
      try {
        // Xử lý dữ liệu theo thứ tự cột từ Excel
        const tenCongDoanCoSo = row.tenCongDoanCoSo; // Cột B
        const cumKhuCn = row.cumKhuCn; // Cột C
        const nganhNgheSxKinhDoanh = row.nganhNgheSxKinhDoanh; // Cột D
        const soCnvcldNam = row.soCnvcldNam; // Cột F
        const soCnvcldNu = row.soCnvcldNu; // Cột G
        const soDvcdNam = row.soDvcdNam; // Cột I
        const soDvcdNu = row.soDvcdNu; // Cột J

        // Xử lý Loại hình - kiểm tra cột nào có giá trị
        let loaiHinh = null;
        if (row.loaiHinhNhaNuoc && row.loaiHinhNhaNuoc.toString().trim() !== '') {
          loaiHinh = 'Nhà nước';
        } else if (row.loaiHinhTrongNuoc && row.loaiHinhTrongNuoc.toString().trim() !== '') {
          loaiHinh = 'Trong nước';
        } else if (row.loaiHinhNgoaiNuoc && row.loaiHinhNgoaiNuoc.toString().trim() !== '') {
          loaiHinh = 'Ngoài nước';
        }

        // Xử lý Loại công ty - kiểm tra cột nào có giá trị
        let loaiCongTy = null;
        if (row.loaiCongTyCoPhan && row.loaiCongTyCoPhan.toString().trim() !== '') {
          loaiCongTy = 'Công ty Cổ phần';
        } else if (row.loaiCongTyTnhh && row.loaiCongTyTnhh.toString().trim() !== '') {
          loaiCongTy = 'Công ty TNHH';
        }

        const namThanhLapRaw = row.namThanhLap; // Cột P
        const quocGia = row.quocGia; // Cột Q
        const thuocXaPhuong = row.thuocXaPhuong; // Cột R
        const ghiChu = row.ghiChu; // Cột S
        const tenChuTichCongDoan = row.tenChuTichCongDoan; // Cột T
        const sdtChuTich = row.sdtChuTich; // Cột U
        const diaChi = row.diaChi; // Cột V

        // Skip các hàng trống hoặc header
        if (!tenCongDoanCoSo) {
          console.log(`Bỏ qua hàng ${i + 1}: ${tenCongDoanCoSo} (có thể là header hoặc hàng trống)`);
          continue;
        }

        // Kiểm tra trùng tên công đoàn cơ sở
        const tenCongDoanTrim = tenCongDoanCoSo?.toString().trim();
        const existingOrganization = await this.organizationRepository.findOne({
          where: { name: tenCongDoanTrim }
        });

        if (existingOrganization) {
          result.errorCount++;
          const errorMessage = `Dòng ${i + 1}: Công đoàn "${tenCongDoanTrim}" đã tồn tại (ID: ${existingOrganization.id})`;
          result.errors.push(errorMessage);
          console.log(`⚠️ ${errorMessage}`);
          continue; // Bỏ qua và chuyển sang dòng tiếp theo
        }

        // Tìm cumKhuCnId từ tên
        let cumKhuCnId: number | null = null;
        if (cumKhuCn && cumKhuCn.toString().trim() !== '') {
          const cumKhuCnName = cumKhuCn.toString().trim();

          // Kiểm tra cache trước
          if (cumKhuCnCache.has(cumKhuCnName)) {
            cumKhuCnId = cumKhuCnCache.get(cumKhuCnName);
          } else {
            // Query database
            const cumKhuCn = await this.cumKhuCongNghiepRepository.findOne({
              where: { ten: cumKhuCnName }
            });

            if (cumKhuCn) {
              cumKhuCnId = cumKhuCn.id;
              cumKhuCnCache.set(cumKhuCnName, cumKhuCnId);
            } else {
              // Tạo mới cụm khu công nghiệp nếu không tìm thấy
              const newCumKhuCn = this.cumKhuCongNghiepRepository.create({
                ten: cumKhuCnName,
                diaChi: '', // Có thể để trống hoặc lấy từ row khác
                moTa: `Tự động tạo từ import - ${new Date().toISOString()}`
              });
              await this.cumKhuCongNghiepRepository.save(newCumKhuCn);
              cumKhuCnId = newCumKhuCn.id;
              cumKhuCnCache.set(cumKhuCnName, cumKhuCnId);
            }
          }
        }

        // Tìm xaPhuongId từ tên
        let xaPhuongId: number | null = null;
        if (thuocXaPhuong && thuocXaPhuong.toString().trim() !== '') {
          const xaPhuongName = thuocXaPhuong.toString().trim();

          // Kiểm tra cache trước
          if (xaPhuongCache.has(xaPhuongName)) {
            xaPhuongId = xaPhuongCache.get(xaPhuongName);
          } else {
            // Query database
            const xaPhuong = await this.xaPhuongRepository.findOne({
              where: { ten: xaPhuongName }
            });

            if (xaPhuong) {
              xaPhuongId = xaPhuong.id;
              xaPhuongCache.set(xaPhuongName, xaPhuongId);
            } else {
              // Tạo mới xã phường nếu không tìm thấy
              const newXaPhuong = this.xaPhuongRepository.create({
                ten: xaPhuongName,
                moTa: `Tự động tạo từ import - ${new Date().toISOString()}`
              });
              await this.xaPhuongRepository.save(newXaPhuong);
              xaPhuongId = newXaPhuong.id;
              xaPhuongCache.set(xaPhuongName, xaPhuongId);
            }
          }
        }

        // Xử lý ngày thành lập - handle nhiều format
        let namThanhLap: Date | null = null;
        if (namThanhLapRaw) {
          try {
            if (typeof namThanhLapRaw === 'number') {
              // Nếu là số (năm): 2020 -> 2020-01-01
              if (namThanhLapRaw > 1800 && namThanhLapRaw <= new Date().getFullYear()) {
                namThanhLap = new Date(`${namThanhLapRaw}-01-01`);
              }
            } else if (typeof namThanhLapRaw === 'string') {
              // Nếu là string, thử parse thành Date
              const parsedDate = new Date(namThanhLapRaw);
              if (!isNaN(parsedDate.getTime())) {
                namThanhLap = parsedDate;
              }
            } else if (namThanhLapRaw instanceof Date) {
              // Nếu đã là Date
              namThanhLap = namThanhLapRaw;
            }
          } catch (error) {
            console.warn(`Không thể parse ngày thành lập: ${namThanhLapRaw}`, error);
          }
        }

        // Tạo organization object
        const organizationData: Partial<Organization> = {
          name: tenCongDoanCoSo?.toString().trim(),
          cumKhuCnId,
          nganhNgheSxKinhDoanh: nganhNgheSxKinhDoanh?.toString().trim() || null,
          slCongNhanVienChucLdNam: Number(soCnvcldNam) || 0,
          slCongNhanVienChucLdNu: Number(soCnvcldNu) || 0,
          slCongDoanNam: Number(soDvcdNam) || 0,
          slCongDoanNu: Number(soDvcdNu) || 0,
          loaiHinh: loaiHinh,
          loaiCongTy: loaiCongTy,
          namThanhLap,
          quocGia: quocGia?.toString().trim() || 'Việt Nam',
          xaPhuongId,
          ghiChu: ghiChu?.toString().trim() || null,
          tenChuTichCongDoan: tenChuTichCongDoan?.toString().trim() || null,
          sdtChuTich: sdtChuTich?.toString().trim() || null,
          diaChi: diaChi?.toString().trim() || null,
          organizationLevel: 1, // Mặc định level 1
          soUyVienBch: 0, // Mặc định 0
          soUyVienUbkt: 0, // Mặc định 0
        };

        // Tạo và lưu organization
        const newOrganization = this.organizationRepository.create(organizationData);
        await this.organizationRepository.save(newOrganization);

        result.successCount++;
        result.createdIds.push(newOrganization.id);

      } catch (error) {
        result.errorCount++;
        const errorMessage = `Dòng ${i + 1}: ${error.message || 'Lỗi không xác định'}`;
        result.errors.push(errorMessage);
      }
    }

    return result;
  }

  async importFromExcelFile(file: Express.Multer.File, startRow = 3): Promise<ImportResultDto> {
    try {
      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // Lấy sheet đầu tiên
      const worksheet = workbook.Sheets[sheetName];

      // Chuyển đổi thành JSON, bắt đầu từ hàng startRow
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          'tt',                      // A - STT
          'tenCongDoanCoSo',        // B - Tên Công đoàn cơ sở*
          'cumKhuCn',               // C - Cụm Khu CN*
          'nganhNgheSxKinhDoanh',   // D - Ngành nghề sản xuất kinh doanh
          'skipTongSoCnvcld',       // E - SKIP: Tổng số CNVCLĐ*
          'soCnvcldNam',            // F - Số CNVCLĐ* nam
          'soCnvcldNu',             // G - Số CNVCLĐ* nữ
          'skipTongSoDvcd',         // H - SKIP: Tổng số ĐVCĐ
          'soDvcdNam',              // I - Số ĐVCĐ* nam
          'soDvcdNu',               // J - Số ĐVCĐ* nữ
          'loaiHinhNhaNuoc',        // K - Loại hình - Nhà nước
          'loaiHinhTrongNuoc',      // L - Loại hình - Trong nước
          'loaiHinhNgoaiNuoc',      // M - Loại hình - Ngoài nước
          'loaiCongTyCoPhan',       // N - Loại công ty - Công ty Cổ phần
          'loaiCongTyTnhh',         // O - Loại công ty - Công ty TNHH
          'namThanhLap',            // P - Năm thành lập
          'quocGia',                // Q - Quốc gia
          'thuocXaPhuong',          // R - Thuộc xã phường
          'ghiChu',                 // S - Ghi chú
          'tenChuTichCongDoan',     // T - Tên chủ tịch công đoàn
          'sdtChuTich',             // U - SĐT chủ tịch
          'diaChi'                  // V - Địa chỉ
        ],
        range: startRow - 1 // XLSX sử dụng 0-based index
      });

      console.log(`Đọc được ${jsonData.length} dòng từ Excel (bao gồm cả header nếu có)`);

      // Sử dụng method import chung - logic sẽ tự động skip header
      return await this.importOrganizations({
        data: jsonData as ImportOrganizationRowDto[]
      });

    } catch (error) {
      console.error('Lỗi khi đọc file Excel:', error);
      throw new BadRequestException(`Không thể đọc file Excel: ${error.message}`);
    }
  }

  async listByPermission(query: listAllOrganizationDto, userPermissions: any) {
    const { search, limit = 10, page = 1, cumKhuCnId, xaPhuongId } = query;
    const { organizationId: userOrgId, cumKhuCnId: userCumKhuId, xaPhuongId: userXaPhuongId } = userPermissions;

    const qb = this.organizationRepository.createQueryBuilder('u')
      .select([
        'u.*',
        'p.name as parentName',
        'ckh.ten as cumKhuCongNghiepName',
        'xp.ten as xaPhuongName',
        '(u.slCongDoanNam + u.slCongDoanNu) as tongCongDoan'
      ])
      .leftJoin('Organization', 'p', 'p.id = u.organizationParentId')
      .leftJoin('CumKhuCongNghiep', 'ckh', 'ckh.id = u.cumKhuCnId')
      .leftJoin('XaPhuong', 'xp', 'xp.id = u.xaPhuongId')
      .orderBy('u.name', 'ASC')
      .limit(limit)
      .offset(limit * (page - 1));

    // Áp dụng điều kiện phân quyền theo thứ tự ưu tiên từ user permissions

    if (cumKhuCnId && Array.isArray(cumKhuCnId) && cumKhuCnId.length > 0) {
      qb.andWhere('u.cumKhuCnId IN (:...cumKhuCnId)', { cumKhuCnId });
    }
    if (xaPhuongId && Array.isArray(xaPhuongId) && xaPhuongId.length > 0) {
      qb.andWhere('u.xaPhuongId IN (:...xaPhuongId)', { xaPhuongId });
    }
    if (userOrgId && !userCumKhuId && !userXaPhuongId) {

      qb.andWhere('u.id = :userOrgId', { userOrgId });


    }
    if (userCumKhuId) {
      qb.andWhere('u.cumKhuCnId = :userCumKhuId', { userCumKhuId });
    }
    if (userXaPhuongId) {
      qb.andWhere('u.xaPhuongId = :userXaPhuongId', { userXaPhuongId });
    }


    // Áp dụng bộ lọc tìm kiếm tương tự như listAllOrganization
    if (search) {
      qb.andWhere(
        '(u.name LIKE :search OR u.diaChi LIKE :search OR p.name LIKE :search OR u.ghiChu LIKE :search OR u.tenChuTichCongDoan LIKE :search OR u.diaChi LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [rawList, count] = await Promise.all([
      qb.getRawMany(),
      qb.getCount()
    ]);

    // Tính toán các thống kê tổng hợp
    const summaryQb = this.organizationRepository.createQueryBuilder('u')
      .select('COUNT(DISTINCT u.id)', 'tongSoCDCS')
      .addSelect('SUM(COALESCE(u.tongSoCnvcld, 0))', 'tongCBCNV')
      .addSelect('SUM(COALESCE(u.slCongDoanNam, 0) + COALESCE(u.slCongDoanNu, 0))', 'tongDoanVien')
      .addSelect('COUNT(DISTINCT u.loaiHinh)', 'tongLoaiHinh')
      .leftJoin('Organization', 'p', 'p.id = u.organizationParentId')
      .leftJoin('CumKhuCongNghiep', 'ckh', 'ckh.id = u.cumKhuCnId')
      .leftJoin('XaPhuong', 'xp', 'xp.id = u.xaPhuongId');

    // Áp dụng cùng điều kiện phân quyền cho summary
    if (cumKhuCnId && Array.isArray(cumKhuCnId) && cumKhuCnId.length > 0) {
      summaryQb.andWhere('u.cumKhuCnId IN (:...cumKhuCnId)', { cumKhuCnId });
    }
    if (xaPhuongId && Array.isArray(xaPhuongId) && xaPhuongId.length > 0) {
      summaryQb.andWhere('u.xaPhuongId IN (:...xaPhuongId)', { xaPhuongId });
    }
    if (userOrgId && !userCumKhuId && !userXaPhuongId) {
      summaryQb.andWhere('u.id = :userOrgId', { userOrgId });
    }
    if (userCumKhuId) {
      summaryQb.andWhere('u.cumKhuCnId = :userCumKhuId', { userCumKhuId });
    }
    if (userXaPhuongId) {
      summaryQb.andWhere('u.xaPhuongId = :userXaPhuongId', { userXaPhuongId });
    }
    if (search) {
      summaryQb.andWhere(
        '(u.name LIKE :search OR u.diaChi LIKE :search OR p.name LIKE :search OR u.ghiChu LIKE :search OR ckh.ten LIKE :search OR xp.ten LIKE :search OR u.tenChuTichCongDoan LIKE :search OR u.diaChi LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const summary = await summaryQb.getRawOne();

    // Lấy schema của dynamic fields để format data (tương tự listAllOrganization)
    const dynamicFieldSchemas = await this.getAllDynamicFields();

    // Format list với dynamic fields
    const formattedList = rawList.map(org => {
      const dynamicFields = org.u_dynamicFields ? JSON.parse(org.u_dynamicFields) : {};
      const formattedDynamicFields = {};

      // Format dynamic fields với schema info
      dynamicFieldSchemas.forEach(schema => {
        formattedDynamicFields[schema.fieldKey] = {
          value: dynamicFields[schema.fieldKey] || schema.defaultValue || null,
          fieldName: schema.fieldName,
          fieldType: schema.fieldType,
          isRequired: schema.isRequired
        };
      });

      return {
        ...org,
        dynamicFields: dynamicFields, // Raw dynamic fields
        formattedDynamicFields: formattedDynamicFields // Formatted với schema
      };
    });

    return {
      list: formattedList,
      count,
      summary: {
        tongSoCDCS: parseInt(summary?.tongSoCDCS) || 0,
        tongCBCNV: parseInt(summary?.tongCBCNV) || 0,
        tongDoanVien: parseInt(summary?.tongDoanVien) || 0,
        tongLoaiHinh: parseInt(summary?.tongLoaiHinh) || 0
      },
      dynamicFieldSchemas // Include schema info để FE biết cách render
    };
  }

  /**
   * Helper method to get user details from database
   */
  async getUserDetail(userId: string) {
    try {
      const userDetail = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'organizationId', 'cumKhuCnId', 'xaPhuongId', 'fullName', 'email', 'roleId']
      });

      return userDetail;
    } catch (error) {
      console.error('❌ [SERVICE] Error getting user detail:', error);
      return null;
    }
  }

  /**
   * Import danh sách công đoàn từ Excel với nhiều sheet
   * Mỗi sheet tương ứng với 1 xã phường
   */
  async importMultiSheetFromExcel(file: Express.Multer.File): Promise<ImportMultiSheetResultDto> {
    try {
      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      const result: ImportMultiSheetResultDto = {
        totalSheets: workbook.SheetNames.length,
        successCount: 0,
        errorCount: 0,
        errors: {},
        createdXaPhuongIds: [],
        createdOrganizationIds: []
      };

      // Cache xã phường để tránh query nhiều lần
      const xaPhuongCache = new Map<string, XaPhuong>();

      // Duyệt qua từng sheet
      for (const sheetName of workbook.SheetNames) {
        console.log(`📄 Đang xử lý sheet: ${sheetName}`);

        const worksheet = workbook.Sheets[sheetName];

        // Đọc tên xã phường từ cell B5 (row 4, col 1 - zero-indexed)
        const xaPhuongCell = worksheet['B5'];
        if (!xaPhuongCell || !xaPhuongCell.v) {
          result.errors[`${sheetName}_B5`] = ['Không tìm thấy tên xã phường tại cell B5'];
          console.warn(`⚠️ Sheet ${sheetName}: Không có tên xã phường tại B5`);
          continue;
        }

        const tenXaPhuong = String(xaPhuongCell.v).trim();
        console.log(`📍 Xã phường: ${tenXaPhuong}`);

        // Kiểm tra hoặc tạo mới xã phường
        let xaPhuong: XaPhuong;

        if (xaPhuongCache.has(tenXaPhuong)) {
          xaPhuong = xaPhuongCache.get(tenXaPhuong);
          console.log(`✅ Xã phường đã tồn tại (cache): ${tenXaPhuong}`);
        } else {
          // Tìm trong database
          xaPhuong = await this.xaPhuongRepository.findOne({
            where: { ten: tenXaPhuong }
          });

          if (!xaPhuong) {
            // Tạo mới xã phường
            console.log(`➕ Tạo mới xã phường: ${tenXaPhuong}`);
            xaPhuong = this.xaPhuongRepository.create({
              ten: tenXaPhuong,
              moTa: `Tự động tạo từ import Excel - Sheet: ${sheetName}`
            });
            await this.xaPhuongRepository.save(xaPhuong);
            result.createdXaPhuongIds.push(xaPhuong.id);
            console.log(`✅ Đã tạo xã phường ID: ${xaPhuong.id}`);
          } else {
            console.log(`✅ Xã phường đã tồn tại (DB): ${tenXaPhuong} - ID: ${xaPhuong.id}`);
          }

          xaPhuongCache.set(tenXaPhuong, xaPhuong);
        }

        // Đọc dữ liệu từ row 6 trở đi (row 5 - zero-indexed)
        // Cột: A=STT, B=Tên công đoàn, C=Địa chỉ, D=Loại hình, E=Tổng CNVCLĐ, 
        //      F=Tổng đoàn viên, G=Đoàn viên nữ, H=Ủy viên BCH, I=Ủy viên UBKT,
        //      J=Tên chủ tịch, K=SĐT chủ tịch

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const startRow = 5; // Row 6 (zero-indexed = 5)

        for (let rowNum = startRow; rowNum <= range.e.r; rowNum++) {
          const rowIndex = rowNum + 1; // Row thực tế trong Excel (1-indexed)
          const errorKey = `${sheetName}_row${rowIndex}`;

          try {
            // Đọc các cell
            const getCellValue = (col: string) => {
              const cellAddress = `${col}${rowIndex}`;
              const cell = worksheet[cellAddress];
              return cell ? cell.v : null;
            };

            const stt = getCellValue('A');
            const tenCongDoan = getCellValue('B');
            const diaChi = getCellValue('C');
            const loaiHinh = getCellValue('D');
            const tongSoCnvcld = getCellValue('E');
            const tongSoDoanVien = getCellValue('F');
            const soDoanVienNu = getCellValue('G');
            const soUyVienBch = getCellValue('H');
            const soUyVienUbkt = getCellValue('I');
            const tenChuTichCongDoan = getCellValue('J');
            const sdtChuTich = getCellValue('K');

            // Nếu không có tên công đoàn, chuyển sang sheet khác
            if (!tenCongDoan || String(tenCongDoan).trim() === '') {
              console.log(`⏭️ Không có tên công đoàn tại ${errorKey}, chuyển sang sheet tiếp theo`);
              break; // Thoát khỏi vòng lặp row, chuyển sang sheet tiếp theo
            }

            const errors: string[] = [];

            // Kiểm tra trùng lặp tên công đoàn trong cùng xã phường
            const existingOrg = await this.organizationRepository.findOne({
              where: {
                name: String(tenCongDoan).trim(),
                xaPhuongId: xaPhuong.id
              }
            });

            if (existingOrg) {
              errors.push(`Công đoàn "${tenCongDoan}" đã tồn tại trong xã phường ${tenXaPhuong}`);
            }

            // Nếu có lỗi, ghi lại và bỏ qua
            if (errors.length > 0) {
              result.errorCount++;
              result.errors[errorKey] = errors;
              console.warn(`⚠️ Lỗi tại ${errorKey}:`, errors);
              continue;
            }

            // Tính toán số đoàn viên nam = tổng - nữ
            const tongDoanVien = tongSoDoanVien ? Number(tongSoDoanVien) : 0;
            const doanVienNu = soDoanVienNu ? Number(soDoanVienNu) : 0;
            const doanVienNam = tongDoanVien - doanVienNu;

            // Tạo công đoàn mới
            const newOrganization = this.organizationRepository.create({
              name: String(tenCongDoan).trim(),
              diaChi: diaChi ? String(diaChi).trim() : null,
              loaiHinh: loaiHinh ? String(loaiHinh).trim() : null,
              tongSoCnvcld: tongSoCnvcld ? Number(tongSoCnvcld) : 0,
              tongSoCongDoan: tongDoanVien,
              slCongDoanNam: doanVienNam,
              slCongDoanNu: doanVienNu,
              soUyVienBch: soUyVienBch ? Number(soUyVienBch) : 0,
              soUyVienUbkt: soUyVienUbkt ? Number(soUyVienUbkt) : 0,
              tenChuTichCongDoan: tenChuTichCongDoan ? String(tenChuTichCongDoan).trim() : null,
              sdtChuTich: sdtChuTich ? String(sdtChuTich).trim() : null,
              xaPhuongId: xaPhuong.id,
              organizationLevel: 1, // Mặc định cấp 1
              quocGia: 'Việt Nam' // Mặc định
            });

            await this.organizationRepository.save(newOrganization);
            result.successCount++;
            result.createdOrganizationIds.push(newOrganization.id);

            console.log(`✅ Đã tạo công đoàn: ${tenCongDoan} (ID: ${newOrganization.id})`);

          } catch (error) {
            result.errorCount++;
            const errorMessage = `Lỗi không xác định: ${error.message || 'Unknown error'}`;
            result.errors[errorKey] = result.errors[errorKey] || [];
            result.errors[errorKey].push(errorMessage);
            console.error(`❌ Lỗi tại ${errorKey}:`, error);
          }
        }
      }

      console.log(`\n📊 Kết quả import:`);
      console.log(`- Tổng số sheet: ${result.totalSheets}`);
      console.log(`- Xã phường mới tạo: ${result.createdXaPhuongIds.length}`);
      console.log(`- Công đoàn thành công: ${result.successCount}`);
      console.log(`- Công đoàn lỗi: ${result.errorCount}`);

      return result;

    } catch (error) {
      console.error('❌ Lỗi khi đọc file Excel:', error);
      throw new BadRequestException(`Không thể đọc file Excel: ${error.message}`);
    }
  }

  async importByCumKhuFromExcel(file: Express.Multer.File): Promise<any> {
    try {
      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });

      const result = {
        success: true,
        message: '',
        data: {
          totalSheets: workbook.SheetNames.length,
          totalOrganizations: 0,
          totalCumKhuCreated: 0,
          totalCumKhuExisted: 0,
          sheets: []
        }
      };

      // Cache cụm khu công nghiệp để tránh query nhiều lần
      const cumKhuCache = new Map<string, CumKhuCongNghiep>();

      // Duyệt qua từng sheet
      for (const sheetName of workbook.SheetNames) {
        console.log(`📄 Đang xử lý sheet: ${sheetName}`);

        const sheetResult = {
          sheetName: sheetName,
          cumKhuCongNghiepId: null,
          cumKhuStatus: 'existed' as 'created' | 'existed',
          totalRows: 0,
          successCount: 0,
          errorCount: 0,
          errors: []
        };

        const worksheet = workbook.Sheets[sheetName];
        const tenCumKhu = sheetName.trim();

        // Kiểm tra hoặc tạo mới cụm khu công nghiệp
        let cumKhuCongNghiep: CumKhuCongNghiep;

        if (cumKhuCache.has(tenCumKhu)) {
          cumKhuCongNghiep = cumKhuCache.get(tenCumKhu);
          console.log(`✅ Cụm KCN đã tồn tại (cache): ${tenCumKhu}`);
        } else {
          // Tìm trong database
          cumKhuCongNghiep = await this.cumKhuCongNghiepRepository.findOne({
            where: { ten: tenCumKhu }
          });

          if (!cumKhuCongNghiep) {
            // Tạo mới cụm khu công nghiệp
            console.log(`➕ Tạo mới cụm khu công nghiệp: ${tenCumKhu}`);
            cumKhuCongNghiep = this.cumKhuCongNghiepRepository.create({
              ten: tenCumKhu,
              moTa: `Tự động tạo từ import Excel - Sheet: ${sheetName}`
            });
            await this.cumKhuCongNghiepRepository.save(cumKhuCongNghiep);
            result.data.totalCumKhuCreated++;
            sheetResult.cumKhuStatus = 'created';
            console.log(`✅ Đã tạo cụm KCN ID: ${cumKhuCongNghiep.id}`);
          } else {
            result.data.totalCumKhuExisted++;
            console.log(`✅ Cụm KCN đã tồn tại (DB): ${tenCumKhu} - ID: ${cumKhuCongNghiep.id}`);
          }

          cumKhuCache.set(tenCumKhu, cumKhuCongNghiep);
        }

        sheetResult.cumKhuCongNghiepId = cumKhuCongNghiep.id;

        // Tìm hàng bắt đầu data (khi cột STT = 1)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        let dataStartRow = -1;

        // Quét từ đầu sheet để tìm STT = 1
        for (let rowNum = 0; rowNum <= range.e.r; rowNum++) {
          const rowIndex = rowNum + 1;
          const sttCellAddress = `A${rowIndex}`;
          const sttCell = worksheet[sttCellAddress];

          if (sttCell && sttCell.v !== null && sttCell.v !== undefined) {
            const sttValue = String(sttCell.v).trim();
            if (sttValue === '1') {
              dataStartRow = rowNum;
              console.log(`✅ Tìm thấy data bắt đầu tại row ${rowIndex} (STT = 1)`);
              break;
            }
          }
        }

        if (dataStartRow === -1) {
          console.warn(`⚠️ Sheet ${sheetName}: Không tìm thấy hàng bắt đầu data (STT = 1)`);
          sheetResult.errors.push({
            row: 0,
            error: 'Không tìm thấy hàng bắt đầu data (STT = 1)'
          });
          result.data.sheets.push(sheetResult);
          continue;
        }

        // Đọc dữ liệu từ hàng bắt đầu
        // Thứ tự cột: A=STT, B=Tên công đoàn, C=Địa chỉ, D=Tổng CNVCLĐ, 
        //             E=Tổng đoàn viên, F=Đoàn viên nam, G=Đoàn viên nữ,
        //             H=Ủy viên BCH, I=Ủy viên UBKT, J=Ghi chú,
        //             K=Tên chủ tịch, L=SĐT chủ tịch

        for (let rowNum = dataStartRow; rowNum <= range.e.r; rowNum++) {
          const rowIndex = rowNum + 1;

          try {
            // Đọc các cell
            const getCellValue = (col: string) => {
              const cellAddress = `${col}${rowIndex}`;
              const cell = worksheet[cellAddress];
              return cell ? cell.v : null;
            };

            const stt = getCellValue('A');

            // Nếu STT trống, kết thúc sheet này
            if (!stt || String(stt).trim() === '') {
              console.log(`⏭️ STT trống tại row ${rowIndex}, kết thúc sheet ${sheetName}`);
              break;
            }

            sheetResult.totalRows++;

            const tenCongDoan = getCellValue('B');
            const diaChi = getCellValue('C');
            const tongSoCnvcld = getCellValue('D');
            const tongSoDoanVien = getCellValue('E');
            const soDoanVienNam = getCellValue('F');
            const soDoanVienNu = getCellValue('G');
            const soUyVienBch = getCellValue('H');
            const soUyVienUbkt = getCellValue('I');
            const ghiChu = getCellValue('J');
            const tenChuTichCongDoan = getCellValue('K');
            const sdtChuTich = getCellValue('L');

            // Validate tên công đoàn
            if (!tenCongDoan || String(tenCongDoan).trim() === '') {
              sheetResult.errorCount++;
              sheetResult.errors.push({
                row: rowIndex,
                error: 'Thiếu tên công đoàn'
              });
              console.warn(`⚠️ Row ${rowIndex}: Thiếu tên công đoàn`);
              continue;
            }

            // Kiểm tra trùng lặp tên công đoàn trong cùng cụm khu
            const existingOrg = await this.organizationRepository.findOne({
              where: {
                name: String(tenCongDoan).trim(),
                cumKhuCnId: cumKhuCongNghiep.id
              }
            });

            if (existingOrg) {
              sheetResult.errorCount++;
              sheetResult.errors.push({
                row: rowIndex,
                error: `Công đoàn "${tenCongDoan}" đã tồn tại trong cụm khu ${tenCumKhu}`
              });
              console.warn(`⚠️ Row ${rowIndex}: Công đoàn đã tồn tại`);
              continue;
            }

            // Tạo công đoàn mới
            const newOrganization = this.organizationRepository.create({
              name: String(tenCongDoan).trim(),
              diaChi: diaChi ? String(diaChi).trim() : null,
              tongSoCnvcld: tongSoCnvcld ? Number(tongSoCnvcld) : 0,
              tongSoCongDoan: tongSoDoanVien ? Number(tongSoDoanVien) : 0,
              slCongDoanNam: soDoanVienNam ? Number(soDoanVienNam) : 0,
              slCongDoanNu: soDoanVienNu ? Number(soDoanVienNu) : 0,
              soUyVienBch: soUyVienBch ? Number(soUyVienBch) : 0,
              soUyVienUbkt: soUyVienUbkt ? Number(soUyVienUbkt) : 0,
              ghiChu: ghiChu ? String(ghiChu).trim() : null,
              tenChuTichCongDoan: tenChuTichCongDoan ? String(tenChuTichCongDoan).trim() : null,
              sdtChuTich: sdtChuTich ? String(sdtChuTich).trim() : null,
              cumKhuCnId: cumKhuCongNghiep.id,
              organizationLevel: 1,
              quocGia: 'Việt Nam'
            });

            await this.organizationRepository.save(newOrganization);
            sheetResult.successCount++;
            result.data.totalOrganizations++;

            console.log(`✅ Đã tạo công đoàn: ${tenCongDoan} (ID: ${newOrganization.id})`);

          } catch (error) {
            sheetResult.errorCount++;
            sheetResult.errors.push({
              row: rowIndex,
              error: `Lỗi: ${error.message || 'Unknown error'}`
            });
            console.error(`❌ Lỗi tại row ${rowIndex}:`, error);
          }
        }

        result.data.sheets.push(sheetResult);
      }

      result.message = `Import thành công ${result.data.totalOrganizations} công đoàn từ ${result.data.totalSheets} cụm khu công nghiệp`;

      console.log(`\n📊 Kết quả import:`);
      console.log(`- Tổng số sheet: ${result.data.totalSheets}`);
      console.log(`- Cụm KCN mới tạo: ${result.data.totalCumKhuCreated}`);
      console.log(`- Cụm KCN đã tồn tại: ${result.data.totalCumKhuExisted}`);
      console.log(`- Tổng công đoàn thành công: ${result.data.totalOrganizations}`);

      return result;

    } catch (error) {
      console.error('❌ Lỗi khi đọc file Excel:', error);
      throw new BadRequestException(`Không thể đọc file Excel: ${error.message}`);
    }
  }

  /**
   * API Thống kê Heatmap tương quan Lao động ↔ Đoàn viên theo Cụm KCN
   */
  async getHeatmapTuongQuanLaoDongDoanVien(): Promise<any[]> {
    try {
      const result = await this.organizationRepository
        .createQueryBuilder('org')
        .leftJoin('cum_khu_cong_nghiep', 'ckn', 'ckn.id = org.cumKhuCnId')
        .select('ckn.ten', 'cum_kcn')
        .addSelect('SUM(COALESCE(org.tongSoCnvcld, 0))', 'tong_ld')
        .addSelect('SUM(COALESCE(org.tongSoCongDoan, 0))', 'tong_dv')
        .where('org.cumKhuCnId IS NOT NULL')
        .groupBy('org.cumKhuCnId')
        .addGroupBy('ckn.ten')
        .orderBy('tong_ld', 'DESC')
        .getRawMany();

      return result.map(item => ({
        cum_kcn: item.cum_kcn || 'Chưa xác định',
        tong_ld: parseInt(item.tong_ld) || 0,
        tong_dv: parseInt(item.tong_dv) || 0,
        ty_le: item.tong_ld > 0
          ? Math.round((parseInt(item.tong_dv) / parseInt(item.tong_ld)) * 100)
          : 0
      }));
    } catch (error) {
      console.error('Error in getHeatmapTuongQuanLaoDongDoanVien:', error);
      throw new BadRequestException('Không thể thống kê dữ liệu heatmap');
    }
  }

  /**
   * API Thống kê Stacked Bar Nam/Nữ theo Cụm KCN
   */
  async getStackedBarNamNuTheoCum(): Promise<any[]> {
    try {
      const result = await this.organizationRepository
        .createQueryBuilder('org')
        .leftJoin('cum_khu_cong_nghiep', 'ckn', 'ckn.id = org.cumKhuCnId')
        .select('ckn.ten', 'cum_kcn')
        .addSelect('SUM(COALESCE(org.slCongDoanNam, 0))', 'nam')
        .addSelect('SUM(COALESCE(org.slCongDoanNu, 0))', 'nu')
        .where('org.cumKhuCnId IS NOT NULL')
        .groupBy('org.cumKhuCnId')
        .addGroupBy('ckn.ten')
        .orderBy('ckn.ten', 'ASC')
        .getRawMany();

      return result.map(item => ({
        cum_kcn: item.cum_kcn || 'Chưa xác định',
        nam: parseInt(item.nam) || 0,
        nu: parseInt(item.nu) || 0,
        tong: (parseInt(item.nam) || 0) + (parseInt(item.nu) || 0)
      }));
    } catch (error) {
      console.error('Error in getStackedBarNamNuTheoCum:', error);
      throw new BadRequestException('Không thể thống kê dữ liệu nam/nữ theo cụm');
    }
  }

  /**
   * API Thống kê số lượng công đoàn theo các Cụm KCN
   */
  async getSoLuongCongDoanTheoCum(): Promise<any[]> {
    try {
      const result = await this.organizationRepository
        .createQueryBuilder('org')
        .leftJoin('cum_khu_cong_nghiep', 'ckn', 'ckn.id = org.cumKhuCnId')
        .select('ckn.ten', 'cum_kcn')
        .addSelect('COUNT(org.id)', 'so_luong_cong_doan')
        .addSelect('SUM(COALESCE(org.tongSoCnvcld, 0))', 'tong_lao_dong')
        .addSelect('SUM(COALESCE(org.tongSoCongDoan, 0))', 'tong_doan_vien')
        .where('org.cumKhuCnId IS NOT NULL')
        .groupBy('org.cumKhuCnId')
        .addGroupBy('ckn.ten')
        .orderBy('so_luong_cong_doan', 'DESC')
        .getRawMany();

      return result.map(item => ({
        cum_kcn: item.cum_kcn || 'Chưa xác định',
        so_luong_cong_doan: parseInt(item.so_luong_cong_doan) || 0,
        tong_lao_dong: parseInt(item.tong_lao_dong) || 0,
        tong_doan_vien: parseInt(item.tong_doan_vien) || 0
      }));
    } catch (error) {
      console.error('Error in getSoLuongCongDoanTheoCum:', error);
      throw new BadRequestException('Không thể thống kê số lượng công đoàn theo cụm');
    }
  }

  /**
   * API Thống kê số lượng công đoàn theo Xã Phường
   */
  async getSoLuongCongDoanTheoXaPhuong(): Promise<any[]> {
    try {
      const result = await this.organizationRepository
        .createQueryBuilder('org')
        .leftJoin('xa_phuong', 'xp', 'xp.id = org.xaPhuongId')
        .select('xp.ten', 'xa_phuong')
        .addSelect('COUNT(org.id)', 'so_luong_cong_doan')
        .addSelect('SUM(COALESCE(org.tongSoCnvcld, 0))', 'tong_lao_dong')
        .addSelect('SUM(COALESCE(org.tongSoCongDoan, 0))', 'tong_doan_vien')
        .where('org.xaPhuongId IS NOT NULL')
        .groupBy('org.xaPhuongId')
        .addGroupBy('xp.ten')
        .orderBy('so_luong_cong_doan', 'DESC')
        .getRawMany();

      return result.map(item => ({
        xa_phuong: item.xa_phuong || 'Chưa xác định',
        so_luong_cong_doan: parseInt(item.so_luong_cong_doan) || 0,
        tong_lao_dong: parseInt(item.tong_lao_dong) || 0,
        tong_doan_vien: parseInt(item.tong_doan_vien) || 0
      }));
    } catch (error) {
      console.error('Error in getSoLuongCongDoanTheoXaPhuong:', error);
      throw new BadRequestException('Không thể thống kê số lượng công đoàn theo xã phường');
    }
  }

  /**
   * Xuất Excel danh sách công đoàn cơ sở (ID và Tên)
   */
  async exportOrganizationsToExcel(): Promise<Buffer> {
    try {
      // Lấy toàn bộ danh sách công đoàn
      const organizations = await this.organizationRepository
        .createQueryBuilder('org')
        .select(['org.id', 'org.name'])
        .orderBy('org.id', 'ASC')
        .getMany();

      // Tạo workbook mới
      const workbook = XLSX.utils.book_new();

      // Tạo dữ liệu cho sheet
      const worksheetData = [
        ['STT', 'ID', 'Tên Công Đoàn Cơ Sở'], // Header
        ...organizations.map((org, index) => [
          index + 1,
          org.id,
          org.name
        ])
      ];

      // Tạo worksheet từ dữ liệu
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set độ rộng cột
      worksheet['!cols'] = [
        { wch: 8 },  // STT
        { wch: 10 }, // ID
        { wch: 50 }  // Tên Công Đoàn
      ];

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách công đoàn');

      // Chuyển workbook thành buffer
      const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
        compression: true
      }) as Buffer;

      return buffer;
    } catch (error) {
      console.error('Error in exportOrganizationsToExcel:', error);
      throw new BadRequestException('Không thể xuất file Excel');
    }
  }
}
