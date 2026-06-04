const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const rows = [533, 654];
  for (const rNum of rows) {
    const row = sheet.getRow(rNum);
    console.log(`\n=== Fila ${rNum} ===`);
    for (let cNum = 1; cNum <= 16; cNum++) {
      const cell = row.getCell(cNum);
      console.log(`Columna ${cNum} (${sheet.getRow(1).getCell(cNum).value}):`);
      console.log('  - Tipo:', typeof cell.value);
      console.log('  - Valor:', cell.value);
    }
  }
}

main().catch(console.error);
