import { ApiProperty } from '@nestjs/swagger';

export class ImportExcelFileDto {
  @ApiProperty({
    description: 'File Excel cần import',
    type: 'string',
    format: 'binary'
  })
  file: any;

  @ApiProperty({
    description: 'Hàng bắt đầu dữ liệu (mặc định là 3)',
    required: false,
    example: 3
  })
  startRow?: number = 3;

  @ApiProperty({
    description: 'Tên sheet (mặc định là sheet đầu tiên)',
    required: false,
    example: 'Sheet1'
  })
  sheetName?: string;
}
