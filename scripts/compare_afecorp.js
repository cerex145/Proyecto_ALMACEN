const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const docsDir = 'c:\\Users\\Carlos\\Downloads\\Proyecto_ALMACEN\\docs';
  const ingresoPath = path.join(docsDir, 'INGRESO AFECORP.xlsx');
  const salidaPath = path.join(docsDir, 'SALIDA AFECORP.xlsx');

  const workbookI = new ExcelJS.Workbook();
  await workbookI.xlsx.readFile(ingresoPath);
  const sheetI = workbookI.worksheets[0];

  const workbookS = new ExcelJS.Workbook();
  await workbookS.xlsx.readFile(salidaPath);
  const sheetS = workbookS.worksheets[0];

  console.log('=== ANALIZANDO LOTE SP1124052316 EN INGRESO ===');
  sheetI.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const code = String(values[2] || '').trim();
    const desc = String(values[3] || '').trim();
    const lote = String(values[4] || '').trim();
    const qty = Number(values[11] || 0);

    if (lote === 'SP1124052316') {
      console.log(`Fila ${rowNumber}: Code=${code}, Desc=${desc}, Lote=${lote}, Cantidad=${qty}`);
    }
  });

  console.log('\n=== ANALIZANDO LOTE SP1124052316 EN SALIDA ===');
  sheetS.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const code = String(values[2] || '').trim();
    const desc = String(values[3] || '').trim();
    const lote = String(values[4] || '').trim();
    const qty = Number(values[10] || 0);

    if (lote === 'SP1124052316') {
      console.log(`Fila ${rowNumber}: Code=${code}, Desc=${desc}, Lote=${lote}, Cantidad=${qty}`);
    }
  });
}

main().catch(err => console.error(err));
