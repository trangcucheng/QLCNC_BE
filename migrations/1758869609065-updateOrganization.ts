import { MigrationInterface, QueryRunner } from "typeorm";

export class updateOrganization1758869609065 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra và xóa các cột cũ từng cái một
        const columnsToRemove = [
            'OrganizationCode', 'OrganizationName', 'OrganizationTypeID',
            'OrganizationLevelID', 'OrganizationDescription', 'OrganizationAddress',
            'OrganizationParent', 'isDelete'
        ];

        for (const column of columnsToRemove) {
            try {
                await queryRunner.query(`ALTER TABLE \`organization\` DROP COLUMN \`${column}\``);
            } catch (error) {
                // Cột không tồn tại, bỏ qua
                console.log(`Column ${column} does not exist, skipping...`);
            }
        }

        // Thêm cột name
        try {
            await queryRunner.query(`
                ALTER TABLE \`organization\` 
                ADD COLUMN \`name\` varchar(255) NOT NULL DEFAULT '' COMMENT 'Tên tổ chức'
            `);
        } catch (error) {
            console.log('Column name already exists, skipping...');
        }

        // Thêm từng cột mới để tránh lỗi
        const newColumns = [
            { name: 'cumKhuCnId', def: 'int NULL COMMENT \'ID cụm khu công nghiệp\'' },
            { name: 'nganhNgheSxKinhDoanh', def: 'varchar(500) NULL COMMENT \'Ngành nghề sản xuất kinh doanh\'' },
            { name: 'slCongNhanVienChucLdNam', def: 'int DEFAULT 0 COMMENT \'Số lượng công nhân viên chức lao động nam\'' },
            { name: 'slCongNhanVienChucLdNu', def: 'int DEFAULT 0 COMMENT \'Số lượng công nhân viên chức lao động nữ\'' },
            { name: 'slCongDoanNam', def: 'int DEFAULT 0 COMMENT \'Số lượng công đoàn nam\'' },
            { name: 'slCongDoanNu', def: 'int DEFAULT 0 COMMENT \'Số lượng công đoàn nữ\'' },
            { name: 'loaiHinh', def: 'varchar(100) NULL COMMENT \'Loại hình\'' },
            { name: 'loaiCongTy', def: 'varchar(100) NULL COMMENT \'Loại công ty\'' },
            { name: 'namThanhLap', def: 'int NULL COMMENT \'Năm thành lập\'' },
            { name: 'quocGia', def: 'varchar(100) NULL COMMENT \'Quốc gia\'' },
            { name: 'xaPhuongId', def: 'int NULL COMMENT \'ID xã phường\'' },
            { name: 'ghiChu', def: 'text NULL COMMENT \'Ghi chú\'' },
            { name: 'tenChuTichCongDoan', def: 'varchar(255) NULL COMMENT \'Tên chủ tịch công đoàn\'' },
            { name: 'sdtChuTich', def: 'varchar(20) NULL COMMENT \'Số điện thoại chủ tịch\'' },
            { name: 'diaChi', def: 'varchar(500) NULL COMMENT \'Địa chỉ\'' },
            { name: 'organizationParentId', def: 'int NULL COMMENT \'ID công đoàn cấp trên\'' },
            { name: 'organizationLevel', def: 'int NULL COMMENT \'Cấp độ tổ chức\'' }
        ];

        for (const col of newColumns) {
            try {
                await queryRunner.query(`ALTER TABLE \`organization\` ADD COLUMN \`${col.name}\` ${col.def}`);
            } catch (error) {
                console.log(`Column ${col.name} already exists, skipping...`);
            }
        }

        // Thêm cột timestamp
        try {
            await queryRunner.query(`
                ALTER TABLE \`organization\` 
                ADD COLUMN \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT 'Ngày tạo'
            `);
        } catch (error) {
            console.log('Column createdAt already exists, skipping...');
        }

        try {
            await queryRunner.query(`
                ALTER TABLE \`organization\` 
                ADD COLUMN \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT 'Ngày cập nhật'
            `);
        } catch (error) {
            console.log('Column updatedAt already exists, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các cột mới từng cái một
        const newColumns = [
            'cumKhuCnId', 'nganhNgheSxKinhDoanh', 'slCongNhanVienChucLdNam',
            'slCongNhanVienChucLdNu', 'slCongDoanNam', 'slCongDoanNu',
            'loaiHinh', 'loaiCongTy', 'namThanhLap', 'quocGia',
            'xaPhuongId', 'ghiChu', 'tenChuTichCongDoan', 'sdtChuTich',
            'diaChi', 'organizationParentId', 'organizationLevel', 'createdAt', 'updatedAt'
        ];

        for (const column of newColumns) {
            try {
                await queryRunner.query(`ALTER TABLE \`organization\` DROP COLUMN \`${column}\``);
            } catch (error) {
                console.log(`Column ${column} does not exist, skipping...`);
            }
        }

        // Khôi phục các cột cũ từng cái một
        const oldColumns = [
            { name: 'OrganizationCode', def: 'varchar(50) NULL' },
            { name: 'OrganizationName', def: 'varchar(255) NULL' },
            { name: 'OrganizationTypeID', def: 'int NULL' },
            { name: 'OrganizationLevelID', def: 'int NULL' },
            { name: 'OrganizationDescription', def: 'text NULL' },
            { name: 'OrganizationAddress', def: 'varchar(500) NULL' },
            { name: 'OrganizationParent', def: 'int DEFAULT 0' },
            { name: 'isDelete', def: 'tinyint DEFAULT 0' }
        ];

        for (const col of oldColumns) {
            try {
                await queryRunner.query(`ALTER TABLE \`organization\` ADD COLUMN \`${col.name}\` ${col.def}`);
            } catch (error) {
                console.log(`Column ${col.name} already exists, skipping...`);
            }
        }
    }
}
