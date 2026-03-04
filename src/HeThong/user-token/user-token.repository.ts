import { Injectable } from '@nestjs/common';
import { UserToken } from 'src/databases/entities/userToken.entity';
import { EntityRepository, Repository } from 'typeorm';

@Injectable()
@EntityRepository(UserToken)
export class UserTokenRepository extends Repository<UserToken> { }
