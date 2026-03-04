import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateZaloSessionsTable1728396000002 implements MigrationInterface {
  name = 'CreateZaloSessionsTable1728396000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng zalo_sessions
    await queryRunner.createTable(
      new Table({
        name: 'zalo_sessions',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'session_key',
            type: 'varchar',
            length: '100',
            isUnique: true,
            comment: 'Khóa session duy nhất (state từ OAuth)',
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: 'ID người dùng (sau khi xác thực)',
          },
          {
            name: 'code_verifier',
            type: 'varchar',
            length: '128',
            comment: 'Code verifier cho PKCE',
          },
          {
            name: 'code_challenge',
            type: 'varchar',
            length: '128',
            comment: 'Code challenge cho PKCE',
          },
          {
            name: 'redirect_uri',
            type: 'varchar',
            length: '500',
            comment: 'URI để redirect sau OAuth',
          },
          {
            name: 'oauth_code',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Authorization code từ Zalo',
          },
          {
            name: 'access_token',
            type: 'text',
            isNullable: true,
            comment: 'Access token từ Zalo',
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: true,
            comment: 'Refresh token từ Zalo',
          },
          {
            name: 'expires_at',
            type: 'datetime',
            isNullable: true,
            comment: 'Thời điểm token hết hạn',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'AUTHORIZED', 'EXPIRED', 'REVOKED'],
            default: "'PENDING'",
            comment: 'Trạng thái session',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Tạo indexes
    await queryRunner.createIndex(
      'zalo_sessions',
      new TableIndex({
        name: 'IDX_zalo_sessions_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'zalo_sessions',
      new TableIndex({
        name: 'IDX_zalo_sessions_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'zalo_sessions',
      new TableIndex({
        name: 'IDX_zalo_sessions_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    // Tạo foreign key (nếu bảng users tồn tại)
    try {
      await queryRunner.createForeignKey(
        'zalo_sessions',
        new TableForeignKey({
          columnNames: ['user_id'],
          referencedTableName: 'user',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    } catch (error) {
      console.log('⚠️ Không thể tạo foreign key user_id, có thể bảng users chưa tồn tại');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('zalo_sessions');
  }
}
