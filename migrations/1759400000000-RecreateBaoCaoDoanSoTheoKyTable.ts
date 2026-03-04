import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateBaoCaoDoanSoTheoKyTable1759400000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng bao_cao_doan_so_theo_ky cũ (nếu tồn tại)
    await queryRunner.query(`DROP TABLE IF EXISTS \`bao_cao_doan_so_theo_ky\``);

    // Tạo lại bảng bao_cao_doan_so_theo_ky với cấu trúc mới
    await queryRunner.query(`
            CREATE TABLE \`bao_cao_doan_so_theo_ky\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`tenBaoCao\` varchar(255) NOT NULL,
                \`thoiGianCapNhatDoanSoId\` int NOT NULL,
                \`nguoiBaoCaoId\` varchar(255) NOT NULL,
                \`organizationId\` int NOT NULL,
                \`soLuongDoanVienNam\` int NOT NULL DEFAULT 0,
                \`soLuongDoanVienNu\` int NOT NULL DEFAULT 0,
                \`soLuongCNVCLDNam\` int NOT NULL DEFAULT 0,
                \`soLuongCNVCLDNu\` int NOT NULL DEFAULT 0,
                \`noiDung\` text NULL,
                \`trangThaiPheDuyet\` varchar(255) NOT NULL DEFAULT 'cho_phe_duyet',
                \`ghiChu\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
               
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng mới được tạo
    await queryRunner.query(`DROP TABLE IF EXISTS \`bao_cao_doan_so_theo_ky\``);
  }

}
