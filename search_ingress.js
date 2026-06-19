const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    const excelPath = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.worksheets[0];

    console.log('=== BÚSQUEDA EN INGRESO MIRET MEDICAL.xlsx ===');
    const targetCodes = ['2510227459', 'MVC19', 'PMTDF50', 'PPHTC72'];

    ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const [
            ruc,
            codigo_recepcion,
            fecha_llegada,
            tipo_conteo,
            responsable,
            guia_remision,
            caja,
            codigo_producto,
            nombre,
            lote,
            fecha_ingreso,
            fecha_vencimiento,
            cantidad_total,
            unidad,
            um,
            fabricante,
            temp_min,
            temp_max
        ] = row.values.slice(1);

        if (codigo_producto) {
            const codeStr = String(codigo_producto).trim();
            if (targetCodes.includes(codeStr)) {
                console.log(`Fila ${rowNumber}:`, {
                    ruc,
                    codigo_producto,
                    nombre,
                    lote,
                    cantidad_total
                });
            }
        }
    });
}

main().catch(console.error);
