import { ApiProperty } from '@nestjs/swagger';

export class ImportByCumKhuResultDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Import thành công 50 công đoàn từ 5 cụm khu công nghiệp' })
  message: string;

  @ApiProperty({
    example: {
      totalSheets: 5,
      totalOrganizations: 50,
      totalCumKhuCreated: 2,
      totalCumKhuExisted: 3,
      sheets: [
        {
          sheetName: 'Cụm KCN Đông Nam',
          cumKhuCongNghiepId: 1,
          cumKhuStatus: 'existed',
          totalRows: 10,
          successCount: 9,
          errorCount: 1,
          errors: [
            {
              row: 5,
              error: 'Thiếu tên công đoàn'
            }
          ]
        }
      ]
    }
  })
  data: {
    totalSheets: number;
    totalOrganizations: number;
    totalCumKhuCreated: number;
    totalCumKhuExisted: number;
    sheets: Array<{
      sheetName: string;
      cumKhuCongNghiepId: number;
      cumKhuStatus: 'created' | 'existed';
      totalRows: number;
      successCount: number;
      errorCount: number;
      errors: Array<{
        row: number;
        error: string;
      }>;
    }>;
  };
}
