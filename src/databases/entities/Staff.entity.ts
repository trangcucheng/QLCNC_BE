import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('staff')
export class Staff extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'nvarchar', length: 255 })
  name: string;

  @Column({ name: 'phone', type: 'nvarchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'organizationId', type: 'int', nullable: true })
  organizationId: number;

  @Column({ name: 'chucVuId', type: 'int', nullable: true })
  chucVuId: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
