import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationFieldSchema } from 'src/databases/entities/OrganizationFieldSchema.entity';


@Injectable()
@EntityRepository(OrganizationFieldSchema)
export class OrganizationFieldSchemaRepository extends Repository<OrganizationFieldSchema> {

}
