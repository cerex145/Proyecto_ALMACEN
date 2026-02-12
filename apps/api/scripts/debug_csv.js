const ExcelJS = require('exceljs');
const fs = require('fs');

async function debug() {
    const csvPath = 'C:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN\\DATAA\\DB_almacen.csv';
    const workbook = new ExcelJS.Workbook();
    console.log('📂 Leyendo archivo CSV...');
    const worksheet = await workbook.csv.readFile(csvPath, {
        parserOptions: {
            delimiter: ';',
            quote: ''
        }
    });

    let found = 0;
    worksheet.eachRow((row, rowNumber) => {
        if (found > 5) return;
        const vals = row.values;
        // Check array for PROD-
        vals.forEach((val, idx) => {
            if (val && String(val).startsWith('PROD-')) {
                console.log(`Found PROD at Row ${rowNumber}, Col ${idx}: ${val}`);
                // Also print other key columns to verify alignment
                console.log(`  Row Values:`, JSON.stringify(vals));
                found++;
            }
        });
    });
}

debug();
