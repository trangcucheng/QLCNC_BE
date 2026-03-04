import { MigrationInterface, QueryRunner } from "typeorm";

export class addIndex1763543905000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Index cho foreign keys của bảng bao_cao_doan_so_theo_ky
        await queryRunner.query(`
            CREATE INDEX idx_baocao_organization 
            ON bao_cao_doan_so_theo_ky(organizationId)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_baocao_nguoi_bao_cao 
            ON bao_cao_doan_so_theo_ky(nguoiBaoCaoId)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_baocao_thoi_gian 
            ON bao_cao_doan_so_theo_ky(thoiGianCapNhatDoanSoId)
        `);

        // Composite index cho filter thường dùng (trạng thái + ngày tạo)
        await queryRunner.query(`
            CREATE INDEX idx_baocao_status_date 
            ON bao_cao_doan_so_theo_ky(trangThaiPheDuyet, createdAt)
        `);

        // Index cho cụm khu công nghiệp và xã phường
        await queryRunner.query(`
            CREATE INDEX idx_baocao_cumkhu 
            ON bao_cao_doan_so_theo_ky(cumKhuCnId)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_baocao_xa_phuong 
            ON bao_cao_doan_so_theo_ky(xaPhuongId)
        `);

        // Index cho bảng organization (optimize subquery)
        await queryRunner.query(`
            CREATE INDEX idx_org_cumkhu 
            ON organization(cumKhuCnId)
        `);

        await queryRunner.query(`
            CREATE INDEX idx_org_xa_phuong 
            ON organization(xaPhuongId)
        `);

        // Index cho createdAt để optimize ORDER BY
        await queryRunner.query(`
            CREATE INDEX idx_baocao_created_at 
            ON bao_cao_doan_so_theo_ky(createdAt)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các index khi rollback
        await queryRunner.query(`DROP INDEX idx_baocao_organization ON bao_cao_doan_so_theo_ky`);
        await queryRunner.query(`DROP INDEX idx_baocao_nguoi_bao_cao ON bao_cao_doan_so_theo_ky`);
        await queryRunner.query(`DROP INDEX idx_baocao_thoi_gian ON bao_cao_doan_so_theo_ky`);
        await queryRunner.query(`DROP INDEX idx_baocao_status_date ON bao_cao_doan_so_theo_ky`);
        await queryRunner.query(`DROP INDEX idx_baocao_cumkhu ON bao_cao_doan_so_theo_ky`);
        await queryRunner.query(`DROP INDEX idx_baocao_xa_phuong ON bao_cao_doan_so_theo_ky`);
        await queryRunner.query(`DROP INDEX idx_org_cumkhu ON organization`);
        await queryRunner.query(`DROP INDEX idx_org_xa_phuong ON organization`);
        await queryRunner.query(`DROP INDEX idx_baocao_created_at ON bao_cao_doan_so_theo_ky`);
    }

}
