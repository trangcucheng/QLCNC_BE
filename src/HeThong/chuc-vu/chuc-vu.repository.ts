import { EntityRepository, Repository } from 'typeorm';

import { ChucVu } from '../../databases/entities/ChucVu.entity';

@EntityRepository(ChucVu)
export class ChucVuRepository extends Repository<ChucVu> {
  // Có thể thêm các custom query methods ở đây nếu cần
}
