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

  const missingLots = [
    'SP5325022829',
    'SP4125022805',
    'SP4125031203',
    'SP5025090304',
    'SP5325041706',
    'SP1125081407',
    '2511114218',
    '2506106166',
    'I3304488',
    'SP5324121808'
  ];

  console.log('=== BUSCANDO LOTES DE SALIDA EN EL EXCEL DE INGRESO ===');
  for (const targetLote of missingLots) {
    let found = false;
    sheetI.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values = row.values;
      const code = String(values[2] || '').trim();
      const desc = String(values[3] || '').trim();
      const lote = String(values[4] || '').trim();
      const qty = Number(values[11] || 0);

      if (lote.trim().toUpperCase() === targetLote.trim().toUpperCase()) {
        console.log(`LOTE ${targetLote} ENCONTRADO en Ingreso Fila ${rowNumber}: Code=${code}, Desc=${desc}, Qty=${qty}`);
        found = true;
      }
    });
    if (!found) {
      console.log(`LOTE ${targetLote} NO ENCONTRADO EN INGRESO`);
    }
  }
}

main().catch(err => console.error(err));
