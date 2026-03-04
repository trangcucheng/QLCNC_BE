import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaoCaoDoanSoTheoKy, TrangThaiPheDuyet } from '../../databases/entities/BaoCaoDoanSoTheoKy.entity';
import { CreateBaoCaoDoanSoTheoKyDto, UpdateBaoCaoDoanSoTheoKyDto, ListBaoCaoDoanSoTheoKyDto } from './dto/bao-cao-doan-so-theo-ky.dto';

@Injectable()
@EntityRepository(BaoCaoDoanSoTheoKy)
export class BaoCaoDoanSoTheoKyRepository extends Repository<BaoCaoDoanSoTheoKy> { }

