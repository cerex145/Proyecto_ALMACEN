const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    rows.push({
      rowNumber,
      ruc: String(values[1] || '').trim(),
      codigo: String(values[2] || '').trim(),
      nombre: String(values[3] || '').trim(),
      lote: String(values[4] || '').trim(),
      total: Number(values[11] || 0)
    });
  });

  console.log(`Total de filas de datos en Excel: ${rows.length}`);

  const codeGroups = {};
  const codeLoteGroups = {};
  
  for (const r of rows) {
    codeGroups[r.codigo] = (codeGroups[r.codigo] || 0) + 1;
    const kl = `${r.codigo} | Lote: ${r.lote}`;
    if (!codeLoteGroups[kl]) {
      codeLoteGroups[kl] = [];
    }
    codeLoteGroups[kl].push(r);
  }
  
  console.log(`Códigos de producto únicos: ${Object.keys(codeGroups).length}`);
  console.log(`Combinaciones únicas de (Código + Lote): ${Object.keys(codeLoteGroups).length}`);
  
  console.log('\n--- COMBINACIONES DUPLICADAS EN EL EXCEL (Mismo Código + Mismo Lote) ---');
  let duplicateCombinationsCount = 0;
  let totalDuplicatedRowsCount = 0;
  
  for (const [kl, items] of Object.entries(codeLoteGroups)) {
    if (items.length > 1) {
      duplicateCombinationsCount++;
      totalDuplicatedRowsCount += items.length;
      console.log(`\nProducto: ${items[0].nombre}`);
      console.log(`Llave: [${kl}] se repite ${items.length} veces:`);
      items.forEach(item => {
        console.log(`  - Fila Excel ${item.rowNumber}: Cantidad = ${item.total}`);
      });
      const sumaTotal = items.reduce((acc, curr) => acc + curr.total, 0);
      console.log(`  => Suma total que debería tener en el PDF/Sistema: ${sumaTotal}`);
    }
  }
  
  console.log(`\nTotal de combinaciones (Código + Lote) que se repiten: ${duplicateCombinationsCount}`);
  console.log(`Total de filas del Excel involucradas en repeticiones: ${totalDuplicatedRowsCount}`);
  console.log(`Filas sin repetición: ${rows.length - totalDuplicatedRowsCount}`);
  console.log(`Total de filas colapsadas en PDF (Filas sin repetición + combinaciones repetidas): ${(rows.length - totalDuplicatedRowsCount) + duplicateCombinationsCount}`);
}

main().catch(err => console.error(err));
