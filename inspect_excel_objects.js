const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const inspectRows = [373, 375, 633, 635, 636, 638, 641];
  console.log('Inspeccionando objetos en columna LOTE (columna D, índice 4):');
  
  for (const rNum of inspectRows) {
    const row = sheet.getRow(rNum);
    const loteVal = row.getCell(4).value;
    console.log(`\nFila ${rNum}:`);
    console.log('Tipo de valor:', typeof loteVal);
    console.log('Valor bruto:', loteVal);
    if (loteVal && typeof loteVal === 'object') {
      console.log('JSON.stringify:', JSON.stringify(loteVal, null, 2));
      console.log('Resultado de toString():', loteVal.toString());
      if (loteVal.result !== undefined) {
        console.log('Resultado de .result:', loteVal.result);
      }
      if (loteVal.richText !== undefined) {
        console.log('Resultado de .richText:', loteVal.richText);
        const text = loteVal.richText.map(rt => rt.text).join('');
        console.log('Texto unificado de RichText:', text);
      }
    }
  }
}

main().catch(console.error);
