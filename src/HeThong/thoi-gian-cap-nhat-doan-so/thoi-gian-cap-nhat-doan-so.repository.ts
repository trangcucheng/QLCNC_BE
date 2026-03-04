import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ThoiGianCapNhatDoanSo } from 'src/databases/entities/ThoiGianCapNhatDoanSo.entity';

@Injectable()
@EntityRepository(ThoiGianCapNhatDoanSo)
export class ThoiGianCapNhatDoanSoRepository extends Repository<ThoiGianCapNhatDoanSo> { }
