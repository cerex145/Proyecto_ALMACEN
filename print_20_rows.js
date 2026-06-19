const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    const excelPath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL -actual.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.worksheets[0];

    for (let i = 1; i <= 20; i++) {
        console.log(`Row ${i}:`, ws.getRow(i).values);
    }
}

main().catch(console.error);
