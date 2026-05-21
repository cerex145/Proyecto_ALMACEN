const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  const headers = sheet.getRow(1).values.slice(1);
  console.log('Encabezados:', headers);
  
  console.log('\nRegistros completos:');
  for (let i = 2; i <= 6; i++) {
    const row = sheet.getRow(i);
    const rowObj = {};
    headers.forEach((h, index) => {
      rowObj[h] = row.getCell(index + 1).value;
    });
    console.log(`Fila ${i}:`, rowObj);
  }
}

main().catch(err => console.error(err));
