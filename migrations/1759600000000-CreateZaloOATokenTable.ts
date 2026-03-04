import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateZaloOATokenTable1759600000000 implements MigrationInterface {
  name = 'CreateZaloOATokenTable1759600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'zalo_oa_tokens',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'oa_id',
            type: 'varchar',
            length: '255',
            comment: 'Zalo OA ID',
          },
          {
            name: 'access_token',
            type: 'text',
            comment: 'Access token của Zalo OA',
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: true,
            comment: 'Refresh token của Zalo OA',
          },
          {
            name: 'expires_in',
            type: 'int',
            comment: 'Thời gian hết hạn token (seconds)',
          },
          {
            name: 'expires_at',
            type: 'datetime',
            comment: 'Thời điểm hết hạn token',
          },
          {
            name: 'token_type',
            type: 'varchar',
            length: '50',
            default: "'Bearer'",
            comment: 'Loại token',
          },
          {
            name: 'scope',
            type: 'text',
            isNullable: true,
            comment: 'Phạm vi quyền của token',
          },
          {
            name: 'is_active',
            type: 'tinyint',
            default: 1,
            comment: '1: Active, 0: Inactive',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Thời gian tạo',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            comment: 'Thời gian cập nhật',
          },
        ],
        indices: [
          {
            name: 'IDX_ZALO_OA_TOKENS_OA_ID',
            columnNames: ['oa_id'],
          },
          {
            name: 'IDX_ZALO_OA_TOKENS_ACTIVE',
            columnNames: ['is_active'],
          },
          {
            name: 'IDX_ZALO_OA_TOKENS_EXPIRES_AT',
            columnNames: ['expires_at'],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('zalo_oa_tokens');
  }
}
