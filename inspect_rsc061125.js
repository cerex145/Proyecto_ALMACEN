const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    const excelPath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL -actual.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.worksheets[0];

    console.log('=== BÚSQUEDA DE rsc061125-hw45 EN EXCEL ===');

    ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const [
            ruc,
            codigo,
            nombre,
            lote,
            um,
            bultos,
            cajas,
            x_caja,
            fraccion,
            cantidad,
            motivo
        ] = row.values.slice(1);

        if (codigo && String(codigo).trim() === 'rsc061125-hw45') {
            console.log(`Fila ${rowNumber}:`, {
                ruc,
                codigo,
                nombre,
                lote,
                um,
                cantidad,
                motivo
            });
        }
    });
}

main().catch(console.error);
