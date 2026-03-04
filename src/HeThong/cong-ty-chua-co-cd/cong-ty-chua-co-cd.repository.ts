import { CongTyChuaCoCD } from 'src/databases/entities/CongTyChuaCoCD.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(CongTyChuaCoCD)
export class CongTyChuaCoCDRepository extends Repository<CongTyChuaCoCD> {
}
