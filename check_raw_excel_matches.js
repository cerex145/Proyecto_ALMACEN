const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const searchLotes = ['25A574', '25A567', '24A361', '25A552', '25A572', '25A763'];
  console.log('Buscando lotes en crudo dentro de INGRESO MIRET MEDICAL.xlsx:');

  sheet.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    // Convert all cell values to string and search
    const rowStr = rawValues.map(v => String(v || '').trim()).join(' | ');
    
    for (const lote of searchLotes) {
      if (rowStr.toUpperCase().includes(lote.toUpperCase())) {
        console.log(`¡ENCONTRADO! Fila ${rowNumber} contiene el lote "${lote}":`);
        console.log(`   Valores: ${rowStr}`);
      }
    }
  });

  console.log('\n--- Búsqueda finalizada ---');
}

main().catch(console.error);
