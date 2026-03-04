import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateZaloAccountsTable1728396000001 implements MigrationInterface {
  name = 'CreateZaloAccountsTable1728396000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng zalo_accounts
    await queryRunner.createTable(
      new Table({
        name: 'zalo_accounts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: 'Liên kết với bảng users.id',
          },
          {
            name: 'zalo_oa_user_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'ID từ follower.id của OA API',
          },
          {
            name: 'zalo_app_user_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'ID từ user_id_by_app của Mini App',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Tên hiển thị từ Zalo',
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'URL ảnh đại diện',
          },
          {
            name: 'is_following_oa',
            type: 'tinyint',
            default: 0,
            comment: 'Có đang follow OA không',
          },
          {
            name: 'last_follow_at',
            type: 'datetime',
            isNullable: true,
            comment: 'Lần follow OA gần nhất',
          },
          {
            name: 'last_unfollow_at',
            type: 'datetime',
            isNullable: true,
            comment: 'Lần unfollow OA gần nhất',
          },
          {
            name: 'last_active_at',
            type: 'datetime',
            isNullable: true,
            comment: 'Lần tương tác gần nhất',
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
      'zalo_accounts',
      new TableIndex({
        name: 'IDX_zalo_accounts_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'zalo_accounts',
      new TableIndex({
        name: 'IDX_zalo_accounts_oa_user_id',
        columnNames: ['zalo_oa_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'zalo_accounts',
      new TableIndex({
        name: 'IDX_zalo_accounts_app_user_id',
        columnNames: ['zalo_app_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'zalo_accounts',
      new TableIndex({
        name: 'IDX_zalo_accounts_following',
        columnNames: ['is_following_oa'],
      }),
    );

    // Tạo foreign key (nếu bảng users tồn tại)
    try {
      await queryRunner.createForeignKey(
        'zalo_accounts',
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
    await queryRunner.dropTable('zalo_accounts');
  }
}
