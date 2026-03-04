import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('zalo_oa_tokens')
@Index('IDX_ZALO_OA_TOKENS_OA_ID', ['oaId'])
@Index('IDX_ZALO_OA_TOKENS_ACTIVE', ['isActive'])
@Index('IDX_ZALO_OA_TOKENS_EXPIRES_AT', ['expiresAt'])
export class ZaloOAToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'oa_id', type: 'varchar', length: 255, comment: 'Zalo OA ID' })
  oaId: string;

  @Column({ name: 'access_token', type: 'text', comment: 'Access token của Zalo OA' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true, comment: 'Refresh token của Zalo OA' })
  refreshToken: string;

  @Column({ name: 'expires_in', type: 'int', comment: 'Thời gian hết hạn token (seconds)' })
  expiresIn: number;

  @Column({ name: 'expires_at', type: 'datetime', comment: 'Thời điểm hết hạn token' })
  expiresAt: Date;

  @Column({ name: 'token_type', type: 'varchar', length: 50, default: 'Bearer', comment: 'Loại token' })
  tokenType: string;

  @Column({ name: 'scope', type: 'text', nullable: true, comment: 'Phạm vi quyền của token' })
  scope: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '1: Active, 0: Inactive' })
  isActive: number;

  @CreateDateColumn({ name: 'created_at', comment: 'Thời gian tạo' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'Thời gian cập nhật' })
  updatedAt: Date;
}
