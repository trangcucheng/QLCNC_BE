import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('oa_follow_events')
export class OaFollowEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'zalo_oa_user_id', type: 'varchar', length: 50 })
  zaloOaUserId: string; // follower.id

  @Column({ name: 'event_name', type: 'varchar', length: 50 })
  eventName: string; // 'follow' hoặc 'unfollow'

  @Column({ name: 'timestamp', type: 'datetime' })
  timestamp: Date;

  @Column({ name: 'source', type: 'varchar', length: 50, nullable: true })
  source: string; // 'follow_button', 'menu', etc.

  @Column({ name: 'raw_data', type: 'json', nullable: true })
  rawData: any; // Payload webhook

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
