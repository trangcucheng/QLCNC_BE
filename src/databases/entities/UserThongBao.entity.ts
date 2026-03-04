import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ThongBao } from './ThongBao.entity';

export enum TrangThaiThongBao {
  CHUA_DOC = 'chua_doc',
  DA_DOC = 'da_doc',
  DA_XOA = 'da_xoa',
}

@Entity('user_thong_bao')
@Unique('UK_user_thong_bao', ['userId', 'thongBaoId'])
export class UserThongBao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, name: 'userId' })
  userId: string;

  @Column({ type: 'int', nullable: false, name: 'thong_bao_id' })
  thongBaoId: number;

  @Column({
    type: 'enum',
    enum: TrangThaiThongBao,
    default: TrangThaiThongBao.CHUA_DOC,
    name: 'trang_thai',
  })
  trangThai: TrangThaiThongBao;

  @Column({ type: 'text', nullable: true, name: 'ghi_chu' })
  ghiChu: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ThongBao, (thongBao) => thongBao.userThongBaos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'thong_bao_id' })
  thongBao: ThongBao;
}
