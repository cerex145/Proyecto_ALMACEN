const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log('Sheet Name:', sheet.name);
  console.log('Total rows:', sheet.rowCount);
  
  // Print headers and first 5 rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 5) return;
    console.log(`Row ${rowNumber}:`, row.values);
  });
}

main().catch(console.error);
