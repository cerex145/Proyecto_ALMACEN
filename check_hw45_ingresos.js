const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log('Buscando ingresos para RSC061125-HW45 en el Excel:');

  sheet.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);
    
    // Column 2 is codigo_producto
    const codigo = String(values[1] || '').trim().toUpperCase();
    
    if (codigo === 'RSC061125-HW45') {
      console.log(`\nFila ${rowNumber}:`);
      console.log('Valores completos de la fila:', values);
      // Let's print individual cell objects for columns like:
      // index 7 (cantidad_bultos), index 8 (cantidad_cajas), index 9 (cantidad_por_caja), index 10 (cantidad_fraccion), index 11 (cantidad_total)
      console.log('  - cantidad_bultos (Col H):', values[7], 'Type:', typeof values[7]);
      console.log('  - cantidad_cajas (Col I):', values[8], 'Type:', typeof values[8]);
      console.log('  - cantidad_por_caja (Col J):', values[9], 'Type:', typeof values[9]);
      console.log('  - cantidad_fraccion (Col K):', values[10], 'Type:', typeof values[10]);
      console.log('  - cantidad_total (Col L):', values[11], 'Type:', typeof values[11]);
    }
  });
}

main().catch(console.error);
