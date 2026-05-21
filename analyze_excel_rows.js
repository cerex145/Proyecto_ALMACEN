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
      lote: String(values[3] || '').trim(),
      total: Number(values[11] || 0)
    });
  });

  console.log(`Total data rows in Excel: ${rows.length}`);

  // Let's count how many have the same product code
  const codeGroups = {};
  const codeLoteGroups = {};
  
  for (const r of rows) {
    codeGroups[r.codigo] = (codeGroups[r.codigo] || 0) + 1;
    const kl = `${r.codigo}|${r.lote}`;
    codeLoteGroups[kl] = (codeLoteGroups[kl] || 0) + 1;
  }
  
  console.log(`Unique product codes: ${Object.keys(codeGroups).length}`);
  console.log(`Unique product code + lote combinations: ${Object.keys(codeLoteGroups).length}`);
  
  // Let's print the product codes that appear multiple times
  console.log('\nProduct codes appearing multiple times:');
  for (const [code, count] of Object.entries(codeGroups)) {
    if (count > 1) {
      console.log(`- "${code.replace(/\n/g, ' ')}": ${count} times`);
    }
  }
  
  console.log('\nProduct code + Lote combinations appearing multiple times (if any):');
  for (const [kl, count] of Object.entries(codeLoteGroups)) {
    if (count > 1) {
      console.log(`- "${kl.replace(/\n/g, ' ')}": ${count} times`);
    }
  }
}

main().catch(err => console.error(err));
