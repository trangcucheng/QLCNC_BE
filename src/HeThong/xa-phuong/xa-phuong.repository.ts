import { Injectable } from '@nestjs/common';
import { Organization } from 'src/databases/entities/Organization.entity';
import { XaPhuong } from 'src/databases/entities/XaPhuong.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(XaPhuong)
export class XaPhuongRepository extends Repository<XaPhuong> { }
