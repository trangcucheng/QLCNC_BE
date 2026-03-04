import { Column, CreateDateColumn, Entity, JoinColumn,ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CumKhuCongNghiep } from './CumKhuCongNghiep.entity';

@Entity('cong_ty_chua_co_cd')
export class CongTyChuaCoCD {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Tên công ty chưa có công đoàn' })
  ten: string;

  @Column({ type: 'int', nullable: true, comment: 'ID cụm khu công nghiệp' })
  cumKCNId: number;

  @CreateDateColumn({ comment: 'Ngày tạo' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Ngày cập nhật' })
  updatedAt: Date;

  @ManyToOne(() => CumKhuCongNghiep, { nullable: true })
  @JoinColumn({ name: 'cumKCNId' })
  cumKhuCongNghiep: CumKhuCongNghiep;
}
