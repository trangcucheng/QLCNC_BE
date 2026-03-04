import { Injectable } from '@nestjs/common';
import { Organization } from 'src/databases/entities/Organization.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(Organization)
export class OrganizationRepository extends Repository<Organization> {}
