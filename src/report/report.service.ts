import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as exceljs from 'exceljs';
import { Cell, Row, Workbook } from 'exceljs';
import moment from 'moment';
import path from 'path';
import { BaoCaoDoanSoTheoKy, TrangThaiPheDuyet } from 'src/databases/entities/BaoCaoDoanSoTheoKy.entity';
import { CongTyChuaCoCD } from 'src/databases/entities/CongTyChuaCoCD.entity';
import { SuKien } from 'src/databases/entities/SuKien.entity';
import { User } from 'src/databases/entities/user.entity';
import { CumKhuCongNghiepRepository } from 'src/HeThong/cum-khu-cong-nghiep/cum-khu-cong-nghiep.repository';
import { OrganizationRepository } from 'src/HeThong/organization/organization.repository';
import { RoleRepository } from 'src/HeThong/role/role.repository';
import { UserRepository } from 'src/HeThong/user/user.repository';
import { XaPhuongRepository } from 'src/HeThong/xa-phuong/xa-phuong.repository';
import { Repository } from 'typeorm';

import { taichinhDto } from './dto/taichinh.dto';
import { ThongKeChiTietDto, ThongKeRequestDto, ThongKeResponseDto } from './dto/thong-ke.dto';
import { finishSavingExcelTemplate, initialExcelTemplate } from './helper/excelGenerate.helper';
import { DOWNLOAD_TRANSACTION } from './helper/Utils';

const { Image } = require('exceljs');

@Injectable()
export class ReportService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    @InjectRepository(BaoCaoDoanSoTheoKy)
    private readonly baoCaoDoanSoTheoKyRepository: Repository<BaoCaoDoanSoTheoKy>,
    @InjectRepository(SuKien)
    private readonly suKienRepository: Repository<SuKien>,
    @InjectRepository(CongTyChuaCoCD)
    private readonly congTyChuaCoCDRepository: Repository<CongTyChuaCoCD>,
    private readonly roleRepository: RoleRepository,
    private readonly cumKhuCongNghiepRepository: CumKhuCongNghiepRepository,
    private readonly xaPhuongRepository: XaPhuongRepository,


  ) { }
  formatDate = (date: any) => {
    if (date) {
      const dt = new Date(date);
      const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
      const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
      return day + '/' + month + '/' + dt.getFullYear();
    }
    return '';
  };
  styleRow(row: Row) {
    for (let index = 1; index <= 13; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowStudent(row: Row) {
    for (let index = 1; index <= 17; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleCellRed(cell: Cell) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF0000' }, // Mã màu ARGB (trong ví dụ này là đỏ)
    };

  }

  capitalizeFirstLetter(str) {
    // Kiểm tra nếu chuỗi là null hoặc undefined
    if (str === null || str === undefined) {
      return ""; // Trả về chuỗi rỗng hoặc xử lý trường hợp này một cách thích hợp
    }

    // Xử lý chuỗi chỉ khi chuỗi không là null hoặc undefined
    const words = str.trim().split(/\s+/); // Tách chuỗi thành mảng các từ
    const capitalizedWords = words.map(word => {
      // Viết hoa chữ cái đầu của từ và viết thường các chữ cái còn lại
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    // Ghép lại các từ đã được viết hoa chữ cái đầu thành một chuỗi mới
    return capitalizedWords.join(' ');
  }

  formatDatev2 = (date: any) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${date.getFullYear()}`;
    }
    return '';
  };

  async moneyToText(so: number) {
    const mangso = [
      "không",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín"
    ]
    const dochangchuc = (so, daydu) => {
      let chuoi = ""
      const chuc = Math.floor(so / 10)
      const donvi = so % 10
      if (chuc > 1) {
        chuoi = " " + mangso[chuc] + " mươi"
        if (donvi == 1) {
          chuoi += " mốt"
        }
      } else if (chuc == 1) {
        chuoi = " mười"
        if (donvi == 1) {
          chuoi += " một"
        }
      } else if (daydu && donvi > 0) {
        chuoi = " lẻ"
      }
      if (donvi == 5 && chuc > 1) {
        chuoi += " lăm"
      } else if (donvi > 1 || (donvi == 1 && chuc == 0)) {
        chuoi += " " + mangso[donvi]
      }
      return chuoi
    }
    const docblock = (so, daydu) => {
      let chuoi = ""
      const tram = Math.floor(so / 100)
      so = so % 100
      if (daydu || tram > 0) {
        chuoi = " " + mangso[tram] + " trăm"
        chuoi += dochangchuc(so, true)
      } else {
        chuoi = dochangchuc(so, false)
      }
      return chuoi
    }
    const dochangtrieu = (so, daydu) => {
      let chuoi = ""
      const trieu = Math.floor(so / 1000000)
      so = so % 1000000
      if (trieu > 0) {
        chuoi = docblock(trieu, daydu) + " triệu"
        daydu = true
      }
      const nghin = Math.floor(so / 1000)
      so = so % 1000
      if (nghin > 0) {
        chuoi += docblock(nghin, daydu) + " nghìn"
        daydu = true
      }
      if (so > 0) {
        chuoi += docblock(so, daydu)
      }
      return chuoi
    }
    if (so == 0) return mangso[0]
    let chuoi = "",
      hauto = ""
    do {
      const ty = so % 1000000000
      so = Math.floor(so / 1000000000)
      if (so > 0) {
        chuoi = dochangtrieu(ty, true) + hauto + chuoi
      } else {
        chuoi = dochangtrieu(ty, false) + hauto + chuoi
      }
      hauto = " tỷ"
    } while (so > 0)
    chuoi = chuoi.trim()
    if (chuoi.length > 0) chuoi = chuoi[0].toUpperCase() + chuoi.substr(1)
    chuoi = chuoi.trim().length > 0 ? chuoi.trim() + " đồng" : ""
    return chuoi
  }



  async moneyToNumber(num = "", split = ",") { num ? num.split(split).join("") : "" }

  async formatNumber(num = "", split = ",") { num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, split) : "" }

  async formatNumberFloat(num = "", df = "", split = ",") {
    try {
      const [inter = 0, float = 0] = `${num}`.split(".")
      return (
        inter.toString().replace(/\B(?=(\d{3})+(?!\d))/g, split) + "." + float
      )
    } catch (error) {
      return df
    }
  }

  async convertColumnToHyperlink(workbook: Workbook, columnIndex: number): Promise<void> {
    // Lấy worksheet có tên 'Sheet1'
    const workSheet = workbook.getWorksheet('Sheet1');

    // Duyệt qua các hàng trong cột đã chỉ định và chuyển đổi thành hyperlink
    workSheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
      const cell = row.getCell(columnIndex);

      if (cell.value) {
        const hyperlink = cell.value.toString(); // Sử dụng giá trị cột làm URL và văn bản hiển thị
        cell.value = {
          text: hyperlink,
          hyperlink: hyperlink,
        };
      }
    });

    // Ghi lại file Excel nếu cần thiết
    // await workbook.xlsx.writeFile('/path/to/save/file.xlsx');
  }

  async convertColumnToHyperlink2(workbook: Workbook, columnIndex: number, links: string): Promise<void> {
    // Lấy worksheet có tên 'Sheet1'
    const workSheet = workbook.getWorksheet('Sheet1');

    // Chuyển đổi chuỗi thành mảng các đường link
    const linkArray = links.split('\n');

    // Điền các đường link vào các ô riêng biệt trong cột chỉ định
    linkArray.forEach((link, index) => {
      const cell = workSheet.getCell(index + 1, columnIndex);
      if (link) {
        cell.value = {
          text: link,
          hyperlink: link,
        };
      }
    });

    // Ghi lại file Excel nếu cần thiết
    // await workbook.xlsx.writeFile('/path/to/save/file.xlsx');
  }

  async generateReportFromTemplate(templateFile: string, res: any, payload: taichinhDto): Promise<string> {
    const workbook = await initialExcelTemplate(templateFile); // khởi tạo file template
    const { startDate, endDate, feeStatus, majorId, testSessionName } = payload
    /**
     * ĐỔ DỮ LIỆU
     */
    const startDay = '';
    const endDay = '';
    workbook.creator = 'admin';
    workbook.lastModifiedBy = 'admin';
    workbook.created = new Date();
    const workSheet = workbook.getWorksheet('NKMT');


    const rowExcelTNDN = workSheet.getRow(6);
    const cellTNDN = rowExcelTNDN.getCell(1);

    let startRow = 10;
    const startCol = 2;
    const total1 = 0;
    const total2 = 0;
    const total3 = 0;

    let count = 1;
    const identity = "";
    const totalMoneyNgang = 0;
    // for (const item of list) {
    //   const tranDate = item.tranDate ? this.formatDatev2(new Date(item.tranDate.getTime() + (7 * 60 * 60 * 1000))) : "";


    //   let dot1 = 0;
    //   let dot2 = 0;
    //   let dot3 = 0;
    //   const rowExcel = workSheet.getRow(startRow);

    //   if (item.identity === identity) {
    //     const rowExcelLap = workSheet.getRow(startRow - 1);
    //     if (item.testSessionName === "Đợt 1") {
    //       const cellMoney = rowExcelLap.getCell(startCol + 5);
    //       cellMoney.value = Number(item.money)
    //       dot1 = Number(item.money)
    //       total1 = total1 + Number(item.money)

    //       const cellTranDate = rowExcelLap.getCell(startCol + 6);
    //       cellTranDate.value = tranDate;
    //     }
    //     if (item.testSessionName === "Đợt 2") {
    //       const cellMoney = rowExcelLap.getCell(startCol + 7);
    //       cellMoney.value = Number(item.money)
    //       dot2 = Number(item.money)
    //       total2 = total2 + Number(item.money)

    //       const cellTranDate = rowExcelLap.getCell(startCol + 8);
    //       cellTranDate.value = tranDate;
    //     }
    //     if (item.testSessionName === "Đợt 3") {
    //       const cellMoney = rowExcelLap.getCell(startCol + 9);
    //       cellMoney.value = Number(item.money)
    //       dot3 = Number(item.money)
    //       total3 = total3 + Number(item.money)

    //       const cellTranDate = rowExcelLap.getCell(startCol + 10);
    //       cellTranDate.value = tranDate;
    //     }
    //     const cellTotalMoney2 = rowExcelLap.getCell(startCol + 11);
    //     cellTotalMoney2.value = totalMoneyNgang + dot1 + dot2 + dot3;
    //     totalMoneyNgang = cellTotalMoney2.value

    //   }
    //   else {
    //     const cellTT = rowExcel.getCell(startCol - 1);
    //     cellTT.value = count;

    //     const cell = rowExcel.getCell(startCol);
    //     cell.value = item.created_at ? this.formatDatev2(item.created_at) : ""
    //     const cellTotalMoney = rowExcel.getCell(startCol + 11);
    //     const cellName = rowExcel.getCell(startCol + 1);
    //     const studentNameUper = this.capitalizeFirstLetter(item.studentName);
    //     cellName.value = studentNameUper;
    //     const cellBirthDate = rowExcel.getCell(startCol + 2);
    //     cellBirthDate.value = item.birthDate ? moment(new Date(item.birthDate.getTime() + (7 * 60 * 60 * 1000))).format('DD/MM/YYYY') : ''
    //     const cellIdentity = rowExcel.getCell(startCol + 3);
    //     cellIdentity.value = item.identity;
    //     const cellPhone = rowExcel.getCell(startCol + 4);
    //     cellPhone.value = item.phoneNumber;
    //     if (item.testSessionName === "Đợt 1") {
    //       const cellMoney = rowExcel.getCell(startCol + 5);
    //       cellMoney.value = Number(item.money)
    //       dot1 = Number(item.money)
    //       total1 = total1 + Number(item.money)

    //       const cellTranDate = rowExcel.getCell(startCol + 6);
    //       cellTranDate.value = tranDate;
    //     }
    //     if (item.testSessionName === "Đợt 2") {
    //       const cellMoney = rowExcel.getCell(startCol + 7);
    //       cellMoney.value = Number(item.money)
    //       dot2 = Number(item.money)
    //       total2 = total2 + Number(item.money)

    //       const cellTranDate = rowExcel.getCell(startCol + 8);
    //       cellTranDate.value = tranDate;
    //     }
    //     if (item.testSessionName === "Đợt 3") {
    //       const cellMoney = rowExcel.getCell(startCol + 9);
    //       cellMoney.value = Number(item.money)
    //       dot3 = Number(item.money)
    //       total3 = total3 + Number(item.money)

    //       const cellTranDate = rowExcel.getCell(startCol + 10);
    //       cellTranDate.value = tranDate;
    //     }

    //     cellTotalMoney.value = dot1 + dot2 + dot3;
    //     this.styleRow(rowExcel);
    //     startRow++;
    //     count++;
    //     totalMoneyNgang = cellTotalMoney.value
    //   }

    //   identity = item.identity;

    // }

    workSheet.mergeCells(
      startRow,
      1,
      startRow,
      5
    );
    const rowExcelTC = workSheet.getRow(startRow);
    const cellTC = rowExcelTC.getCell(1);
    cellTC.value = "TỔNG CỘNG"

    const cellMoney1 = rowExcelTC.getCell(7);
    cellMoney1.value = total1;
    const cellMoney2 = rowExcelTC.getCell(9);
    cellMoney2.value = total2;
    const cellMoney3 = rowExcelTC.getCell(11);
    cellMoney3.value = total3;

    const cellMoneyTC = rowExcelTC.getCell(13);
    cellMoneyTC.value = total3 + total1 + total2;
    this.styleRow(rowExcelTC);
    count--;
    startRow++;
    const rowNumberStudent = workSheet.getRow(startRow);
    const cellNumberStudent = rowNumberStudent.getCell(1);
    cellNumberStudent.value = "Tổng số thí sinh đăng ký: " + count + " người";
    startRow++;
    const rowMoneyC = workSheet.getRow(startRow);
    const cellMoneyC = rowMoneyC.getCell(1);
    cellMoneyC.value = "Tổng số tiền (bằng chữ): " + await this.moneyToText(cellMoneyTC.value);

    startRow = startRow + 1;
    const rowNTN = workSheet.getRow(startRow);
    workSheet.mergeCells(
      startRow,
      9,
      startRow,
      13
    );
    const cellNTN = rowNTN.getCell(9);
    cellNTN.value = "Hà Nội, ngày        tháng         năm 2025";

    startRow = startRow + 1;
    workSheet.mergeCells(
      startRow,
      1,
      startRow,
      3
    );

    const rowTTTS = workSheet.getRow(startRow);
    const cellTTTS = rowTTTS.getCell(1);
    cellTTTS.value = "Phòng Truyền thông Tuyển sinh";

    workSheet.mergeCells(
      startRow,
      4,
      startRow,
      7
    );

    //const rowKTTC = workSheet.getRow(startRow);
    const cellKTTC = rowTTTS.getCell(4);
    cellKTTC.value = "Phòng Kế hoạch Tài chính";

    workSheet.mergeCells(
      startRow,
      9,
      startRow,
      13
    );

    //const rowKTTC = workSheet.getRow(startRow);
    const cellNL = rowTTTS.getCell(9);
    cellNL.value = "Người lập";
    /**
     * Biến thứ 3 trong hàm finishSavingDocxTemplate chính là saveDir: nó là folder nằm trong folder src/report/saved.
     * Mọi người lưu ý lấy các biến này dạng constants để đồng bộ về mặt folder, tránh fix cứng
     */
    const outputPath = await finishSavingExcelTemplate(workbook, templateFile, DOWNLOAD_TRANSACTION);

    const templateFileSplit = templateFile.split('/');
    res.setHeader('Content-Disposition', `attachment; filename=${templateFileSplit[templateFileSplit.length - 1]}`);
    res.sendFile(outputPath);
    return outputPath;
  }

  separateName(fullName) {
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      throw new Error('Full name must be provided.');
    }

    const parts = fullName.trim().split(/\s+/);
    const lastName = parts.pop() || '';
    const firstName = parts.join(' ');

    return { firstName, lastName };
  }

  styleRowGenerateStudentsInfor(row: Row) {
    for (let index = 1; index <= 14; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowExportStudentNotRegister(row: Row) {
    for (let index = 1; index <= 14; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }
  styleRowExportInterviewList406And410(row: Row) {
    for (let index = 1; index <= 80; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowReport410(row: Row) {
    for (let index = 1; index <= 41; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowReport409(row: Row) {
    for (let index = 1; index <= 35; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowReport406(row: Row) {
    for (let index = 1; index <= 80; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowReport401(row: Row) {
    for (let index = 1; index <= 27; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowReport303(row: Row) {
    for (let index = 1; index <= 30; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowAll(row: Row) {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
  }
  async styleAllCells(workbook: Workbook): Promise<void> {
    workbook.eachSheet((worksheet) => {
      worksheet.eachRow((row) => {
        this.styleRowAll(row);
      });
    });

    // Lưu file Excel đã được chỉnh sửa
    // const updatedFilePath = 'styled_file.xlsx'; // Đặt tên file mới sau khi chỉnh sửa style
    // await workbook.xlsx.writeFile(updatedFilePath);

  }

  styleRowReport301(row: Row) {
    for (let index = 1; index <= 29; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  styleRowExportXTS(row: Row) {
    for (let index = 1; index <= 26; index++) {
      const cell = row.getCell(index);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      if (cell) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
  }

  async splitFullName(fullName: string) {
    const names = fullName.trim().split(' ');
    const lastName = names.pop();
    const firstName = names.join(' ');
    return { firstName, lastName };
  }

  // ==================== THỐNG KÊ METHODS ====================

  async getThongKeTongQuan(userId: string, queryDto: ThongKeRequestDto): Promise<ThongKeResponseDto> {
    const { fromDate, toDate, thoiGianCapNhatDoanSoId } = queryDto;

    const userDetail = await this.userRepository.findOne({ where: { id: userId } });
    if (!userDetail) {
      throw new BadRequestException('Không tìm thấy thông tin người dùng!');
    }

    const role = await this.roleRepository.findOne({ where: { id: userDetail.roleId } });
    if (!role) {
      throw new BadRequestException('Không tìm thấy thông tin quyền!');
    }
    let checkAdmin = 0;
    if (['ADMIN', 'QT', 'LD', 'CV'].includes(role.description)) {
      checkAdmin = 1;
    }

    // Tính toán khoảng thời gian cho so sánh
    const currentDate = new Date();
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Lấy thống kê hiện tại
    const [
      tongSoCongDoan,
      tongSoDoanVien,
      suKienTrongThang,
      choPheduyet,
      tongSoCongTyChuaCoCD,
      tongSoCongDoanTruoc,
      tongSoDoanVienTruoc,
      suKienThangTruoc,
      choPheDuyetTruoc
    ] = await Promise.all([
      this.getTongSoCongDoan(checkAdmin, userDetail),
      this.getTongSoDoanVien(checkAdmin, userDetail, thoiGianCapNhatDoanSoId),
      this.getSuKienTrongThang(currentMonthStart, currentDate),
      this.getBaoCaoChoPheduyet(checkAdmin, userDetail),
      this.getTongSoCongTyChuaCoCD(checkAdmin, userDetail),
      this.getTongSoCongDoanTruoc(checkAdmin, userDetail, previousMonthStart),
      this.getTongSoDoanVienTruoc(checkAdmin, userDetail, previousMonthStart, thoiGianCapNhatDoanSoId),
      this.getSuKienTrongThang(previousMonthStart, currentMonthStart),
      this.getBaoCaoChoPheDuyetTruoc(checkAdmin, userDetail, previousMonthStart),
    ]);

    return {
      tongSoCongDoan,
      tangTruongCongDoan: this.tinhTyLeTangTruong(tongSoCongDoan, tongSoCongDoanTruoc),
      tongSoDoanVien,
      tangTruongDoanVien: this.tinhTyLeTangTruong(tongSoDoanVien, tongSoDoanVienTruoc),
      suKienTrongThang,
      tangTruongSuKien: this.tinhTyLeTangTruong(suKienTrongThang, suKienThangTruoc),
      choPheduyet,
      thayDoiChoPheduyet: this.tinhTyLeTangTruong(choPheduyet, choPheDuyetTruoc),
      tongSoCongTyChuaCoCD
    };
  }

  async getThongKeChiTiet(queryDto: ThongKeRequestDto): Promise<ThongKeChiTietDto> {
    const { organizationId, fromDate, toDate } = queryDto;

    const [theoToChuc, theoThoiGian, trangThaiBaoCao] = await Promise.all([
      this.getThongKeTheoToChuc(organizationId),
      this.getThongKeTheoThoiGian(organizationId, fromDate, toDate),
      this.getThongKeTrangThaiBaoCao(organizationId)
    ]);

    return {
      theoToChuc,
      theoThoiGian,
      trangThaiBaoCao
    };
  }

  // ==================== HELPER METHODS ====================

  private async getTongSoCongDoan(checkAdmin: number, userDetail: User): Promise<number> {
    const queryBuilder = this.organizationRepository.createQueryBuilder('org');
    if (checkAdmin === 0) {
      // Nếu user có organizationId => chỉ thống kê của organization đó
      if (userDetail.organizationId) {
        queryBuilder.andWhere('org.id = :organizationId', { organizationId: userDetail.organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (userDetail.cumKhuCnId) {
          queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    return await queryBuilder.getCount();
  }

  private async getTongSoCongDoanTruoc(checkAdmin: number, userDetail: User, beforeDate?: Date): Promise<number> {
    const queryBuilder = this.organizationRepository.createQueryBuilder('org')
      .where('org.createdAt < :beforeDate', { beforeDate });
    if (checkAdmin === 0) {
      // Nếu user có organizationId => chỉ thống kê của organization đó
      if (userDetail.organizationId) {
        queryBuilder.andWhere('org.id = :organizationId', { organizationId: userDetail.organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (userDetail.cumKhuCnId) {
          queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    return await queryBuilder.getCount();
  }

  private async getTongSoDoanVien(checkAdmin: number, userDetail: User, thoiGianCapNhatDoanSoId?: number): Promise<number> {
    const queryBuilder = this.organizationRepository.createQueryBuilder('org')
      .select('SUM(org.slCongDoanNam + org.slCongDoanNu)', 'total');

    if (checkAdmin === 0) {
      // Nếu user có organizationId => chỉ thống kê của organization đó
      if (userDetail.organizationId) {
        queryBuilder.andWhere('org.id = :organizationId', { organizationId: userDetail.organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (userDetail.cumKhuCnId) {
          queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    const result = await queryBuilder.getRawOne();
    return parseInt(result.total) || 0;
  }

  private async getTongSoDoanVienTruoc(checkAdmin: number, userDetail: User, beforeDate?: Date, thoiGianCapNhatDoanSoId?: number): Promise<number> {
    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('bc')
      .select('SUM(bc.soLuongDoanVienNam + bc.soLuongDoanVienNu)', 'total')
      .innerJoin('organization', 'org', 'org.id = bc.organizationId')
      .where('bc.createdAt < :beforeDate', { beforeDate });

    if (checkAdmin === 0) {
      // Nếu user có organizationId => chỉ thống kê của organization đó
      if (userDetail.organizationId) {
        queryBuilder.andWhere('org.id = :organizationId', { organizationId: userDetail.organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (userDetail.cumKhuCnId) {
          queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    if (thoiGianCapNhatDoanSoId) {
      queryBuilder.andWhere('bc.thoiGianCapNhatDoanSoId = :thoiGianCapNhatDoanSoId',
        { thoiGianCapNhatDoanSoId });
    }

    queryBuilder.andWhere('bc.trangThaiPheDuyet = :trangThai',
      { trangThai: TrangThaiPheDuyet.DA_PHE_DUYET });

    const result = await queryBuilder.getRawOne();
    return parseInt(result.total) || 0;
  }

  private async getSuKienTrongThang(fromDate?: Date, toDate?: Date): Promise<number> {
    const queryBuilder = this.suKienRepository.createQueryBuilder('sk');

    if (fromDate && toDate) {
      queryBuilder.where('sk.createdAt >= :fromDate AND sk.createdAt <= :toDate',
        { fromDate, toDate });
    }

    return await queryBuilder.getCount();
  }

  private async getBaoCaoChoPheduyet(checkAdmin: number, userDetail: User): Promise<number> {
    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('bc')
      .innerJoin('organization', 'org', 'org.id = bc.organizationId')
      .where('bc.trangThaiPheDuyet = :trangThai',
        { trangThai: TrangThaiPheDuyet.CHO_PHE_DUYET });

    if (checkAdmin === 0) {
      // Nếu user có organizationId => chỉ thống kê của organization đó
      if (userDetail.organizationId) {
        queryBuilder.andWhere('org.id = :organizationId', { organizationId: userDetail.organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (userDetail.cumKhuCnId) {
          queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    return await queryBuilder.getCount();
  }

  private async getBaoCaoChoPheDuyetTruoc(checkAdmin: number, userDetail: User, beforeDate?: Date): Promise<number> {
    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('bc')
      .innerJoin('organization', 'org', 'org.id = bc.organizationId')
      .where('bc.trangThaiPheDuyet = :trangThai AND bc.createdAt < :beforeDate',
        { trangThai: TrangThaiPheDuyet.CHO_PHE_DUYET, beforeDate });
    if (checkAdmin === 0) {
      // Nếu user có organizationId => chỉ thống kê của organization đó
      if (userDetail.organizationId) {
        queryBuilder.andWhere('org.id = :organizationId', { organizationId: userDetail.organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (userDetail.cumKhuCnId) {
          queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId1', { cumKhuCnId1: userDetail.cumKhuCnId });
        }
        if (userDetail.xaPhuongId) {
          queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId1', { xaPhuongId1: userDetail.xaPhuongId });
        }
      }
    }

    return await queryBuilder.getCount();
  }

  private async getTongSoCongTyChuaCoCD(checkAdmin: number, userDetail: User): Promise<number> {
    const queryBuilder = this.congTyChuaCoCDRepository.createQueryBuilder('ct')
      .leftJoin('cum_khu_cong_nghiep', 'ckc', 'ct.cumKCNId = ckc.id');

    if (checkAdmin === 0) {
      // Nếu user có cumKhuCnId => thống kê các công ty thuộc cùng cụm khu công nghiệp
      if (userDetail.cumKhuCnId) {
        queryBuilder.andWhere('ct.cumKCNId = :cumKhuCnId', { cumKhuCnId: userDetail.cumKhuCnId });
      }
    }

    return await queryBuilder.getCount();
  }


  private tinhTyLeTangTruong(current: number, previous: number): string {
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }

    const percentage = ((current - previous) / previous) * 100;
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${Math.round(percentage)}%`;
  }

  private async getThongKeTheoToChuc(organizationId?: number) {
    const queryBuilder = this.organizationRepository.createQueryBuilder('org')
      .leftJoin('BaoCaoDoanSoTheoKy', 'bc', 'bc.organizationId = org.id')
      .leftJoin('User', 'u', 'u.organizationId = org.id')
      .leftJoin('NguoiNhanSuKien', 'nnsk', 'nnsk.nguoiNhanId = u.id')
      .leftJoin('SuKien', 'sk', 'sk.id = nnsk.suKienId')
      .select([
        'org.id as organizationId',
        'org.name as organizationName',
        'COUNT(DISTINCT org.id) as soCongDoan',
        'SUM(bc.soLuongDoanVienNam + bc.soLuongDoanVienNu) as soDoanVien',
        'COUNT(DISTINCT sk.id) as soSuKien',
        'COUNT(DISTINCT bc.id) as soBaoCao'
      ])
      .groupBy('org.id');

    if (organizationId) {
      queryBuilder.where('org.id = :organizationId OR org.organizationParentId = :organizationId',
        { organizationId });
    }

    return await queryBuilder.getRawMany();
  }

  private async getThongKeTheoThoiGian(organizationId?: number, fromDate?: string, toDate?: string) {
    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('bc')
      .leftJoin('Organization', 'org', 'org.id = bc.organizationId')
      .leftJoin('User', 'u', 'u.organizationId = bc.organizationId')
      .leftJoin('NguoiNhanSuKien', 'nnsk', 'nnsk.nguoiNhanId = u.id')
      .leftJoin('SuKien', 'sk', 'sk.id = nnsk.suKienId')
      .select([
        'DATE_FORMAT(bc.createdAt, "%Y-%m") as thang',
        'COUNT(DISTINCT bc.organizationId) as soCongDoan',
        'SUM(bc.soLuongDoanVienNam + bc.soLuongDoanVienNu) as soDoanVien',
        'COUNT(DISTINCT sk.id) as soSuKien',
        'COUNT(DISTINCT bc.id) as soBaoCao'
      ])
      .groupBy('DATE_FORMAT(bc.createdAt, "%Y-%m")')
      .orderBy('thang', 'DESC');

    if (fromDate && toDate) {
      queryBuilder.where('bc.createdAt >= :fromDate AND bc.createdAt <= :toDate',
        { fromDate, toDate });
    }

    if (organizationId) {
      queryBuilder.andWhere('bc.organizationId = :organizationId', { organizationId });
    }

    return await queryBuilder.getRawMany();
  }

  private async getThongKeTrangThaiBaoCao(organizationId?: number) {
    const queryBuilder = this.baoCaoDoanSoTheoKyRepository.createQueryBuilder('bc')
      .select([
        'bc.trangThaiPheDuyet as trangThai',
        'COUNT(*) as soLuong'
      ])
      .groupBy('bc.trangThaiPheDuyet');

    if (organizationId) {
      queryBuilder.where('bc.organizationId = :organizationId', { organizationId });
    }

    const results = await queryBuilder.getRawMany();

    const trangThaiBaoCao = {
      choPheduyet: 0,
      daPheduyet: 0,
      tuChoi: 0
    };

    results.forEach(result => {
      switch (result.trangThai) {
        case TrangThaiPheDuyet.CHO_PHE_DUYET:
          trangThaiBaoCao.choPheduyet = parseInt(result.soLuong);
          break;
        case TrangThaiPheDuyet.DA_PHE_DUYET:
          trangThaiBaoCao.daPheduyet = parseInt(result.soLuong);
          break;
        case TrangThaiPheDuyet.TU_CHOI:
          trangThaiBaoCao.tuChoi = parseInt(result.soLuong);
          break;
      }
    });

    return trangThaiBaoCao;
  }

  // ==================== XUẤT BÁO CÁO EXCEL ====================

  async exportBaoCaoCDCS(cumKhuCnId?: number, ngayThongKe?: string, xaPhuongId?: number, res?: any): Promise<void> {
    try {
      // Lấy thông tin cụm khu công nghiệp (nếu có)
      let cumKhuCongNghiep = null;
      let tenCumKhu = '';

      if (cumKhuCnId) {
        cumKhuCongNghiep = await this.cumKhuCongNghiepRepository.findOne({ where: { id: cumKhuCnId } });

        if (!cumKhuCongNghiep) {
          throw new BadRequestException('Không tìm thấy cụm khu công nghiệp');
        }
        tenCumKhu = cumKhuCongNghiep.ten || '';
      }

      // Lấy thông tin cụm khu công nghiệp (nếu có)
      let xaPhuong = null;
      let tenXaPhuong = '';

      if (xaPhuongId) {
        xaPhuong = await this.xaPhuongRepository.findOne({ where: { id: xaPhuongId } });

        if (!xaPhuong) {
          throw new BadRequestException('Không tìm thấy xã phường');
        }
        tenXaPhuong = xaPhuong.ten || '';
      }

      // Xây dựng query để lấy danh sách tổ chức
      const queryBuilder = this.organizationRepository
        .createQueryBuilder('org')
        .leftJoin('CumKhuCongNghiep', 'ckh', 'ckh.id = org.cumKhuCnId')
        .leftJoin('XaPhuong', 'xp', 'xp.id = org.xaPhuongId')
        .select([
          'org.id',
          'org.name',
          'org.slCongNhanVienChucLdNam',
          'org.slCongNhanVienChucLdNu',
          'org.slCongDoanNam',
          'org.slCongDoanNu',
          'org.soUyVienBch',
          'org.soUyVienUbkt',
          'org.ghiChu',
          'org.tenChuTichCongDoan',
          'org.sdtChuTich',
          'ckh.ten AS tenCumKhu',
          'xp.ten AS tenXaPhuong'
        ]);

      // Thêm điều kiện lọc theo cumKhuCnId nếu có
      if (cumKhuCnId) {
        queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId', { cumKhuCnId });
      }

      // Thêm điều kiện lọc theo xaPhuongId nếu có
      if (xaPhuongId) {
        queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId', { xaPhuongId });
      }

      const danhSachToChuc = await queryBuilder
        .orderBy('org.name', 'ASC')
        .getRawMany();

      // Đọc file template
      const templatePath = path.join(process.cwd(), 'src', 'report', 'template', 'bcCDCS_KCN.xlsx');
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(templatePath);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new BadRequestException('Không tìm thấy worksheet trong template');
      }

      // Điền tên cụm khu công nghiệp hoặc "Tất cả" vào cell B1
      const cellB1 = worksheet.getCell('B1');
      cellB1.value = tenCumKhu || tenXaPhuong || 'TẤT CẢ';
      cellB1.font = {
        name: 'Times New Roman',
        bold: true,
        size: 12
      };

      // Điền ngày thống kê vào title (cell A3)
      const ngayFormatted = this.formatDateToVietnamese(ngayThongKe);
      const titleCell = worksheet.getCell('A3');
      const currentTitle = titleCell.value || 'BẢNG TỔNG HỢP SỐ LIỆU CÔNG ĐOÀN CƠ SỞ VÀ ĐOÀN VIÊN CÔNG ĐOÀN';
      titleCell.value = `${currentTitle} (đến ${ngayFormatted})`;
      titleCell.font = {
        name: 'Times New Roman',
        bold: true,
        size: 12
      };

      // Điền dữ liệu vào bảng (bắt đầu từ hàng 8)
      let currentRow = 8;
      danhSachToChuc.forEach((toChuc, index) => {
        const row = worksheet.getRow(currentRow);

        // STT (cột A)
        row.getCell(1).value = index + 1;

        // Tên CĐCS (cột B)
        row.getCell(2).value = toChuc.org_name || '';

        // Địa chỉ - Tên cụm khu công nghiệp (cột C)
        row.getCell(3).value = toChuc.tenCumKhu || '';

        // Tổng số CNVCLĐ (cột D)
        const tongCNVCLD = (toChuc.org_slCongNhanVienChucLdNam || 0) + (toChuc.org_slCongNhanVienChucLdNu || 0);
        row.getCell(4).value = tongCNVCLD;

        // Tổng số đoàn viên (cột E)
        const tongDoanVien = (toChuc.org_slCongDoanNam || 0) + (toChuc.org_slCongDoanNu || 0);
        row.getCell(5).value = tongDoanVien;

        // Số đoàn viên Nam (cột F)
        row.getCell(6).value = toChuc.org_slCongDoanNam || 0;

        // Số đoàn viên Nữ (cột G)
        row.getCell(7).value = toChuc.org_slCongDoanNu || 0;

        // Số Ủy viên BCH (cột H)
        row.getCell(8).value = toChuc.org_soUyVienBch || 0;

        // Số Ủy viên UBKT (cột I)
        row.getCell(9).value = toChuc.org_soUyVienUbkt || 0;

        // Ghi chú (cột J)
        row.getCell(10).value = toChuc.org_ghiChu || '';

        // Họ tên chủ tịch CĐ (cột K)
        row.getCell(11).value = toChuc.org_tenChuTichCongDoan || '';

        // SĐT liên hệ (cột L)
        row.getCell(12).value = toChuc.org_sdtChuTich || '';

        // Áp dụng style cho hàng
        this.styleRowBaoCaoCDCS(row);

        currentRow++;
      });

      // Thêm hàng tổng cộng nếu cần
      if (danhSachToChuc.length > 0) {
        const tongRow = worksheet.getRow(currentRow);
        tongRow.getCell(1).value = '';
        tongRow.getCell(2).value = 'TỔNG CỘNG';
        tongRow.getCell(2).font = { bold: true };

        // Tính tổng các cột số liệu
        const tongCNVCLD = danhSachToChuc.reduce((sum, item) =>
          sum + (item.org_slCongNhanVienChucLdNam || 0) + (item.org_slCongNhanVienChucLdNu || 0), 0);
        const tongDoanVien = danhSachToChuc.reduce((sum, item) =>
          sum + (item.org_slCongDoanNam || 0) + (item.org_slCongDoanNu || 0), 0);
        const tongDoanVienNam = danhSachToChuc.reduce((sum, item) =>
          sum + (item.org_slCongDoanNam || 0), 0);
        const tongDoanVienNu = danhSachToChuc.reduce((sum, item) =>
          sum + (item.org_slCongDoanNu || 0), 0);
        const tongUyVienBCH = danhSachToChuc.reduce((sum, item) =>
          sum + (item.org_soUyVienBch || 0), 0);
        const tongUyVienUBKT = danhSachToChuc.reduce((sum, item) =>
          sum + (item.org_soUyVienUbkt || 0), 0);

        tongRow.getCell(4).value = tongCNVCLD;
        tongRow.getCell(5).value = tongDoanVien;
        tongRow.getCell(6).value = tongDoanVienNam;
        tongRow.getCell(7).value = tongDoanVienNu;
        tongRow.getCell(8).value = tongUyVienBCH;
        tongRow.getCell(9).value = tongUyVienUBKT;

        this.styleRowBaoCaoCDCS(tongRow, true);
      }

      // Tạo tên file với timestamp
      const timestamp = moment().format('YYYYMMDD_HHmmss');
      const tenFile = tenCumKhu ? tenCumKhu.replace(/[^\w\s]/gi, '') : 'TatCa';
      const fileName = `BaoCao_CDCS_${tenFile}_${timestamp}.xlsx`;

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

      // Xuất file
      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Lỗi xuất báo cáo CDCS:', error);
      throw new BadRequestException(`Không thể xuất báo cáo: ${error.message}`);
    }
  }

  private formatDateToVietnamese(dateString?: string): string {
    if (!dateString) {
      const now = new Date();
      return this.formatDate(now);
    }

    const date = new Date(dateString);
    return this.formatDate(date);
  }

  private styleRowBaoCaoCDCS(row: Row, isTotalRow = false): void {
    for (let index = 1; index <= 12; index++) {
      const cell = row.getCell(index);

      // Border cho tất cả cells
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Alignment
      cell.alignment = {
        vertical: 'middle',
        horizontal: index === 1 ? 'center' : 'left', // STT center, còn lại left
        wrapText: true
      };

      // Font
      cell.font = {
        name: 'Times New Roman',
        size: 11,
        bold: isTotalRow && index === 2 // Chỉ in đậm cột "TỔNG CỘNG"
      };

      // Số liệu căn giữa
      if ([1, 4, 5, 6, 7, 8, 9].includes(index)) {
        cell.alignment.horizontal = 'center';
      }
    }
  }

  // ==================== THỐNG KÊ ĐOÀN VIÊN ====================

  async getThongKeDoanVien(userId: string) {
    try {
      // 1. Tìm user và lấy thông tin
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new BadRequestException('Không tìm thấy thông tin người dùng');
      }

      // 2. Lấy thông tin từ user
      const organizationId = user.organizationId;
      const cumKhuCnId = user.cumKhuCnId;
      const xaPhuongId = user.xaPhuongId;

      // if (!organizationId && !cumKhuCnId && !xaPhuongId) {
      //   throw new BadRequestException('User chưa được gán tổ chức, cụm khu công nghiệp hoặc xã phường');
      // }

      // 3. Tạo query builder để thống kê
      let queryBuilder = this.organizationRepository.createQueryBuilder('org');

      // 4. Áp dụng bộ lọc dựa trên thông tin user theo logic mới
      if (organizationId) {
        // Nếu user có organizationId => chỉ thống kê của organization đó
        queryBuilder = queryBuilder.andWhere('org.id = :organizationId', { organizationId });
      } else {
        // Nếu user có xaPhuongId hoặc cumKhuCnId => thống kê các organization có cùng xaPhuongId hoặc cumKhuCnId
        if (cumKhuCnId) {
          queryBuilder = queryBuilder.andWhere('org.cumKhuCnId = :cumKhuCnId', { cumKhuCnId });
        }
        if (xaPhuongId) {
          queryBuilder = queryBuilder.andWhere('org.xaPhuongId = :xaPhuongId', { xaPhuongId });
        }
      }

      // 6. Tính tổng số lượng đoàn viên
      const result = await queryBuilder
        .select([
          'SUM(org.slCongDoanNam) as soLuongDoanVienNam',
          'SUM(org.slCongDoanNu) as soLuongDoanVienNu'
        ])
        .getRawOne();

      // 7. Lấy thông tin chi tiết các entity liên quan
      const organizationInfo = organizationId ?
        await this.organizationRepository.findOne({ where: { id: organizationId } }) : null;

      const cumKhuCongNghiepInfo = cumKhuCnId ?
        await this.cumKhuCongNghiepRepository.findOne({ where: { id: cumKhuCnId } }) : null;

      const xaPhuongInfo = xaPhuongId ?
        await this.xaPhuongRepository.findOne({ where: { id: xaPhuongId } }) : null;

      // 8. Tính toán và format kết quả
      const soLuongDoanVienNam = parseInt(result?.soLuongDoanVienNam || '0');
      const soLuongDoanVienNu = parseInt(result?.soLuongDoanVienNu || '0');
      const tongSoLuongDoanVien = soLuongDoanVienNam + soLuongDoanVienNu;

      return {
        success: true,
        message: 'Lấy thống kê đoàn viên thành công',
        data: {
          userInfo: {
            userId: user.id,
            organizationId: organizationId,
            cumKhuCnId: cumKhuCnId,
            xaPhuongId: xaPhuongId,
            organizationName: organizationInfo?.name || 'N/A'
          },
          statistics: {
            soLuongDoanVienNam,
            soLuongDoanVienNu,
            tongSoLuongDoanVien
          },
          filterInfo: {
            cumKhuCongNghiep: cumKhuCongNghiepInfo?.ten || 'N/A',
            xaPhuong: xaPhuongInfo?.ten || 'N/A',
            organization: organizationInfo?.name || 'N/A'
          }
        }
      };

    } catch (error) {
      throw new BadRequestException(`Lỗi khi thống kê đoàn viên: ${error.message}`);
    }
  }

  // ==================== DOWNLOAD TEMPLATE ====================

  async downloadTemplate(res: any): Promise<void> {
    try {
      // Tạo workbook mới
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Template Import');

      // Định nghĩa headers cho template
      const headers = [
        'STT',
        'Tên Công đoàn cơ sở*',
        'Cụm Khu CN*',
        'Ngành nghề sản xuất kinh doanh',
        'Tổng số CNVCLĐ*',
        'Số CNVCLĐ* nam',
        'Số CNVCLĐ* nữ',
        'Tổng số ĐVCĐ',
        'Số ĐVCĐ* nam',
        'Số ĐVCĐ* nữ',
        'Loại hình - Nhà nước',
        'Loại hình - Trong nước',
        'Loại hình - Ngoài nước',
        'Loại công ty - Công ty Cổ phần',
        'Loại công ty - Công ty TNHH',
        'Năm thành lập',
        'Quốc gia',
        'Thuộc xã phường',
        'Ghi chú',
        'Tên chủ tịch công đoàn',
        'SĐT chủ tịch',
        'Địa chỉ'
      ];

      // Thêm headers vào worksheet
      const headerRow = worksheet.addRow(headers);

      // Style cho header
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }
        };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Thêm dòng hướng dẫn
      const instructionRow = worksheet.addRow([
        '1',
        'Công đoàn ABC',
        'Cụm KCN Đông Nam',
        'Sản xuất điện tử',
        '200',
        '120',
        '80',
        '180',
        '100',
        '80',
        'X', // Nhà nước
        '', // Trong nước
        '', // Ngoài nước
        'X', // Cổ phần
        '', // TNHH
        '2020',
        'Việt Nam',
        'Xã Tân Phú',
        'Ghi chú mẫu',
        'Nguyễn Văn A',
        '0901234567',
        '123 Đường ABC, TP.HCM'
      ]);

      // Style cho dòng mẫu
      instructionRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Thêm ghi chú hướng dẫn
      worksheet.addRow([]);
      const noteRow1 = worksheet.addRow(['GHI CHÚ:']);
      noteRow1.getCell(1).font = { bold: true, color: { argb: 'FFFF0000' } };

      worksheet.addRow(['- Các cột có dấu (*) là bắt buộc']);
      worksheet.addRow(['- Cột "Loại hình" và "Loại công ty": đánh dấu X vào cột tương ứng']);
      worksheet.addRow(['- Năm thành lập: nhập năm (VD: 2020) hoặc ngày tháng đầy đủ']);
      worksheet.addRow(['- Số lượng: chỉ nhập số, không nhập chữ']);
      worksheet.addRow(['- Xóa dòng mẫu này trước khi import']);

      // Auto fit columns
      worksheet.columns.forEach((column, index) => {
        let maxLength = 0;
        if (column.eachCell) {
          column.eachCell((cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
        }
        column.width = Math.min(Math.max(maxLength + 2, 12), 30);
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=template_import.xlsx');

      // Write to response
      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Lỗi khi tạo template:', error);
      throw new BadRequestException('Không thể tạo file template');
    }
  }

  async downloadTemplateImportUser(res: any): Promise<void> {
    try {
      const fs = require('fs');
      // Sử dụng path.resolve để lấy đường dẫn tuyệt đối từ root project
      const filePath = path.resolve(process.cwd(), 'src', 'report', 'template', 'importuser.xlsx');

      console.log('Đường dẫn file importuser.xlsx:', filePath);

      // Kiểm tra file tồn tại
      if (!fs.existsSync(filePath)) {
        console.error('File không tồn tại tại:', filePath);
        throw new BadRequestException('Không tìm thấy file template importuser.xlsx');
      }

      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=importuser.xlsx');

      // Tải file với callback để xử lý lỗi
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Lỗi khi gửi file:', err);
          if (!res.headersSent) {
            throw new BadRequestException('Không thể tải file template import user');
          }
        }
      });

    } catch (error) {
      console.error('Lỗi khi tải template import user:', error);
      if (!res.headersSent) {
        throw new BadRequestException('Không thể tải file template import user');
      }
    }
  }




}
