const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  
  console.log('Rows matching product "53610002":');
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    if (String(values[2]).includes('53610002')) {
      console.log(`Row ${rowNumber}:`, {
        ruc_cliente: values[1],
        codigo_producto: values[2],
        nombre: values[3],
        lote: values[4],
        fecha_vencimiento: values[5],
        fecha_ingreso: values[6],
        cantidad_bultos: values[7],
        cantidad_cajas: values[8],
        cantidad_por_caja: values[9],
        cantidad_fraccion: values[10],
        cantidad_total: values[11],
        um: values[12],
        fabricante: values[13]
      });
    }
  });
}

main().catch(err => console.error(err));
