import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateZaloIntegrationTables1758890000001 implements MigrationInterface {
    name = 'CreateZaloIntegrationTables1758890000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng zalo_accounts (nếu chưa tồn tại)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`zalo_accounts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` varchar(36) NULL,
                \`zalo_mini_app_id\` varchar(255) NULL,
                \`zalo_oa_user_id\` varchar(255) NULL,
                \`display_name\` varchar(255) NULL,
                \`avatar\` varchar(500) NULL,
                \`phone\` varchar(20) NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                \`last_login_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_zalo_mini_app_id\` (\`zalo_mini_app_id\`),
                UNIQUE INDEX \`IDX_zalo_oa_user_id\` (\`zalo_oa_user_id\`),
                INDEX \`IDX_zalo_accounts_user_id\` (\`user_id\`)
            ) ENGINE=InnoDB
        `);

        // Tạo bảng zalo_sessions (nếu chưa tồn tại)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`zalo_sessions\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` varchar(36) NULL,
                \`access_token\` text NOT NULL,
                \`refresh_token\` varchar(500) NULL,
                \`expires_at\` datetime NOT NULL,
                \`token_type\` varchar(50) NOT NULL DEFAULT 'Bearer',
                \`scope\` varchar(255) NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_zalo_sessions_user_id\` (\`user_id\`),
                INDEX \`IDX_zalo_sessions_expires_at\` (\`expires_at\`)
            ) ENGINE=InnoDB
        `);

        // Tạo bảng oa_follow_events (nếu chưa tồn tại)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`oa_follow_events\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`zalo_oa_user_id\` varchar(255) NOT NULL,
                \`event_type\` enum('follow', 'unfollow') NOT NULL,
                \`event_data\` text NULL,
                \`processed_at\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_oa_follow_events_zalo_oa_user_id\` (\`zalo_oa_user_id\`),
                INDEX \`IDX_oa_follow_events_event_type\` (\`event_type\`),
                INDEX \`IDX_oa_follow_events_created_at\` (\`created_at\`)
            ) ENGINE=InnoDB
        `);

        // Skip foreign key constraints for now - will be added later when types are verified
        console.log('⚠️ Skipping foreign key constraints - will be added in separate migration');

        // TODO: Add foreign keys in separate migration after verifying user.id type
        // await queryRunner.query(`
        //     ALTER TABLE \`zalo_accounts\` 
        //     ADD CONSTRAINT \`FK_zalo_accounts_user\` 
        //     FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) 
        //     ON DELETE CASCADE ON UPDATE NO ACTION
        // `);

        // await queryRunner.query(`
        //     ALTER TABLE \`zalo_sessions\` 
        //     ADD CONSTRAINT \`FK_zalo_sessions_user\` 
        //     FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) 
        //     ON DELETE CASCADE ON UPDATE NO ACTION
        // `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints trước
        await queryRunner.query(`ALTER TABLE \`zalo_sessions\` DROP FOREIGN KEY \`FK_zalo_sessions_user\``);
        await queryRunner.query(`ALTER TABLE \`zalo_accounts\` DROP FOREIGN KEY \`FK_zalo_accounts_user\``);

        // Drop tables
        await queryRunner.query(`DROP TABLE \`oa_follow_events\``);
        await queryRunner.query(`DROP TABLE \`zalo_sessions\``);
        await queryRunner.query(`DROP TABLE \`zalo_accounts\``);
    }
}
