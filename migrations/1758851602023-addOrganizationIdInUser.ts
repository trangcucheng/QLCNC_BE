import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrganizationIdInUser1758851602023 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            ADD COLUMN \`organizationId\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` 
            DROP COLUMN \`organizationId\`
        `);
    }

}
