import { Column, CreateDateColumn, Entity, JoinColumn,ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { CumKhuCongNghiep } from './CumKhuCongNghiep.entity';
import { XaPhuong } from './XaPhuong.entity';

@Entity('organization')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Tên tổ chức' })
  name: string;

  @Column({ type: 'int', nullable: true, comment: 'ID cụm khu công nghiệp' })
  cumKhuCnId: number;

  @ManyToOne(() => CumKhuCongNghiep, { nullable: true })
  @JoinColumn({ name: 'cumKhuCnId' })
  cumKhuCongNghiep: CumKhuCongNghiep;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Ngành nghề sản xuất kinh doanh' })
  nganhNgheSxKinhDoanh: string;

  @Column({ type: 'int', default: 0, comment: 'Số lượng công nhân viên chức lao động nam' })
  slCongNhanVienChucLdNam: number;

  @Column({ type: 'int', default: 0, comment: 'Số lượng công nhân viên chức lao động nữ' })
  slCongNhanVienChucLdNu: number;

  @Column({ type: 'int', default: 0, comment: 'Số lượng công đoàn nam' })
  slCongDoanNam: number;

  @Column({ type: 'int', default: 0, comment: 'Số lượng công đoàn nữ' })
  slCongDoanNu: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Loại hình' })
  loaiHinh: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Loại công ty' })
  loaiCongTy: string;

  @Column({ type: 'date', nullable: true, comment: 'Ngày thành lập' })
  namThanhLap: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'Quốc gia' })
  quocGia: string;

  @Column({ type: 'int', nullable: true, comment: 'ID xã phường' })
  xaPhuongId: number;

  @ManyToOne(() => XaPhuong, { nullable: true })
  @JoinColumn({ name: 'xaPhuongId' })
  xaPhuong: XaPhuong;

  @Column({ type: 'text', nullable: true, comment: 'Ghi chú' })
  ghiChu: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: 'Tên chủ tịch công đoàn' })
  tenChuTichCongDoan: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: 'Số điện thoại chủ tịch' })
  sdtChuTich: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Địa chỉ' })
  diaChi: string;

  @Column({ type: 'int', nullable: true, comment: 'ID công đoàn cấp trên' })
  organizationParentId: number;

  @Column({ type: 'int', nullable: true, comment: 'Cấp độ tổ chức' })
  organizationLevel: number;

  @Column({ type: 'int', default: 0, comment: 'Số Ủy viên Ban Chấp hành' })
  soUyVienBch: number;

  @Column({ type: 'int', default: 0, comment: 'Số Ủy viên Ủy ban Kiểm tra' })
  soUyVienUbkt: number;

  @Column({ type: 'int', default: 0, comment: 'Tổng số lượng công đoàn' })
  tongSoCongDoan: number;

  @Column({ type: 'int', default: 0, comment: 'Tổng số lượng công nhân viên chức lao động' })
  tongSoCnvcld: number;

  @Column('json', { nullable: true, comment: 'Các trường dữ liệu động' })
  dynamicFields: Record<string, any>;

  @CreateDateColumn({ comment: 'Ngày tạo' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Ngày cập nhật' })
  updatedAt: Date;
}
