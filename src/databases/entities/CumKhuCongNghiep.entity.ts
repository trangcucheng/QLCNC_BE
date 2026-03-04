import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('cum_khu_cong_nghiep')
export class CumKhuCongNghiep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Tên cụm khu công nghiệp' })
  ten: string;

  @Column({ type: 'text', nullable: true, comment: 'Mô tả về cụm khu công nghiệp' })
  moTa: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Địa chỉ cụm khu công nghiệp' })
  diaChi: string;

  @CreateDateColumn({ comment: 'Ngày tạo' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Ngày cập nhật' })
  updatedAt: Date;
}
