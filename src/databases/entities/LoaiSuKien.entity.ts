import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('loai_su_kien')
export class LoaiSuKien extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ten', type: 'nvarchar', length: 255 })
  ten: string; // tên loại sự kiện

  @Column({ name: 'mo_ta', type: 'nvarchar', length: 500, nullable: true })
  moTa: string; // mô tả loại sự kiện

  @Column({ name: 'trang_thai', type: 'boolean', default: true })
  trangThai: boolean; // trạng thái hoạt động

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
