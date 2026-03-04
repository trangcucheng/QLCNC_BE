import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateZaloOAuthStateTable1737364800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'zalo_oauth_states',
        columns: [
          {
            name: 'state',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'code_verifier',
            type: 'text',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            default: 'DATE_ADD(NOW(), INTERVAL 10 MINUTE)',
          },
        ],
        indices: [
          {
            name: 'IDX_expires_at',
            columnNames: ['expires_at'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('zalo_oauth_states');
  }
}
