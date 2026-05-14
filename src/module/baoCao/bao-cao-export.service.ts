import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  BorderStyle,
  WidthType,
} from 'docx';
import * as PdfPrinter from 'pdfmake';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoQueryDTO } from './dto/bao-cao-query.dto';

@Injectable()
export class BaoCaoExportService {
  constructor(private readonly baoCaoService: BaoCaoService) { }

  // ===== EXCEL EXPORT =====
  async exportToExcel(query: BaoCaoQueryDTO): Promise<string> {
    // Xác định loại báo cáo cần xuất
    let data: any;
    let loaiBaoCao = query.loaiBaoCao || 'tong-hop';
    
    if (loaiBaoCao === 'khu-vuc') {
      const baoCao = await this.baoCaoService.baoCaoTheoKhuVuc(query);
      data = { theoKhuVuc: baoCao.data, thoiGian: { tuNgay: query.tuNgay, denNgay: query.denNgay } };
    } else if (loaiBaoCao === 'toi-danh') {
      const baoCao = await this.baoCaoService.baoCaoTheoToimDanh(query);
      data = { theoToimDanh: baoCao.data, thoiGian: { tuNgay: query.tuNgay, denNgay: query.denNgay } };
    } else {
      const baoCao = await this.baoCaoService.xuatBaoCaoTongHop(query);
      data = baoCao.data;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QLCNC System';
    workbook.created = new Date();

    // Sheet 1: Tổng quan - chỉ tạo nếu có dữ liệu
    if (data.tongQuan) {
      const sheetTongQuan = workbook.addWorksheet('Tổng quan');
      sheetTongQuan.columns = [
        { header: 'Chỉ tiêu', key: 'chiTieu', width: 40 },
        { header: 'Giá trị', key: 'giaTri', width: 20 },
      ];

      // Header style
      sheetTongQuan.getRow(1).font = { bold: true, size: 12 };
      sheetTongQuan.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      sheetTongQuan.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Add data
      const tongQuan = data.tongQuan;
      sheetTongQuan.addRows([
        { chiTieu: 'Tổng số đối tượng', giaTri: tongQuan.tongDoiTuong || 0 },
        { chiTieu: 'Tổng số vụ việc', giaTri: tongQuan.tongVuViec || 0 },
        { chiTieu: 'Vụ việc đang xử lý', giaTri: tongQuan.vuViecDangXuLy || 0 },
        { chiTieu: 'Vụ việc hoàn thành', giaTri: tongQuan.vuViecHoanThanh || 0 },
        { chiTieu: 'Đối tượng đang theo dõi', giaTri: tongQuan.doiTuongDangTheoDoi || 0 },
        { chiTieu: 'Đối tượng tạm giam', giaTri: tongQuan.doiTuongTamGiam || 0 },
      ]);
    }

    // Sheet 2: Theo khu vực
    if (data.theoKhuVuc && data.theoKhuVuc.length > 0) {
      const sheetKhuVuc = workbook.addWorksheet('Theo khu vực');
      sheetKhuVuc.columns = [
        { header: 'Tỉnh/Thành phố', key: 'ten', width: 30 },
        { header: 'Số lượng đối tượng', key: 'soLuong', width: 20 },
        { header: 'Tỷ lệ %', key: 'tyLe', width: 15 },
      ];

      sheetKhuVuc.getRow(1).font = { bold: true, size: 12 };
      sheetKhuVuc.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      sheetKhuVuc.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      sheetKhuVuc.addRows(
        data.theoKhuVuc.map((item: any) => ({
          ten: item.ten,
          soLuong: item.soLuong,
          tyLe: item.tyLe ? `${item.tyLe.toFixed(2)}%` : '0%',
        }))
      );
    }

    // Sheet 3: Theo tội danh
    if (data.theoToimDanh && data.theoToimDanh.length > 0) {
      const sheetToimDanh = workbook.addWorksheet('Theo tội danh');
      sheetToimDanh.columns = [
        { header: 'Tội danh', key: 'ten', width: 40 },
        { header: 'Số lượng', key: 'soLuong', width: 15 },
        { header: 'Tỷ lệ %', key: 'tyLe', width: 15 },
      ];

      sheetToimDanh.getRow(1).font = { bold: true, size: 12 };
      sheetToimDanh.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      sheetToimDanh.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      sheetToimDanh.addRows(
        data.theoToimDanh.map((item: any) => ({
          ten: item.ten,
          soLuong: item.soLuong,
          tyLe: item.tyLe ? `${item.tyLe.toFixed(2)}%` : '0%',
        }))
      );
    }

    // Sheet 4: Xu hướng (nếu có dữ liệu theo tháng)
    if (data.xuHuong && data.xuHuong.length > 0) {
      const sheetXuHuong = workbook.addWorksheet('Xu hướng');
      sheetXuHuong.columns = [
        { header: 'Tháng', key: 'thang', width: 15 },
        { header: 'Số đối tượng', key: 'soDoiTuong', width: 20 },
        { header: 'Số vụ việc', key: 'soVuViec', width: 20 },
      ];

      sheetXuHuong.getRow(1).font = { bold: true, size: 12 };
      sheetXuHuong.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      sheetXuHuong.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      sheetXuHuong.addRows(
        data.xuHuong.map((item: any) => ({
          thang: item.thang,
          soDoiTuong: item.soDoiTuong || 0,
          soVuViec: item.soVuViec || 0,
        }))
      );
    }

    // Save file
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const fileName = `bao-cao-${Date.now()}.xlsx`;
    const filePath = path.join(exportsDir, fileName);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  // ===== PDF EXPORT =====
  async exportToPDF(query: BaoCaoQueryDTO): Promise<string> {
    // Xác định loại báo cáo cần xuất
    let data: any;
    let loaiBaoCao = query.loaiBaoCao || 'tong-hop';
    
    if (loaiBaoCao === 'khu-vuc') {
      const baoCao = await this.baoCaoService.baoCaoTheoKhuVuc(query);
      data = { theoKhuVuc: baoCao.data, thoiGian: { tuNgay: query.tuNgay, denNgay: query.denNgay, ngayXuat: new Date().toISOString() } };
    } else if (loaiBaoCao === 'toi-danh') {
      const baoCao = await this.baoCaoService.baoCaoTheoToimDanh(query);
      data = { theoToimDanh: baoCao.data, thoiGian: { tuNgay: query.tuNgay, denNgay: query.denNgay, ngayXuat: new Date().toISOString() } };
    } else {
      const baoCao = await this.baoCaoService.xuatBaoCaoTongHop(query);
      data = baoCao.data;
    }

    const fonts = {
      Roboto: {
        normal: path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto-Regular.ttf'),
        bold: path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto-Medium.ttf'),
        italics: path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto-Italic.ttf'),
        bolditalics: path.join(process.cwd(), 'node_modules/pdfmake/build/fonts/Roboto-MediumItalic.ttf'),
      },
    };

    const printer = new PdfPrinter(fonts);

    // Xác định tiêu đề báo cáo
    let tieuDe = 'BÁO CÁO TỔNG HỢP';
    if (loaiBaoCao === 'khu-vuc') {
      tieuDe = 'BÁO CÁO THEO KHU VỰC';
    } else if (loaiBaoCao === 'toi-danh') {
      tieuDe = 'BÁO CÁO THEO TỘI DANH';
    }

    // Build PDF content
    const content: any[] = [
      { text: tieuDe, style: 'header', alignment: 'center' },
      { text: '\n' },
      {
        text: `Từ ngày: ${data.thoiGian?.tuNgay || 'Không giới hạn'} - Đến ngày: ${data.thoiGian?.denNgay || 'Không giới hạn'}`,
        style: 'subheader',
        alignment: 'center',
      },
      { text: '\n\n' },
    ];

    // Tổng quan - chỉ hiển thị nếu có dữ liệu
    if (data.tongQuan) {
      const tongQuan = data.tongQuan;
      content.push(
        { text: 'I. TỔNG QUAN', style: 'sectionHeader' },
        {
          table: {
            widths: ['*', 100],
            body: [
              ['Tổng số đối tượng', { text: tongQuan.tongDoiTuong || 0, alignment: 'right' }],
              ['Tổng số vụ việc', { text: tongQuan.tongVuViec || 0, alignment: 'right' }],
              ['Vụ việc đang xử lý', { text: tongQuan.vuViecDangXuLy || 0, alignment: 'right' }],
              ['Vụ việc hoàn thành', { text: tongQuan.vuViecHoanThanh || 0, alignment: 'right' }],
              ['Đối tượng đang theo dõi', { text: tongQuan.doiTuongDangTheoDoi || 0, alignment: 'right' }],
              ['Đối tượng tạm giam', { text: tongQuan.doiTuongTamGiam || 0, alignment: 'right' }],
            ],
          },
        },
        { text: '\n\n' }
      );
    }

    // Theo khu vực
    if (data.theoKhuVuc && data.theoKhuVuc.length > 0) {
      content.push(
        { text: 'II. THEO KHU VỰC', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80],
            body: [
              [
                { text: 'Tỉnh/Thành phố', style: 'tableHeader' },
                { text: 'Số lượng', style: 'tableHeader', alignment: 'center' },
                { text: 'Tỷ lệ %', style: 'tableHeader', alignment: 'center' },
              ],
              ...data.theoKhuVuc.slice(0, 10).map((item: any) => [
                item.ten,
                { text: item.soLuong, alignment: 'center' },
                { text: item.tyLe ? `${item.tyLe.toFixed(2)}%` : '0%', alignment: 'center' },
              ]),
            ],
          },
        },
        { text: '\n\n' }
      );
    }

    // Theo tội danh
    if (data.theoToimDanh && data.theoToimDanh.length > 0) {
      content.push(
        { text: 'III. THEO TỘI DANH', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80, 80],
            body: [
              [
                { text: 'Tội danh', style: 'tableHeader' },
                { text: 'Số lượng', style: 'tableHeader', alignment: 'center' },
                { text: 'Tỷ lệ %', style: 'tableHeader', alignment: 'center' },
              ],
              ...data.theoToimDanh.slice(0, 10).map((item: any) => [
                item.ten,
                { text: item.soLuong, alignment: 'center' },
                { text: item.tyLe ? `${item.tyLe.toFixed(2)}%` : '0%', alignment: 'center' },
              ]),
            ],
          },
        }
      );
    }

    const docDefinition = {
      content,
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 12,
          italics: true,
          margin: [0, 0, 0, 5],
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          fillColor: '#4472C4',
          color: 'white',
        },
      },
      defaultStyle: {
        fontSize: 11,
      },
    };

    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const fileName = `bao-cao-${Date.now()}.pdf`;
    const filePath = path.join(exportsDir, fileName);

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition as any);
        const stream = fs.createWriteStream(filePath);

        pdfDoc.pipe(stream);
        pdfDoc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // ===== WORD EXPORT =====
  async exportToWord(query: BaoCaoQueryDTO): Promise<string> {
    // Xác định loại báo cáo cần xuất
    let data: any;
    let loaiBaoCao = query.loaiBaoCao || 'tong-hop';
    
    if (loaiBaoCao === 'khu-vuc') {
      const baoCao = await this.baoCaoService.baoCaoTheoKhuVuc(query);
      data = { theoKhuVuc: baoCao.data, thoiGian: { tuNgay: query.tuNgay, denNgay: query.denNgay, ngayXuat: new Date().toISOString() } };
    } else if (loaiBaoCao === 'toi-danh') {
      const baoCao = await this.baoCaoService.baoCaoTheoToimDanh(query);
      data = { theoToimDanh: baoCao.data, thoiGian: { tuNgay: query.tuNgay, denNgay: query.denNgay, ngayXuat: new Date().toISOString() } };
    } else {
      const baoCao = await this.baoCaoService.xuatBaoCaoTongHop(query);
      data = baoCao.data;
    }

    const sections: any[] = [];

    // Xác định tiêu đề báo cáo
    let tieuDe = 'BÁO CÁO TỔNG HỢP';
    if (loaiBaoCao === 'khu-vuc') {
      tieuDe = 'BÁO CÁO THEO KHU VỰC';
    } else if (loaiBaoCao === 'toi-danh') {
      tieuDe = 'BÁO CÁO THEO TỘI DANH';
    }

    // Header
    sections.push(
      new Paragraph({
        text: tieuDe,
        heading: 'Heading1',
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Từ ngày: ${data.thoiGian?.tuNgay || 'Không giới hạn'} - Đến ngày: ${data.thoiGian?.denNgay || 'Không giới hạn'}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    // Tổng quan - chỉ hiển thị nếu có dữ liệu
    if (data.tongQuan) {
      const tongQuan = data.tongQuan;
      sections.push(
        new Paragraph({
          text: 'I. TỔNG QUAN',
          heading: 'Heading2',
          spacing: { before: 200, after: 200 },
        })
      );

      const tableDataTongQuan = [
        ['Tổng số đối tượng', (tongQuan.tongDoiTuong || 0).toString()],
        ['Tổng số vụ việc', (tongQuan.tongVuViec || 0).toString()],
        ['Vụ việc đang xử lý', (tongQuan.vuViecDangXuLy || 0).toString()],
        ['Vụ việc hoàn thành', (tongQuan.vuViecHoanThanh || 0).toString()],
        ['Đối tượng đang theo dõi', (tongQuan.doiTuongDangTheoDoi || 0).toString()],
        ['Đối tượng tạm giam', (tongQuan.doiTuongTamGiam || 0).toString()],
      ];

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableDataTongQuan.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      children: [new Paragraph(cell)],
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                      },
                    })
                ),
              })
          ),
        })
      );
    }

    // Theo khu vực
    if (data.theoKhuVuc && data.theoKhuVuc.length > 0) {
      sections.push(
        new Paragraph({
          text: 'II. THEO KHU VỰC',
          heading: 'Heading2',
          spacing: { before: 400, after: 200 },
        })
      );

      const tableDataKhuVuc = [
        ['Tỉnh/Thành phố', 'Số lượng', 'Tỷ lệ %'],
        ...data.theoKhuVuc.slice(0, 10).map((item: any) => [
          item.ten,
          item.soLuong.toString(),
          item.tyLe ? `${item.tyLe.toFixed(2)}%` : '0%',
        ]),
      ];

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableDataKhuVuc.map((row, index) =>
            new TableRow({
              children: row.map((cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          bold: index === 0,
                        }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                })
              ),
            })
          ),
        })
      );
    }

    // Theo tội danh
    if (data.theoToimDanh && data.theoToimDanh.length > 0) {
      sections.push(
        new Paragraph({
          text: 'III. THEO TỘI DANH',
          heading: 'Heading2',
          spacing: { before: 400, after: 200 },
        })
      );

      const tableDataToimDanh = [
        ['Tội danh', 'Số lượng', 'Tỷ lệ %'],
        ...data.theoToimDanh.slice(0, 10).map((item: any) => [
          item.ten,
          item.soLuong.toString(),
          item.tyLe ? `${item.tyLe.toFixed(2)}%` : '0%',
        ]),
      ];

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableDataToimDanh.map((row, index) =>
            new TableRow({
              children: row.map((cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          bold: index === 0,
                        }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                })
              ),
            })
          ),
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          children: sections,
        },
      ],
    });

    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const fileName = `bao-cao-${Date.now()}.docx`;
    const filePath = path.join(exportsDir, fileName);

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    return filePath;
  }
}
