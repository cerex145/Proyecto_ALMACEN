const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  console.log('--- INSPECCIÓN DE FILAS DE LA 2 A LA 20 ---');
  let hiddenCount = 0;
  for (let i = 2; i <= 365; i++) {
    const row = sheet.getRow(i);
    // ExcelJS row object might have hidden property or we can check its height or properties
    if (row.hidden) {
      hiddenCount++;
    }
  }
  
  console.log(`Total filas entre la 2 y la 365: ${365 - 2 + 1}`);
  console.log(`Filas marcadas como ocultas (row.hidden): ${hiddenCount}`);
  
  // Let's print row height of row 15
  const row15 = sheet.getRow(15);
  console.log('Fila 15 - Hidden:', row15.hidden, 'Height:', row15.height, 'Values:', row15.values);
  
  // Let's check if the sheet has an autofilter defined
  console.log('AutoFilter:', sheet.autoFilter);
}

main().catch(console.error);
