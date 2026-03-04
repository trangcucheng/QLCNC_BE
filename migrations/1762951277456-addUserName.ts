import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserName1762951277456 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            ADD COLUMN \`userName\` varchar(255) NULL 
            AFTER \`roleId\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`userName\`
        `);
    }

}
