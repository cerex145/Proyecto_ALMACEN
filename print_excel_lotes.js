const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log('--- RESUMEN DE SALIDAS EN EL EXCEL ---');
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    // columns are: 1:ruc, 2:codigo, 3:nombre, 4:lote, 5:um, 6:cant_bulto, 7:cant_caja, 8:cant_x_caja, 9:cant_fraccion, 10:cantidad
    console.log(`Fila ${rowNumber}: Código="${values[2]}" | Lote="${values[4]}" | Cantidad=${values[10]} | Nombre="${String(values[3] || '').substring(0, 30)}"`);
  });
}

main().catch(err => console.error(err));
