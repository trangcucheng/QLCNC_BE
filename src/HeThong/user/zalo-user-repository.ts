import { Injectable } from '@nestjs/common';
import { User } from 'src/databases/entities/user.entity';
import { ZaloUser } from 'src/databases/entities/ZaloUser.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(ZaloUser)
export class ZaloUserRepository extends Repository<ZaloUser> { }
