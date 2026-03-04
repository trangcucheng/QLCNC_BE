import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('chuc_vu')
export class ChucVu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ten_chuc_vu', type: 'nvarchar', length: 255 })
  tenChucVu: string; // tên chức vụ

  @Column({ name: 'mo_ta', type: 'nvarchar', length: 255, nullable: true })
  moTa: string; // mô tả chức vụ

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
