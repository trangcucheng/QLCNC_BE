import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('xa_phuong')
export class XaPhuong {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Tên xã phường' })
  ten: string;

  @Column({ type: 'text', nullable: true, comment: 'Mô tả về xã phường' })
  moTa: string;

  @CreateDateColumn({ comment: 'Ngày tạo' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Ngày cập nhật' })
  updatedAt: Date;
}
