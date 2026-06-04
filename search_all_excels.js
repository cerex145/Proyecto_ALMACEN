const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function main() {
  const docsDir = path.join(__dirname, 'docs');
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

  const searchLotes = ['25A574', '25A567', '24A361', '25A552', '25A572', '25A763'];
  
  console.log('Buscando lotes en todos los archivos de docs/:\n');

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      for (const sheet of workbook.worksheets) {
        sheet.eachRow((row, rowNumber) => {
          const rawValues = Array.isArray(row.values) ? row.values : [];
          const rowStr = rawValues.map(v => String(v || '').trim()).join(' | ');
          
          for (const lote of searchLotes) {
            if (rowStr.toUpperCase().includes(lote.toUpperCase())) {
              console.log(`¡ENCONTRADO en [${file}] - Hoja "${sheet.name}" - Fila ${rowNumber}!`);
              console.log(`   Lote buscado: "${lote}"`);
              console.log(`   Valores: ${rowStr}`);
            }
          }
        });
      }
    } catch (e) {
      console.error(`Error leyendo ${file}: ${e.message}`);
    }
  }

  console.log('\n--- Búsqueda finalizada ---');
}

main().catch(console.error);
