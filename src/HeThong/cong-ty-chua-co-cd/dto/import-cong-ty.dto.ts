import { ApiProperty } from '@nestjs/swagger';

export class ImportCongTyResultDto {
  @ApiProperty({ description: 'Số lượng công ty được thêm thành công' })
  successCount: number;

  @ApiProperty({ description: 'Số lượng công ty bị lỗi' })
  errorCount: number;

  @ApiProperty({ description: 'Chi tiết lỗi theo sheet và row' })
  errors: {
    [sheetName: string]: {
      [rowIndex: number]: string[];
    };
  };

  @ApiProperty({ description: 'Danh sách ID công ty đã tạo' })
  createdIds: number[];

  @ApiProperty({ description: 'Số lượng cụm khu công nghiệp mới được tạo' })
  newCumKhuCount: number;

  @ApiProperty({ description: 'Danh sách cụm khu công nghiệp mới' })
  newCumKhuNames: string[];
}
