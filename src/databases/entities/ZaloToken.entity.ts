import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('zalo_tokens')
export class ZaloToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_type', length: 50 })
  tokenType: string; // 'access_token', 'refresh_token'

  @Column({ name: 'token_value', type: 'text' })
  tokenValue: string;

  @Column({ name: 'expires_at', type: 'bigint', nullable: true })
  expiresAt: number; // timestamp

  @Column({ name: 'app_id', length: 100 })
  appId: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
