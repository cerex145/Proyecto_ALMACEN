const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    const excelPath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.worksheets[0];

    const codes = new Set();
    ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const vals = row.values;
        const code = vals[2]; // Column B (col 2) is codigo_producto
        if (code) {
            codes.add(String(code).trim());
        }
    });

    console.log('=== CÓDIGOS ÚNICOS EN INGRESO MIRET MEDICAL.xlsx ===');
    console.log(Array.from(codes).sort());
    console.log('Total códigos únicos de ingreso:', codes.size);
}

main().catch(console.error);
