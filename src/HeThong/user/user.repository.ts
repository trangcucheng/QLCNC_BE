import { Injectable } from '@nestjs/common';
import { User } from 'src/databases/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> { }
