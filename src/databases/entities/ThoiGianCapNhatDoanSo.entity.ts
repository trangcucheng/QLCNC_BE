import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum LoaiKyBaoCao {
  HANG_THANG = 'hang_thang',    // Báo cáo hàng tháng
  HANG_QUY = 'hang_quy',         // Báo cáo hàng quý
  HANG_NAM = 'hang_nam',         // Báo cáo hàng năm
  DOT_XUAT = 'dot_xuat'          // Đợt báo cáo đột xuất (1 lần)
}

@Entity('ThoiGianCapNhatDoanSo')
export class ThoiGianCapNhatDoanSo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: 'Tên đợt cập nhật' })
  ten: string;

  @Column({
    type: 'enum',
    enum: LoaiKyBaoCao,
    default: LoaiKyBaoCao.DOT_XUAT,
    comment: 'Loại kỳ báo cáo: hang_thang, hang_quy, hang_nam, dot_xuat'
  })
  loaiKy: LoaiKyBaoCao;

  // ===== TRƯỜNG CHO BÁO CÁO ĐỊNH KỲ (hang_thang, hang_quy, hang_nam) =====

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Ngày bắt đầu trong tháng (1-31). VD: 1 = ngày 1 hàng tháng'
  })
  ngayBatDauTrongThang: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Ngày kết thúc trong tháng (1-31). VD: 5 = ngày 5 hàng tháng'
  })
  ngayKetThucTrongThang: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Tháng bắt đầu áp dụng (1-12). Dùng cho báo cáo hàng quý/năm'
  })
  thangBatDau: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Năm bắt đầu áp dụng. VD: 2024'
  })
  namBatDau: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Năm kết thúc áp dụng (null = vô thời hạn)'
  })
  namKetThuc: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Các tháng áp dụng cho báo cáo hàng quý. VD: [1,4,7,10] cho 4 quý'
  })
  cacThangApDung: number[];

  // ===== TRƯỜNG CHO BÁO CÁO ĐỘT XUẤT =====

  @Column({ type: 'datetime', nullable: true, comment: 'Thời gian bắt đầu cụ thể (dùng cho đột xuất)' })
  thoiGianBatDau: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Thời gian kết thúc cụ thể (dùng cho đột xuất)' })
  thoiGianKetThuc: Date;

  @Column({ type: 'text', nullable: true, comment: 'Mô tả chi tiết' })
  moTa: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'Danh sách ID tổ chức (phân cách bởi dấu phẩy). Dùng cho báo cáo đột xuất' })
  organizationId: string;

  @Column({ type: 'boolean', default: true, comment: 'Trạng thái hoạt động' })
  isActive: boolean;

  @Column({ type: 'json', nullable: true, comment: 'Cấu hình lịch thông báo tự động (JSON)' })
  notification_schedules: any;

  @Column({ type: 'boolean', default: false, comment: 'Bật/tắt thông báo tự động' })
  auto_notification_enabled: boolean;

  @Column({ type: 'datetime', nullable: true, comment: 'Thời gian gửi thông báo tiếp theo' })
  next_notification_time: Date;

  @Column({ type: 'datetime', nullable: true, comment: 'Thời gian gửi thông báo lần cuối' })
  last_notification_time: Date;

  @CreateDateColumn({ comment: 'Ngày tạo' })
  createdAt: Date;

  @UpdateDateColumn({ comment: 'Ngày cập nhật' })
  updatedAt: Date;
}
