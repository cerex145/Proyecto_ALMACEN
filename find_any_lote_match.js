const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log('Buscando ingresos para el Lote 202512604 en el Excel:');

  sheet.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);
    
    // Column 4 is lote (index 3 of shifted values)
    const lote = String(values[3] || '').trim();
    
    if (lote === '202512604') {
      console.log(`\nFila ${rowNumber}:`);
      console.log('  - Código:', values[1]);
      console.log('  - Descripción:', values[2]);
      console.log('  - Lote:', values[3]);
      console.log('  - Cantidad Total (Col L):', values[10]);
      console.log('  - Valores completos:', values);
    }
  });
}

main().catch(console.error);
