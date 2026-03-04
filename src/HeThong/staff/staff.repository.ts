import { Injectable } from '@nestjs/common';
import { Staff } from 'src/databases/entities/Staff.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(Staff)
export class StaffRepository extends Repository<Staff> { }
