const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log('Inspección de Celdas de Lote:');
  const rowsToInspect = [2, 3, 8, 25, 33, 47, 58];
  
  rowsToInspect.forEach(r => {
    const row = sheet.getRow(r);
    const cellValue = row.getCell(4).value; // Columna D (Lote)
    const cellType = typeof cellValue;
    console.log(`Fila ${r}:`, {
      type: cellType,
      value: cellValue,
      stringified: String(cellValue)
    });
  });
}

main().catch(err => console.error(err));
