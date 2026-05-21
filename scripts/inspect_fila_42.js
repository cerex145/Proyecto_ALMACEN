const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  // Inspect Salida Fila 42
  const salidaPath = path.join(docsDir, 'SALIDA AFECORP.xlsx');
  const workbookS = new ExcelJS.Workbook();
  await workbookS.xlsx.readFile(salidaPath);
  const sheetS = workbookS.worksheets[0];
  
  const rowS = sheetS.getRow(42).values;
  console.log('=== SALIDA FILA 42 ===');
  console.log('Valores:', rowS);

  const prodCode = String(rowS[2] || '').trim();
  const prodName = String(rowS[3] || '').trim();
  const lote = String(rowS[4] || '').trim();
  const qty = Number(rowS[10] || 0);
  
  console.log(`Product Code: ${prodCode}`);
  console.log(`Product Name: ${prodName}`);
  console.log(`Lote: ${lote}`);
  console.log(`Cantidad pedida: ${qty}`);

  // Now find all rows in INGRESO matching this product and lote
  const ingresoPath = path.join(docsDir, 'INGRESO AFECORP.xlsx');
  const workbookI = new ExcelJS.Workbook();
  await workbookI.xlsx.readFile(ingresoPath);
  const sheetI = workbookI.worksheets[0];

  console.log('\n=== BUSCANDO EN INGRESO AFECORP ===');
  let matchCount = 0;
  sheetI.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const iCode = String(values[2] || '').trim();
    const iName = String(values[3] || '').trim();
    const iLote = String(values[4] || '').trim();
    const iQty = Number(values[11] || 0); // Column 11 is cantidad_total

    if (iCode.toLowerCase().includes(prodCode.toLowerCase()) || prodCode.toLowerCase().includes(iCode.toLowerCase())) {
      if (iLote.trim() === lote.trim()) {
        console.log(`Fila ${rowNumber} de Ingreso: Lote=${iLote}, Qty=${iQty}, Producto=${iName}`);
        matchCount++;
      }
    }
  });

  if (matchCount === 0) {
    console.log('No se encontraron coincidencias exactas por código y lote.');
    // Let's print all rows in Ingreso that match the lote
    console.log('\n=== BUSCANDO COINCIDENCIAS POR LOTE SOLAMENTE EN INGRESO ===');
    sheetI.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values = row.values;
      const iCode = String(values[2] || '').trim();
      const iName = String(values[3] || '').trim();
      const iLote = String(values[4] || '').trim();
      const iQty = Number(values[11] || 0);

      if (iLote.trim() === lote.trim()) {
        console.log(`Fila ${rowNumber} de Ingreso: Code=${iCode}, Lote=${iLote}, Qty=${iQty}, Producto=${iName}`);
      }
    });
  }
}

main().catch(err => console.error(err));
