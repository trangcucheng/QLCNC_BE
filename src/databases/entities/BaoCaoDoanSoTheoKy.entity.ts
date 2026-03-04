import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from './Organization.entity';
import { ThoiGianCapNhatDoanSo } from './ThoiGianCapNhatDoanSo.entity';
import { User } from './user.entity';

export enum TrangThaiPheDuyet {
  CHO_PHE_DUYET = 'cho_phe_duyet',
  DA_PHE_DUYET = 'da_phe_duyet',
  TU_CHOI = 'tu_choi',
}

export enum LoaiBaoCao {
  DINH_KY = 'dinh_ky',
  DOT_XUAT = 'dot_xuat',
}

@Entity('bao_cao_doan_so_theo_ky')
export class BaoCaoDoanSoTheoKy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  tenBaoCao: string;

  @Column({ type: 'int', nullable: false })
  thoiGianCapNhatDoanSoId: number;

  @Column({ type: 'varchar', nullable: false })
  nguoiBaoCaoId: string;

  @Column({ type: 'int', nullable: false })
  organizationId: number;

  @Column({ type: 'int', nullable: true })
  xaPhuongId: number;

  @Column({ type: 'int', nullable: true })
  cumKhuCnId: number;

  @Column({ type: 'int', default: 0 })
  soLuongDoanVienNam: number;

  @Column({ type: 'int', default: 0 })
  soLuongDoanVienNu: number;

  @Column({ type: 'int', default: 0 })
  soLuongCNVCLDNam: number;

  @Column({ type: 'int', default: 0 })
  soLuongCNVCLDNu: number;

  @Column({ type: 'int', default: 0, comment: 'Tổng số lượng công đoàn' })
  tongSoCongDoan: number;

  @Column({ type: 'int', default: 0, comment: 'Tổng số lượng công nhân viên chức lao động' })
  tongSoCnvcld: number;

  @Column({ type: 'text', nullable: true })
  noiDung: string;

  @Column({
    type: 'enum',
    enum: LoaiBaoCao,
    default: LoaiBaoCao.DINH_KY,
    comment: 'Loại báo cáo: Định kỳ hoặc Đột xuất',
  })
  loaiBaoCao: LoaiBaoCao;

  @Column({
    type: 'enum',
    enum: TrangThaiPheDuyet,
    default: TrangThaiPheDuyet.CHO_PHE_DUYET,
  })
  trangThaiPheDuyet: TrangThaiPheDuyet;

  @Column({ type: 'text', nullable: true })
  ghiChu: string;

  @Column({ type: 'varchar', nullable: true })
  nguoiPheDuyetId: string;

  @Column({ type: 'datetime', nullable: true })
  ngayPheDuyet: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'nguoiPheDuyetId' })
  nguoiPheDuyet: User;
}
