const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  // Inspect Salida
  const salidaPath = path.join(docsDir, 'SALIDA AFECORP.xlsx');
  const workbookS = new ExcelJS.Workbook();
  await workbookS.xlsx.readFile(salidaPath);
  const sheetS = workbookS.worksheets[0];
  
  console.log('=== BUSCANDO EN SALIDA AFECORP ===');
  sheetS.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const sCode = String(values[2] || '').trim();
    const sName = String(values[3] || '').trim();
    const sLote = String(values[4] || '').trim();
    const sQty = Number(values[10] || 0);

    if (sLote.trim() === 'SP1124052316' || sCode === '11510005') {
      console.log(`Fila ${rowNumber} de Salida: Code=${sCode}, Lote=${sLote}, Qty=${sQty}, Producto=${sName}`);
    }
  });
}

main().catch(err => console.error(err));
