import { MigrationInterface, QueryRunner } from "typeorm";

export class deleteUserName21758852356862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`userName\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
