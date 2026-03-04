import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { SuKien } from './SuKien.entity';

@Entity('nguoi_nhan_su_kien')
export class NguoiNhanSuKien extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nguoi_nhan_id', type: 'varchar', nullable: true })
  nguoiNhanId: string; // ID của người nhận (user ID)

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'nguoi_nhan_id' })
  nguoiNhan: User; // Liên kết với bảng user

  @Column({ name: 'su_kien_id', type: 'int' })
  suKienId: number; // ID của sự kiện

  @ManyToOne(() => SuKien, { nullable: false })
  @JoinColumn({ name: 'su_kien_id' })
  suKien: SuKien; // Liên kết với bảng sự kiện

  @Column({ name: 'trang_thai_xem', type: 'nvarchar', length: 20, default: 'Chưa xem' })
  trangThaiXem: string; // Trạng thái: "Đã xem", "Chưa xem"

  @Column({ name: 'thoi_gian_gui', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  thoiGianGui: Date; // Thời gian gửi thông báo

  @Column({ name: 'thoi_gian_xem', type: 'datetime', nullable: true })
  thoiGianXem: Date; // Thời gian người dùng xem thông báo

  @Column({ name: 'loai_thong_bao', type: 'nvarchar', length: 50, default: 'Thông báo sự kiện' })
  loaiThongBao: string; // Loại thông báo: "Thông báo sự kiện", "Nhắc nhở", "Hủy sự kiện"

  @Column({ name: 'ghi_chu', type: 'text', nullable: true })
  ghiChu: string; // Ghi chú thêm

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt: Date;
}
