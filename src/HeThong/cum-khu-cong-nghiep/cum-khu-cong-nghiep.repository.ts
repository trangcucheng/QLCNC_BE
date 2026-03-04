import { Injectable } from '@nestjs/common';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(CumKhuCongNghiep)
export class CumKhuCongNghiepRepository extends Repository<CumKhuCongNghiep> { }
