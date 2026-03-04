import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';


@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identity' })
  identity: string;

  @Column({ name: 'forgetPassCode' })
  forgetPassCode: string;

  @Column({ name: 'passWord' })
  passWord: string;

  @Column({ name: 'roleId', default: 2 })
  roleId: number;

  @Column({ name: 'userName', nullable: true })
  userName: string;

  @Column({ name: 'fullName' })
  fullName: string;

  @Column({ name: 'phoneNumber' })
  phoneNumber: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'isActive', default: 1 })
  isActive: number;

  @Column({ name: 'isDelete', default: 0 })
  isDelete: number;

  @Column({ name: 'avatar' })
  avatar: string;

  @Column({ name: 'description' })
  description: string

  @Column({ name: 'organizationId', nullable: true })
  organizationId: number;

  @Column({ name: 'cumKhuCnId', nullable: true })
  cumKhuCnId: number;

  @Column({ name: 'xaPhuongId', nullable: true })
  xaPhuongId: number;

  @Column({ name: 'failedLoginAttempts', default: 0, comment: 'Số lần nhập sai mật khẩu' })
  failedLoginAttempts: number;

  @Column({ name: 'lastFailedLoginAt', type: 'datetime', nullable: true, comment: 'Thời điểm nhập sai mật khẩu gần nhất' })
  lastFailedLoginAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
