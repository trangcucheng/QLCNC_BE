import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { ZaloAccount } from './ZaloAccount.entity';

@Entity('zalo_sessions')
export class ZaloSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'zalo_account_id', type: 'int' })
  zaloAccountId: number;

  @Column({ name: 'access_token', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ZaloAccount, account => account.sessions)
  @JoinColumn({ name: 'zalo_account_id' })
  zaloAccount: ZaloAccount;
}
