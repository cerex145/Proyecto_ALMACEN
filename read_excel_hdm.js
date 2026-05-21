const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, 'docs', 'SALIDA HDM CAPITAL.xlsx');
console.log('Leyendo:', excelPath);

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log('Total de filas leídas:', rows.length);

let totalCantidad = 0;
let details = [];

rows.forEach((row, i) => {
  const qty = Number(row.cantidad || 0);
  totalCantidad += qty;
  details.push({
    rowNum: i + 2, // 1-based, plus 1 for header
    codigo: String(row.codigo_producto || '').trim(),
    lote: String(row.lote || '').trim(),
    cantidad: qty
  });
});

console.log('Suma total de cantidad (columna cantidad) en excel:', totalCantidad);

// Let's output all rows to see their quantities and details
console.log('\n--- DETALLE DE FILAS DE EXCEL ---');
details.forEach(d => {
  console.log(`Fila ${d.rowNum}: Código=${d.codigo}, Lote=${d.lote}, Cantidad=${d.cantidad}`);
});
