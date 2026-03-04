import { MigrationInterface, QueryRunner } from "typeorm";

export class createTable1758806509382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng role trước vì user có tham chiếu đến role
        await queryRunner.query(`
            CREATE TABLE \`role\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`isActive\` int NOT NULL DEFAULT 1,
                \`permissions\` text,
                \`description\` varchar(500),
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Tạo bảng organization
        await queryRunner.query(`
            CREATE TABLE \`organization\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`OrganizationCode\` varchar(255) NOT NULL,
                \`OrganizationName\` varchar(255) NOT NULL,
                \`OrganizationTypeID\` int NOT NULL,
                \`OrganizationLevelID\` int NOT NULL,
                \`OrganizationDescription\` varchar(500),
                \`OrganizationAddress\` varchar(500),
                \`OrganizationParent\` int NOT NULL DEFAULT 0,
                \`isDelete\` int NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Tạo bảng user
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(255) NOT NULL,
                \`identity\` varchar(255) NOT NULL,
                \`forgetPassCode\` varchar(255),
                \`userName\` varchar(255) NOT NULL,
                \`passWord\` varchar(255) NOT NULL,
                \`roleId\` int NOT NULL DEFAULT 2,
                \`fullName\` varchar(255),
                \`phoneNumber\` varchar(50),
                \`email\` varchar(255),
                \`isActive\` int NOT NULL DEFAULT 1,
                \`isDelete\` int NOT NULL DEFAULT 0,
                \`avatar\` varchar(500),
                \`description\` varchar(500),
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_user_role\` (\`roleId\`),
                CONSTRAINT \`FK_user_role\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\` (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Tạo bảng staff
        await queryRunner.query(`
            CREATE TABLE \`staff\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`gender\` varchar(10) NULL,
                \`ethnicity\` varchar(50) NULL,
                \`dateOfBirth\` date NULL,
                \`cccd\` varchar(20) NULL,
                \`placeOfBirth\` varchar(255) NULL,
                \`email\` varchar(255) NULL,
                \`phone\` varchar(50) NULL,
                \`organizationId\` int NULL,
                \`rank\` varchar(100) NULL,
                \`position\` varchar(100) NULL,
                \`workStartDate\` date NULL,
                \`contractType\` varchar(100) NULL,
                \`salaryLevel\` decimal(10,2) NULL,
                \`bankAccount\` varchar(50) NULL,
                \`bankName\` varchar(100) NULL,
                \`taxCode\` varchar(20) NULL,
                \`socialInsuranceNumber\` varchar(20) NULL,
                \`healthInsuranceNumber\` varchar(20) NULL,
                \`isActive\` int NOT NULL DEFAULT 1,
                \`isDelete\` int NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_staff_organization\` (\`organizationId\`),
                CONSTRAINT \`FK_staff_organization\` FOREIGN KEY (\`organizationId\`) REFERENCES \`organization\` (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Tạo bảng UserToken
        await queryRunner.query(`
            CREATE TABLE \`UserToken\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`token\` varchar(1000) NOT NULL,
                \`expired\` varchar(255) NOT NULL,
                \`userId\` varchar(255) NOT NULL,
                \`deviceInfo\` varchar(500),
                \`isActive\` int NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_usertoken_user\` (\`userId\`),
                CONSTRAINT \`FK_usertoken_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Insert dữ liệu mặc định cho bảng role
        await queryRunner.query(`
            INSERT INTO \`role\` (\`name\`, \`isActive\`, \`permissions\`, \`description\`) VALUES
            ('Super Admin', 1, 'ALL', 'Quản trị viên hệ thống'),
            ('Admin', 1, 'USER_MANAGEMENT,ORGANIZATION_MANAGEMENT', 'Quản trị viên'),
            ('User', 1, 'VIEW_PROFILE', 'Người dùng thông thường')
        `);

        // Insert dữ liệu mặc định cho bảng organization
        await queryRunner.query(`
            INSERT INTO \`organization\` (\`OrganizationCode\`, \`OrganizationName\`, \`OrganizationTypeID\`, \`OrganizationLevelID\`, \`OrganizationDescription\`, \`OrganizationAddress\`, \`OrganizationParent\`) VALUES
            ('ROOT', 'Tổ chức gốc', 1, 1, 'Tổ chức cấp cao nhất', 'Hà Nội', 0)
        `);

        // Insert user admin mặc định (password được hash của '123456')
        await queryRunner.query(`
            INSERT INTO \`user\` (\`id\`, \`identity\`, \`userName\`, \`passWord\`, \`roleId\`, \`fullName\`, \`phoneNumber\`, \`email\`, \`isActive\`) VALUES
            ('admin', 'ADMIN001', 'admin', '$2b$10$CwTycUXWue0Thq9StjUM0uJ4/8/NeQyhGouxnK7bF8KQXE1c0O9Ke', 1, 'Administrator', '0123456789', 'admin@example.com', 1)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa theo thứ tự ngược lại để tránh lỗi foreign key
        await queryRunner.query(`DROP TABLE IF EXISTS \`UserToken\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`staff\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`user\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`organization\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`role\``);
    }

}
