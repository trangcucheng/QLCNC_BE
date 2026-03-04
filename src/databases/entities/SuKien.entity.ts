import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { LoaiSuKien } from './LoaiSuKien.entity';

@Entity('su_kien')
export class SuKien extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ten_su_kien', type: 'nvarchar', length: 255 })
  tenSuKien: string; // tên sự kiện

  @Column({ name: 'thoi_gian_bat_dau', type: 'datetime' })
  thoiGianBatDau: Date; // thời gian bắt đầu

  @Column({ name: 'thoi_gian_ket_thuc', type: 'datetime' })
  thoiGianKetThuc: Date; // thời gian kết thúc

  @Column({ name: 'nguoi_tao', type: 'varchar', nullable: true })
  nguoiTao: string; // userId của người tạo sự kiện

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'nguoi_tao' })
  user: User; // Liên kết với bảng user

  @Column({ name: 'noi_dung_su_kien', type: 'text', nullable: true })
  noiDungSuKien: string; // nội dung sự kiện

  @Column({ name: 'dia_diem', type: 'nvarchar', length: 255, nullable: true })
  diaDiem: string; // địa điểm tổ chức

  @Column({ name: 'trang_thai', type: 'nvarchar', length: 50, default: 'Đang chuẩn bị' })
  trangThai: string; // trạng thái: Đang chuẩn bị, Đang diễn ra, Đã kết thúc, Đã hủy

  @Column({ name: 'doi_tuong', type: 'nvarchar', length: 255, nullable: true })
  doiTuong: string; // đối tượng tham gia

  @Column({ name: 'loai_su_kien_id', type: 'int', nullable: true })
  loaiSuKienId: number; // liên kết với bảng loại sự kiện

  @ManyToOne(() => LoaiSuKien, { nullable: true })
  @JoinColumn({ name: 'loai_su_kien_id' })
  loaiSuKien: LoaiSuKien; // Liên kết với bảng loại sự kiện

  @Column({ name: 'so_luong_tham_gia_du_kien', type: 'int', nullable: true, default: 0 })
  soLuongThamGiaDuKien: number; // số lượng dự kiến tham gia

  @Column({ name: 'file_dinh_kem', type: 'text', nullable: true })
  fileDinhKem: string; // đường dẫn file đính kèm (có thể nhiều file, lưu dạng JSON)

  @Column({ name: 'ghi_chu', type: 'text', nullable: true })
  ghiChu: string; // ghi chú thêm

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
