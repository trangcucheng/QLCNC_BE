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
    let data: any;
    const loaiBaoCao = query.loaiBaoCao || 'tong-hop';

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

    // ─── Màu sắc ─────────────────────────────────────────────
    const COLOR = {
      headerBg: 'FF1E3A5F',  // xanh navy đậm
      headerFont: 'FFFFFFFF',  // trắng
      titleBg: 'FF2E6DA4',  // xanh dương
      titleFont: 'FFFFFFFF',
      evenRow: 'FFF0F4FA',  // xanh nhạt xen kẽ
      oddRow: 'FFFFFFFF',  // trắng
      totalBg: 'FFFFE0B2',  // cam nhạt cho dòng tổng
      totalFont: 'FF7B3F00',  // nâu đậm
      border: 'FFB0BEC5',  // xám nhạt
    };

    // ─── Helper: border mỏng cho cell ─────────────────────────
    const thinBorder = (): Partial<ExcelJS.Borders> => ({
      top: { style: 'thin', color: { argb: COLOR.border } },
      left: { style: 'thin', color: { argb: COLOR.border } },
      bottom: { style: 'thin', color: { argb: COLOR.border } },
      right: { style: 'thin', color: { argb: COLOR.border } },
    });

    // ─── Helper: thêm dòng tiêu đề báo cáo (merge toàn chiều ngang) ──
    const addReportTitle = (sheet: ExcelJS.Worksheet, title: string, colCount: number, tuNgay?: string, denNgay?: string) => {
      // Dòng 1: Tên hệ thống
      sheet.mergeCells(1, 1, 1, colCount);
      const sysCell = sheet.getCell('A1');
      sysCell.value = 'PHÒNG AN MINH MẠNG VÀ PHÒNG CHỐNG TỘI PHẠM CÔNG NGHỆ CAO - CÔNG AN TP ĐÀ NẴNG';
      sysCell.font = { bold: true, size: 11, color: { argb: COLOR.titleFont }, name: 'Arial' };
      sysCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.titleBg } };
      sysCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(1).height = 24;

      // Dòng 2: Tên báo cáo
      sheet.mergeCells(2, 1, 2, colCount);
      const titleCell = sheet.getCell('A2');
      titleCell.value = title.toUpperCase();
      titleCell.font = { bold: true, size: 14, color: { argb: COLOR.headerBg }, name: 'Arial' };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      sheet.getRow(2).height = 30;

      // Dòng 3: Thời gian
      if (tuNgay || denNgay) {
        sheet.mergeCells(3, 1, 3, colCount);
        const timeCell = sheet.getCell('A3');
        const from = tuNgay ? `từ ${tuNgay}` : '';
        const to = denNgay ? `đến ${denNgay}` : '';
        timeCell.value = `Thời gian: ${[from, to].filter(Boolean).join(' ')}`;
        timeCell.font = { italic: true, size: 10, color: { argb: 'FF546E7A' }, name: 'Arial' };
        timeCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(3).height = 18;
      }

      // Dòng 4: trống
      sheet.getRow(4).height = 8;

      return tuNgay || denNgay ? 5 : 4; // dataStartRow
    };

    // ─── Helper: style dòng header cột ────────────────────────
    const styleHeader = (sheet: ExcelJS.Worksheet, row: number, colCount: number) => {
      const r = sheet.getRow(row);
      r.height = 22;
      for (let c = 1; c <= colCount; c++) {
        const cell = r.getCell(c);
        cell.font = { bold: true, size: 11, color: { argb: COLOR.headerFont }, name: 'Arial' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = thinBorder();
      }
    };

    // ─── Helper: style dòng data xen kẽ màu ──────────────────
    const styleDataRows = (sheet: ExcelJS.Worksheet, fromRow: number, toRow: number, colCount: number, numericCols: number[] = []) => {
      for (let r = fromRow; r <= toRow; r++) {
        const row = sheet.getRow(r);
        row.height = 18;
        const isEven = (r - fromRow) % 2 === 0;
        for (let c = 1; c <= colCount; c++) {
          const cell = row.getCell(c);
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? COLOR.evenRow : COLOR.oddRow } };
          cell.font = { size: 10, name: 'Arial' };
          cell.border = thinBorder();
          cell.alignment = {
            horizontal: numericCols.includes(c) ? 'right' : 'left',
            vertical: 'middle',
          };
        }
      }
    };

    // ─── Helper: thêm dòng tổng cuối bảng ────────────────────
    const addTotalRow = (sheet: ExcelJS.Worksheet, rowIndex: number, label: string, values: (number | string)[], colCount: number) => {
      const row = sheet.getRow(rowIndex);
      row.height = 20;
      row.getCell(1).value = label;
      values.forEach((v, i) => { row.getCell(i + 2).value = v; });
      for (let c = 1; c <= colCount; c++) {
        const cell = row.getCell(c);
        cell.font = { bold: true, size: 10, color: { argb: COLOR.totalFont }, name: 'Arial' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.totalBg } };
        cell.border = thinBorder();
        cell.alignment = { horizontal: c === 1 ? 'left' : 'right', vertical: 'middle' };
      }
    };

    // ════════════════════════════════════════════════════════════
    // SHEET 1: TỔNG QUAN
    // ════════════════════════════════════════════════════════════
    if (data.tongQuan) {
      const sheet = workbook.addWorksheet('Tổng quan');
      sheet.columns = [
        { key: 'chiTieu', width: 45 },
        { key: 'giaTri', width: 20 },
      ];

      const dataStartRow = addReportTitle(sheet, 'Báo cáo tổng quan', 2, query.tuNgay, query.denNgay);
      sheet.getRow(dataStartRow).values = ['Chỉ tiêu', 'Giá trị'];
      styleHeader(sheet, dataStartRow, 2);

      const rows = [
        ['Tổng số đối tượng', data.tongQuan.tongDoiTuong ?? 0],
        ['Tổng số vụ việc', data.tongQuan.tongVuViec ?? 0],
        ['Vụ việc đang xử lý', data.tongQuan.vuViecDangXuLy ?? 0],
        ['Vụ việc hoàn thành', data.tongQuan.vuViecHoanThanh ?? 0],
        ['Đối tượng đang theo dõi', data.tongQuan.doiTuongDangTheoDoi ?? 0],
        ['Đối tượng tạm giam', data.tongQuan.doiTuongTamGiam ?? 0],
      ];

      rows.forEach(([label, value], i) => {
        sheet.getRow(dataStartRow + 1 + i).values = [label, value];
      });

      styleDataRows(sheet, dataStartRow + 1, dataStartRow + rows.length, 2, [2]);
    }

    // ════════════════════════════════════════════════════════════
    // SHEET 2: THEO KHU VỰC
    // ════════════════════════════════════════════════════════════
    if (data.theoKhuVuc && data.theoKhuVuc.length > 0) {
      const sheet = workbook.addWorksheet('Theo khu vực');
      sheet.columns = [
        { key: 'stt', width: 8 },
        { key: 'tenKhuVuc', width: 35 },
        { key: 'soLuongDoiTuong', width: 22 },
        { key: 'soLuongVuViec', width: 20 },
        { key: 'tyLe', width: 12 },
      ];

      const dataStartRow = addReportTitle(sheet, 'Báo cáo theo khu vực', 5, query.tuNgay, query.denNgay);
      sheet.getRow(dataStartRow).values = ['STT', 'Xã / Phường', 'Số lượng đối tượng', 'Số lượng vụ việc', 'Tỷ lệ %'];
      styleHeader(sheet, dataStartRow, 5);

      let tongDoiTuong = 0;
      let tongVuViec = 0;

      data.theoKhuVuc.forEach((item: any, index: number) => {
        const r = dataStartRow + 1 + index;
        tongDoiTuong += item.soLuongDoiTuong || 0;
        tongVuViec += item.soLuongVuViec || 0;
        sheet.getRow(r).values = [
          index + 1,
          item.tenKhuVuc,
          item.soLuongDoiTuong ?? 0,
          item.soLuongVuViec ?? 0,
          item.tyLe != null ? `${Number(item.tyLe).toFixed(2)}%` : '0%',
        ];
      });

      const lastDataRow = dataStartRow + data.theoKhuVuc.length;
      styleDataRows(sheet, dataStartRow + 1, lastDataRow, 5, [1, 3, 4]);
      addTotalRow(sheet, lastDataRow + 1, 'Tổng cộng', [tongDoiTuong, tongVuViec, '100%'], 5);
    }

    // ════════════════════════════════════════════════════════════
    // SHEET 3: THEO TỘI DANH
    // ════════════════════════════════════════════════════════════
    if (data.theoToimDanh && data.theoToimDanh.length > 0) {
      const sheet = workbook.addWorksheet('Theo tội danh');
      sheet.columns = [
        { key: 'stt', width: 8 },
        { key: 'ten', width: 45 },
        { key: 'soLuong', width: 18 },
        { key: 'tyLe', width: 12 },
      ];

      const dataStartRow = addReportTitle(sheet, 'Báo cáo theo tội danh', 4, query.tuNgay, query.denNgay);
      sheet.getRow(dataStartRow).values = ['STT', 'Tội danh', 'Số lượng', 'Tỷ lệ %'];
      styleHeader(sheet, dataStartRow, 4);

      let tongSoLuong = 0;

      data.theoToimDanh.forEach((item: any, index: number) => {
        const r = dataStartRow + 1 + index;
        tongSoLuong += item.soLuong || 0;
        sheet.getRow(r).values = [
          index + 1,
          item.ten,
          item.soLuong ?? 0,
          item.tyLe != null ? `${Number(item.tyLe).toFixed(2)}%` : '0%',
        ];
      });

      const lastDataRow = dataStartRow + data.theoToimDanh.length;
      styleDataRows(sheet, dataStartRow + 1, lastDataRow, 4, [1, 3]);
      addTotalRow(sheet, lastDataRow + 1, 'Tổng cộng', [tongSoLuong, '100%'], 4);
    }

    // ════════════════════════════════════════════════════════════
    // SHEET 4: XU HƯỚNG
    // ════════════════════════════════════════════════════════════
    if (data.xuHuong && data.xuHuong.length > 0) {
      const sheet = workbook.addWorksheet('Xu hướng');
      sheet.columns = [
        { key: 'stt', width: 8 },
        { key: 'thang', width: 15 },
        { key: 'soDoiTuong', width: 20 },
        { key: 'soVuViec', width: 18 },
      ];

      const dataStartRow = addReportTitle(sheet, 'Xu hướng theo tháng', 4, query.tuNgay, query.denNgay);
      sheet.getRow(dataStartRow).values = ['STT', 'Tháng', 'Số đối tượng', 'Số vụ việc'];
      styleHeader(sheet, dataStartRow, 4);

      data.xuHuong.forEach((item: any, index: number) => {
        const r = dataStartRow + 1 + index;
        sheet.getRow(r).values = [
          index + 1,
          item.thang,
          item.soDoiTuong ?? 0,
          item.soVuViec ?? 0,
        ];
      });

      styleDataRows(sheet, dataStartRow + 1, dataStartRow + data.xuHuong.length, 4, [1, 3, 4]);
    }

    // ─── Lưu file ─────────────────────────────────────────────
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
