const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  // Inspect Ingreso
  const ingresoPath = path.join(docsDir, 'INGRESO AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(ingresoPath);
  const sheet = workbook.worksheets[0];
  
  console.log('=== INGRESO COLUMNS ===');
  const firstRow = sheet.getRow(1).values;
  console.log('First row headers:', firstRow);
  
  console.log('\nFirst 5 rows values:');
  for (let i = 2; i <= 6; i++) {
    console.log(`Row ${i}:`, sheet.getRow(i).values);
  }

  // Inspect Salida
  const salidaPath = path.join(docsDir, 'SALIDA AFECORP.xlsx');
  const workbook2 = new ExcelJS.Workbook();
  await workbook2.xlsx.readFile(salidaPath);
  const sheet2 = workbook2.worksheets[0];

  console.log('\n=== SALIDA COLUMNS ===');
  const firstRow2 = sheet2.getRow(1).values;
  console.log('First row headers:', firstRow2);

  console.log('\nFirst 5 rows values:');
  for (let i = 2; i <= 6; i++) {
    console.log(`Row ${i}:`, sheet2.getRow(i).values);
  }
}

main().catch(err => console.error(err));
