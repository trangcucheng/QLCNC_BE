import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as PdfPrinter from 'pdfmake';
import { PrismaService } from 'src/prisma.service';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from 'docx';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) { }

  async exportUsersPdf() {
    const users = await this.prisma.nguoiDung.findMany({
      select: { hoTen: true, email: true, soDienThoai: true, ngayTao: true },
    });

    const fonts = {
      Roboto: {
        normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
        bold: 'node_modules/pdfmake/fonts/Roboto-Medium.ttf',
        italics: 'node_modules/pdfmake/fonts/Roboto-Italic.ttf',
        bolditalics: 'node_modules/pdfmake/fonts/Roboto-MediumItalic.ttf',
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        { text: 'Danh sách User đã đăng ký', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            body: [
              ['Họ tên', 'Email', 'Số điện thoại', 'Ngày tạo'],
              ...users.map((u) => [
                u.hoTen || '',
                u.email,
                u.soDienThoai || '',
                u.ngayTao.toISOString().split('T')[0],
              ]),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const outputPath = './exports/users_report.pdf';
    pdfDoc.pipe(fs.createWriteStream(outputPath));
    pdfDoc.end();

    return { status: 'success', file: outputPath };
  }

  async exportUsersDocx() {
    const users = await this.prisma.nguoiDung.findMany({
      select: { hoTen: true, email: true, soDienThoai: true, ngayTao: true },
    });

    const tableRows = [
      new TableRow({
        children: ['Họ tên', 'Email', 'Số điện thoại', 'Ngày tạo'].map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: header, bold: true })],
                }),
              ],
            }),
        ),
      }),
      ...users.map(
        (u) =>
          new TableRow({
            children: [
              u.hoTen || '',
              u.email,
              u.soDienThoai || '',
              u.ngayTao.toISOString().split('T')[0],
            ].map(
              (text) =>
                new TableCell({
                  children: [new Paragraph(text)],
                }),
            ),
          }),
      ),
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'Danh sách User đã đăng ký',
              heading: 'Heading1',
            }),
            new Table({
              rows: tableRows,
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const outputPath = './exports/users_report.docx';
    fs.writeFileSync(outputPath, buffer);

    return { status: 'success', file: outputPath };
  }
}
