import { Injectable } from '@nestjs/common';
import { Role } from 'src/databases/entities/role.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(Role)
export class RoleRepository extends Repository<Role> { }
