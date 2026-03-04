import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { User } from './user.entity';
import { ZaloSession } from './ZaloSession.entity';

@Entity('zalo_accounts')
export class ZaloAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'zalo_oa_user_id', nullable: true })
  zaloOaUserId: string; // follower.id từ OA API

  @Column({ name: 'zalo_app_user_id', nullable: true })
  zaloAppUserId: string; // user_id_by_app từ Mini App

  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'is_following_oa', type: 'tinyint', default: 0 })
  isFollowingOa: boolean;

  @Column({ name: 'last_follow_at', type: 'datetime', nullable: true })
  lastFollowAt: Date;

  @Column({ name: 'last_unfollow_at', type: 'datetime', nullable: true })
  lastUnfollowAt: Date;

  @Column({ name: 'last_active_at', type: 'datetime', nullable: true })
  lastActiveAt: Date;

  // Extended fields from ZaloUser migration
  @Column({ name: 'zalo_mini_app_id', nullable: true })
  zaloMiniAppId: string; // zaloId từ Mini App login (cũ ZaloUser.zaloId)

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'additional_info', type: 'json', nullable: true })
  additionalInfo: any;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ZaloSession, session => session.zaloAccount)
  sessions: ZaloSession[];
}
