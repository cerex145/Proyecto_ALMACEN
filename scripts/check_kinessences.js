const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const docsDir = 'c:\\Users\\Carlos\\Downloads\\Proyecto_ALMACEN\\docs';
  const ingresoPath = path.join(docsDir, 'INGRESO AFECORP.xlsx');
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(ingresoPath);
  const sheet = workbook.worksheets[0];

  console.log('=== BUSCANDO EN INGRESO ===');
  sheet.eachRow((row, rowNumber) => {
    const values = row.values;
    const desc = String(values[3] || '').trim();
    const lote = String(values[4] || '').trim();
    
    if (lote.includes('2511114218') || desc.includes('KINESSENCES COLOR 8.O')) {
      console.log(`Fila ${rowNumber}: Desc=${desc}, Lote=${lote}, Qty=${values[11]}`);
    }
  });
}

main().catch(err => console.error(err));
