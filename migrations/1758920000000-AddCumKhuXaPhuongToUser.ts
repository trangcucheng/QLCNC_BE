import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCumKhuXaPhuongToUser1758920000000 implements MigrationInterface {
  name = 'AddCumKhuXaPhuongToUser1758920000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột cumKhuCnId vào bảng user
    await queryRunner.addColumn("user", new TableColumn({
      name: "cumKhuCnId",
      type: "int",
      isNullable: true,
      comment: "ID của cụm khu công nghiệp"
    }));

    // Thêm cột xaPhuongId vào bảng user
    await queryRunner.addColumn("user", new TableColumn({
      name: "xaPhuongId",
      type: "int",
      isNullable: true,
      comment: "ID của xã phường"
    }));


  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    // Xóa các cột
    await queryRunner.dropColumn("user", "xaPhuongId");
    await queryRunner.dropColumn("user", "cumKhuCnId");
  }
}
