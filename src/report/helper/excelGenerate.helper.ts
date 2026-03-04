import ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
const dirGlobal = '/src/report/template/';
const dirDownloadGlobal = '/src/report/saved';
const rootDir = process.cwd();

export async function initialExcelTemplate(templateFile: string): Promise<any> {
  const content = fs.readFileSync(path.join(rootDir, dirGlobal, templateFile));
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('hh');

  // ws.mergeCells()
  // const workbook = new Excel.Workbook();
  await workbook.xlsx.load(content);

  return workbook;
}

export async function finishSavingExcelTemplate(workbook: any, templateFile: string, saveDir: string): Promise<string> {
  const dt = new Date();

  const fileNameSplitOnly = templateFile.split('.');
  const filename = fileNameSplitOnly[0] + '_' + dt.getTime() + '.' + fileNameSplitOnly[1];
  const outputPath = path.join(rootDir, dirDownloadGlobal, saveDir, filename);

  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}
