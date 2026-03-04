import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNguoiPheDuyetToBaoCaoDoanSoTheoKy1759600000000 implements MigrationInterface {
    name = 'AddNguoiPheDuyetToBaoCaoDoanSoTheoKy1759600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm trường nguoiPheDuyetId vào bảng bao_cao_doan_so_theo_ky
        await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            ADD COLUMN \`nguoiPheDuyetId\` varchar(255) NULL COMMENT 'ID người phê duyệt hoặc từ chối báo cáo'
        `);

        // Thêm trường ngayPheDuyet để lưu thời gian phê duyệt/từ chối
        await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            ADD COLUMN \`ngayPheDuyet\` datetime NULL COMMENT 'Ngày giờ phê duyệt hoặc từ chối báo cáo'
        `);

        // Tạo index cho trường nguoiPheDuyetId để tối ưu hóa truy vấn
        await queryRunner.query(`
            CREATE INDEX \`IDX_bao_cao_doan_so_nguoi_phe_duyet\` 
            ON \`bao_cao_doan_so_theo_ky\` (\`nguoiPheDuyetId\`)
        `);

        // Tạo foreign key constraint (tùy chọn - có thể bỏ comment nếu muốn ràng buộc chặt chẽ)
        /*
        await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            ADD CONSTRAINT \`FK_bao_cao_doan_so_nguoi_phe_duyet\` 
            FOREIGN KEY (\`nguoiPheDuyetId\`) REFERENCES \`user\`(\`id\`) 
            ON DELETE SET NULL ON UPDATE CASCADE
        `);
        */
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa foreign key constraint (nếu đã tạo)
        /*
        await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            DROP FOREIGN KEY \`FK_bao_cao_doan_so_nguoi_phe_duyet\`
        `);
        */

        // Xóa index
        await queryRunner.query(`
            DROP INDEX \`IDX_bao_cao_doan_so_nguoi_phe_duyet\` 
            ON \`bao_cao_doan_so_theo_ky\`
        `);

        // Xóa các trường đã thêm
        await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            DROP COLUMN \`ngayPheDuyet\`
        `);

        await queryRunner.query(`
            ALTER TABLE \`bao_cao_doan_so_theo_ky\` 
            DROP COLUMN \`nguoiPheDuyetId\`
        `);
    }
}
