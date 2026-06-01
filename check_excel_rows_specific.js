const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const rowsToCheck = [1203, 1333, 1638, 1768, 1769];
  console.log('Chequeando filas específicas del Excel:');
  for (const rowNum of rowsToCheck) {
    const row = sheet.getRow(rowNum);
    console.log(`Fila ${rowNum}:`, row.values);
  }
}

main().catch(console.error);
