const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const rucs = new Set();
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    rucs.add(values[0]);
  });

  console.log('RUCs únicos encontrados en SALIDA MIRET MEDICAL.xlsx:', Array.from(rucs));
}

main().catch(console.error);
