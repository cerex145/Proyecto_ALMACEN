const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  // Inspect Ingreso
  const ingresoPath = path.join(docsDir, 'INGRESO AFECORP.xlsx');
  const ingresoWorkbook = new ExcelJS.Workbook();
  await ingresoWorkbook.xlsx.readFile(ingresoPath);
  const ingresoSheet = ingresoWorkbook.worksheets[0];
  
  console.log('=== INGRESO AFECORP ===');
  const ingresoProducts = new Map();
  let ingresoTotalQty = 0;
  ingresoSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const code = String(values[2] || '').trim();
    const name = String(values[3] || '').trim();
    const qty = Number(values[13] || 0);
    ingresoTotalQty += qty;
    const key = `${code}|||${name}`;
    ingresoProducts.set(key, (ingresoProducts.get(key) || 0) + qty);
  });
  console.log(`Total rows: ${ingresoSheet.rowCount - 1}`);
  console.log(`Total quantity: ${ingresoTotalQty}`);
  console.log('Unique products with code or generic code:');
  for (const [key, qty] of ingresoProducts.entries()) {
    console.log(`  - ${key}: Qty = ${qty}`);
  }

  // Inspect Salida
  const salidaPath = path.join(docsDir, 'SALIDA AFECORP.xlsx');
  const salidaWorkbook = new ExcelJS.Workbook();
  await salidaWorkbook.xlsx.readFile(salidaPath);
  const salidaSheet = salidaWorkbook.worksheets[0];

  console.log('\n=== SALIDA AFECORP ===');
  const salidaProducts = new Map();
  let salidaTotalQty = 0;
  salidaSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const code = String(values[2] || '').trim();
    const name = String(values[3] || '').trim();
    const qty = Number(values[10] || 0);
    salidaTotalQty += qty;
    const key = `${code}|||${name}`;
    salidaProducts.set(key, (salidaProducts.get(key) || 0) + qty);
  });
  console.log(`Total rows: ${salidaSheet.rowCount - 1}`);
  console.log(`Total quantity: ${salidaTotalQty}`);
  console.log('Unique products with code or generic code:');
  for (const [key, qty] of salidaProducts.entries()) {
    console.log(`  - ${key}: Qty = ${qty}`);
  }
}

main().catch(err => console.error(err));
