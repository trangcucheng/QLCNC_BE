import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBaoCaoDoanSoTheoKyTable1758890000000 implements MigrationInterface {
  name = 'CreateBaoCaoDoanSoTheoKyTable1758890000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng bao_cao_doan_so_theo_ky
    await queryRunner.createTable(
      new Table({
        name: 'bao_cao_doan_so_theo_ky',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tenBaoCao',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'thoiGianCapNhatDoanSoId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'nguoiBaoCaoId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'organizationId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'soLuongDoanVienNam',
            type: 'int',
            default: 0,
          },
          {
            name: 'soLuongDoanVienNu',
            type: 'int',
            default: 0,
          },
          {
            name: 'soLuongCNVCLDNam',
            type: 'int',
            default: 0,
          },
          {
            name: 'soLuongCNVCLDNu',
            type: 'int',
            default: 0,
          },
          {
            name: 'noiDung',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'trangThaiPheDuyet',
            type: 'enum',
            enum: ['cho_phe_duyet', 'da_phe_duyet', 'tu_choi'],
            default: "'cho_phe_duyet'",
          },
          {
            name: 'ghiChu',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Thêm dữ liệu mẫu
    await queryRunner.query(`
      INSERT INTO bao_cao_doan_so_theo_ky (
        tenBaoCao, 
        thoiGianCapNhatDoanSoId, 
        nguoiBaoCaoId, 
        organizationId,
        soLuongDoanVienNam,
        soLuongDoanVienNu,
        soLuongCNVCLDNam,
        soLuongCNVCLDNu,
        noiDung,
        trangThaiPheDuyet,
        ghiChu
      ) VALUES 
      (
        'Báo cáo đoàn số Q1/2025 - Công đoàn Công ty ABC', 
        1, 
        '1', 
        1,
        45,
        35,
        20,
        15,
        'Báo cáo số lượng đoàn viên và CNVCLĐ quý 1 năm 2025. Tăng 5% so với cùng kỳ năm trước.',
        'da_phe_duyet',
        'Đã được phê duyệt bởi lãnh đạo'
      ),
      (
        'Báo cáo đoàn số Q1/2025 - Công đoàn Công ty XYZ', 
        1, 
        '2', 
        2,
        30,
        25,
        15,
        10,
        'Báo cáo đoàn số quý 1. Có sự gia tăng về số lượng đoàn viên nữ.',
        'cho_phe_duyet',
        null
      ),
      (
        'Báo cáo đoàn số Q2/2025 - Công đoàn Công ty DEF', 
        2, 
        '3', 
        3,
        55,
        40,
        25,
        20,
        'Báo cáo đoàn số quý 2 năm 2025. Tổng cộng 140 người.',
        'cho_phe_duyet',
        null
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng
    await queryRunner.dropTable('bao_cao_doan_so_theo_ky');
  }
}
