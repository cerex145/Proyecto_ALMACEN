const ExcelJS = require('c:\\Users\\Carlos\\Downloads\\Proyecto_ALMACEN\\apps\\api\\node_modules\\exceljs');
const path = require('path');

async function main() {
  const filePath = 'c:\\Users\\Carlos\\Downloads\\Proyecto_ALMACEN\\docs\\INGRESO AFECORP.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const sheet = workbook.worksheets[0];
  console.log('Sheet name:', sheet.name);
  console.log('Total rows:', sheet.rowCount);
  console.log('Total columns:', sheet.columnCount);
  
  // Let's print the headers and first few rows
  for (let i = 1; i <= 5; i++) {
    const values = sheet.getRow(i).values;
    console.log(`Row ${i} values:`, values.slice(0, 15));
  }

  // Count rows with actual values
  let nonEmptyCount = 0;
  sheet.eachRow((row, rowNumber) => {
    nonEmptyCount++;
  });
  console.log('Non-empty rows count:', nonEmptyCount);
}

main().catch(err => console.error(err));
