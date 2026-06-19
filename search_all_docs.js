const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function main() {
    const docsDir = path.join(__dirname, 'docs');
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

    const targetCodes = ['2510227459', 'MVC19', 'PMTDF50', 'PPHTC72'];
    console.log('=== BÚSQUEDA DE CÓDIGOS EN TODOS LOS EXCEL ===');
    console.log('Códigos buscados:', targetCodes);

    for (const file of files) {
        const filePath = path.join(docsDir, file);
        const workbook = new ExcelJS.Workbook();
        try {
            await workbook.xlsx.readFile(filePath);
            const ws = workbook.worksheets[0];
            if (!ws) continue;

            ws.eachRow((row, rowNumber) => {
                row.values.forEach((val, colIdx) => {
                    if (val) {
                        const valStr = String(val).trim();
                        if (targetCodes.includes(valStr)) {
                            console.log(`Encontrado en [${file}] | Fila ${rowNumber} | Col ${colIdx}: "${val}"`);
                            console.log('Fila completa:', row.values);
                        }
                    }
                });
            });
        } catch (err) {
            console.error(`Error leyendo ${file}:`, err.message);
        }
    }
}

main().catch(console.error);
