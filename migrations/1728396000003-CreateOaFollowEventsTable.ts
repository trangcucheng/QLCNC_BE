import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateOaFollowEventsTable1728396000003 implements MigrationInterface {
  name = 'CreateOaFollowEventsTable1728396000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng oa_follow_events
    await queryRunner.createTable(
      new Table({
        name: 'oa_follow_events',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'zalo_account_id',
            type: 'bigint',
            isNullable: true,
            comment: 'Liên kết với bảng zalo_accounts.id',
          },
          {
            name: 'zalo_oa_user_id',
            type: 'varchar',
            length: '50',
            comment: 'ID của user từ webhook event',
          },
          {
            name: 'event_type',
            type: 'enum',
            enum: ['follow', 'unfollow'],
            comment: 'Loại sự kiện',
          },
          {
            name: 'event_data',
            type: 'json',
            isNullable: true,
            comment: 'Dữ liệu gốc từ webhook',
          },
          {
            name: 'processed_at',
            type: 'datetime',
            isNullable: true,
            comment: 'Thời điểm xử lý event',
          },
          {
            name: 'is_processed',
            type: 'tinyint',
            default: 0,
            comment: 'Đã xử lý chưa',
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
            comment: 'Lỗi nếu có khi xử lý',
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
      'oa_follow_events',
      new TableIndex({
        name: 'IDX_oa_follow_events_zalo_account_id',
        columnNames: ['zalo_account_id'],
      }),
    );

    await queryRunner.createIndex(
      'oa_follow_events',
      new TableIndex({
        name: 'IDX_oa_follow_events_oa_user_id',
        columnNames: ['zalo_oa_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'oa_follow_events',
      new TableIndex({
        name: 'IDX_oa_follow_events_type',
        columnNames: ['event_type'],
      }),
    );

    await queryRunner.createIndex(
      'oa_follow_events',
      new TableIndex({
        name: 'IDX_oa_follow_events_processed',
        columnNames: ['is_processed'],
      }),
    );

    // Tạo foreign key
    try {
      await queryRunner.createForeignKey(
        'oa_follow_events',
        new TableForeignKey({
          columnNames: ['zalo_account_id'],
          referencedTableName: 'zalo_accounts',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    } catch (error) {
      console.log('⚠️ Không thể tạo foreign key zalo_account_id, có thể bảng zalo_accounts chưa được tạo');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('oa_follow_events');
  }
}
