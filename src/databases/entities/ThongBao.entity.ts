import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { UserThongBao } from './UserThongBao.entity';

@Entity('thong_bao')
export class ThongBao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false, name: 'noi_dung_thong_bao' })
  noiDungThongBao: string;

  @Column({ type: 'varchar', nullable: false, name: 'nguoi_gui' })
  nguoiGui: string;

  @Column({ type: 'text', nullable: true, name: 'ghi_chu' })
  ghiChu: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'nguoi_gui' })
  nguoiGuiUser: User;

  @OneToMany(() => UserThongBao, (userThongBao) => userThongBao.thongBao)
  userThongBaos: UserThongBao[];
}
