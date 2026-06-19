const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    const excelPath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.worksheets[0];

    console.log('Row 1:', ws.getRow(1).values);
    console.log('Row 2:', ws.getRow(2).values);
}

main().catch(console.error);
