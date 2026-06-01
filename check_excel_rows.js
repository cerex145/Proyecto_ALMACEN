const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  console.log('File path:', filePath);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  console.log('Total rows in sheet:', sheet.rowCount);
  
  // Print first 10 rows
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 15) return;
    console.log(`Fila ${rowNumber}:`, row.values);
  });
}

main().catch(console.error);
