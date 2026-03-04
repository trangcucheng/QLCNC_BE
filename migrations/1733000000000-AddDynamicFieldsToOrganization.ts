import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDynamicFieldsToOrganization1733000000000 implements MigrationInterface {
  name = 'AddDynamicFieldsToOrganization1733000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm column dynamicFields vào bảng organization
    await queryRunner.query(`
            ALTER TABLE organization 
            ADD COLUMN dynamicFields JSON NULL 
            COMMENT 'Các trường dữ liệu động'
        `);

    // Tạo bảng OrganizationFieldSchema
    await queryRunner.query(`
            CREATE TABLE OrganizationFieldSchema (
                id int NOT NULL AUTO_INCREMENT,
                fieldKey varchar(255) NOT NULL UNIQUE,
                fieldName varchar(255) NOT NULL,
                fieldType enum('text', 'number', 'date', 'boolean', 'select', 'textarea') NOT NULL DEFAULT 'text',
                isRequired tinyint NOT NULL DEFAULT 0,
                isActive tinyint NOT NULL DEFAULT 1,
                fieldOptions json NULL,
                defaultValue varchar(255) NULL,
                sortOrder int NOT NULL DEFAULT 0,
                createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB
        `);

    // Tạo index cho fieldKey
    await queryRunner.query(`
            CREATE INDEX IDX_organization_field_schema_fieldKey 
            ON OrganizationFieldSchema (fieldKey)
        `);

    // Tạo index cho sortOrder và isActive
    await queryRunner.query(`
            CREATE INDEX IDX_organization_field_schema_sort_active 
            ON OrganizationFieldSchema (isActive, sortOrder)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng OrganizationFieldSchema
    await queryRunner.query(`DROP TABLE OrganizationFieldSchema`);

    // Xóa column dynamicFields khỏi bảng organization
    await queryRunner.query(`ALTER TABLE organization DROP COLUMN dynamicFields`);
  }
}
