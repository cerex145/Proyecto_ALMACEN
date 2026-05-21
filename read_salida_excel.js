const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  console.log('Nombre de la hoja:', sheet.name);
  console.log('Filas totales:', sheet.rowCount);
  console.log('Columnas totales:', sheet.columnCount);
  
  // Imprimir encabezados
  const headers = sheet.getRow(1).values;
  console.log('\nEncabezados:', headers.slice(1, 15));
  
  // Imprimir primeros 10 registros para entender los datos
  console.log('\nPrimeros 10 registros:');
  for (let i = 2; i <= Math.min(sheet.rowCount, 11); i++) {
    const values = sheet.getRow(i).values;
    console.log(`Fila ${i}:`, {
      col1: values[1], // RUC?
      col2: values[2], // Código?
      col3: values[3], // Descripción?
      col4: values[4], // Lote?
      col5: values[5], // Cantidad?
      col6: values[6], // UM?
      col7: values[7],
      col8: values[8]
    });
  }
}

main().catch(err => console.error(err));
