const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const searchCodes = ['200150350', '400100350', '250100350', '300200350', '150200350', '200200350'];
  console.log('Buscando productos en INGRESO MIRET MEDICAL.xlsx:');

  sheet.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);
    
    // Column 2 is codigo_producto
    const codigo = String(values[1] || '').trim().toUpperCase();
    
    if (searchCodes.includes(codigo)) {
      console.log(`Fila ${rowNumber}: Producto ${codigo}, Lote en Excel: "${values[3]}", Cantidad: ${values[10]}`);
    }
  });
}

main().catch(console.error);
