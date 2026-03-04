import { Injectable } from '@nestjs/common';
import { ThongBao } from 'src/databases/entities/ThongBao.entity';
import { UserThongBao } from 'src/databases/entities/UserThongBao.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(ThongBao)
export class ThongBaoRepository extends Repository<ThongBao> { }

@Injectable()
@EntityRepository(UserThongBao)
export class UserThongBaoRepository extends Repository<UserThongBao> { }
