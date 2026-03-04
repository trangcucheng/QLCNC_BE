import { MigrationInterface, QueryRunner } from "typeorm";

export class deleteUserName1758851927461 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`userName\`
        `);
    }

}
