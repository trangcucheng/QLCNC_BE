import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateThoiGianCapNhatDoanSoForRecurring1730300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm cột loaiKy (enum)
    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'loaiKy',
      type: 'enum',
      enum: ['hang_thang', 'hang_quy', 'hang_nam', 'dot_xuat'],
      default: "'dot_xuat'",
      comment: 'Loại kỳ báo cáo: hang_thang, hang_quy, hang_nam, dot_xuat'
    }));

    // 2. Thêm các cột cho báo cáo định kỳ
    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'ngayBatDauTrongThang',
      type: 'int',
      isNullable: true,
      comment: 'Ngày bắt đầu trong tháng (1-31). VD: 1 = ngày 1 hàng tháng'
    }));

    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'ngayKetThucTrongThang',
      type: 'int',
      isNullable: true,
      comment: 'Ngày kết thúc trong tháng (1-31). VD: 5 = ngày 5 hàng tháng'
    }));

    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'thangBatDau',
      type: 'int',
      isNullable: true,
      comment: 'Tháng bắt đầu áp dụng (1-12). Dùng cho báo cáo hàng quý/năm'
    }));

    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'namBatDau',
      type: 'int',
      isNullable: true,
      comment: 'Năm bắt đầu áp dụng. VD: 2024'
    }));

    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'namKetThuc',
      type: 'int',
      isNullable: true,
      comment: 'Năm kết thúc áp dụng (null = vô thời hạn)'
    }));

    await queryRunner.addColumn('ThoiGianCapNhatDoanSo', new TableColumn({
      name: 'cacThangApDung',
      type: 'json',
      isNullable: true,
      comment: 'Các tháng áp dụng cho báo cáo hàng quý. VD: [1,4,7,10] cho 4 quý'
    }));

    // 3. Thay đổi thoiGianBatDau và thoiGianKetThuc thành nullable (dùng cho đột xuất)
    await queryRunner.changeColumn('ThoiGianCapNhatDoanSo', 'thoiGianBatDau', new TableColumn({
      name: 'thoiGianBatDau',
      type: 'datetime',
      isNullable: true,
      comment: 'Thời gian bắt đầu cụ thể (dùng cho đột xuất)'
    }));

    await queryRunner.changeColumn('ThoiGianCapNhatDoanSo', 'thoiGianKetThuc', new TableColumn({
      name: 'thoiGianKetThuc',
      type: 'datetime',
      isNullable: true,
      comment: 'Thời gian kết thúc cụ thể (dùng cho đột xuất)'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'cacThangApDung');
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'namKetThuc');
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'namBatDau');
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'thangBatDau');
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'ngayKetThucTrongThang');
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'ngayBatDauTrongThang');
    await queryRunner.dropColumn('ThoiGianCapNhatDoanSo', 'loaiKy');

    // Revert thoiGianBatDau and thoiGianKetThuc to NOT NULL
    await queryRunner.changeColumn('ThoiGianCapNhatDoanSo', 'thoiGianBatDau', new TableColumn({
      name: 'thoiGianBatDau',
      type: 'datetime',
      isNullable: false,
      comment: 'Thời gian bắt đầu'
    }));

    await queryRunner.changeColumn('ThoiGianCapNhatDoanSo', 'thoiGianKetThuc', new TableColumn({
      name: 'thoiGianKetThuc',
      type: 'datetime',
      isNullable: false,
      comment: 'Thời gian kết thúc'
    }));
  }
}
