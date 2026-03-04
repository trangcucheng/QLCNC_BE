import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { User } from './user.entity';

@Entity('zalo_users')
export class ZaloUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: 'Zalo User ID' })
  zaloId: string;

  @Column({ comment: 'Tên người dùng Zalo' })
  name: string;

  @Column({ nullable: true, comment: 'Số điện thoại' })
  phone: string;

  @Column({ type: 'text', nullable: true, comment: 'Avatar URL' })
  avatar: string;

  @Column({ name: 'userId', nullable: true, comment: 'Liên kết với user hệ thống' })
  userId: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'json', nullable: true, comment: 'Thông tin bổ sung từ Zalo' })
  additionalInfo: any;

  @Column({ type: 'datetime', nullable: true, comment: 'Lần cuối đăng nhập' })
  lastLoginAt: Date;

  @Column({ type: 'boolean', default: true, comment: 'Trạng thái hoạt động' })
  isActive: boolean;

  @CreateDateColumn({ comment: 'Ngày tạo' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Ngày cập nhật' })
  updatedAt: Date;
}
