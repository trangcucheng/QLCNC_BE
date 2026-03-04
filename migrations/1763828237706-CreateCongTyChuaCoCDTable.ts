import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCongTyChuaCoCDTable1763828237706 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'cong_ty_chua_co_cd',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'ten',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'Tên công ty chưa có công đoàn',
                    },
                    {
                        name: 'cumKCNId',
                        type: 'int',
                        isNullable: true,
                        comment: 'ID cụm khu công nghiệp',
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        comment: 'Ngày tạo',
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        comment: 'Ngày cập nhật',
                    },
                ],
            }),
            true,
        );

        // Tạo foreign key với bảng cum_khu_cong_nghiep
        await queryRunner.createForeignKey(
            'cong_ty_chua_co_cd',
            new TableForeignKey({
                columnNames: ['cumKCNId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'cum_khu_cong_nghiep',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa foreign key trước
        const table = await queryRunner.getTable('cong_ty_chua_co_cd');
        const foreignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf('cumKCNId') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('cong_ty_chua_co_cd', foreignKey);
        }

        // Xóa bảng
        await queryRunner.dropTable('cong_ty_chua_co_cd');
    }

}

