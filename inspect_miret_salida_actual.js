const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('=== INSPECCIÓN DE EXCEL Y COMPARACIÓN DE STOCK (OPTIMIZADA) ===');

    const excelPath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL -actual.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    const ws = workbook.worksheets[0];

    const requestedStock = new Map(); // key: product_code__lote, val: { code, lote, qty, rows }
    const rowList = [];

    // Miret Medical RUC
    const rucMiret = '20605712241';

    ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Header

        // Skip hidden rows
        if (row.hidden) return;

        const values = row.values;
        const codigo = values[2];
        const cantidad = values[10];
        const lote = values[4];

        if (!codigo) return;

        const codeStr = String(codigo).trim();
        const qtyNum = Number(cantidad) || 0;
        const loteStr = (lote && String(lote).trim() !== '') ? String(lote).trim() : 'FIFO';

        rowList.push({
            rowNumber,
            code: codeStr,
            lote: loteStr,
            qty: qtyNum
        });

        // Accumulate requested quantity per (product_code, lote)
        const key = `${codeStr.toLowerCase()}__${loteStr}`;
        if (!requestedStock.has(key)) {
            requestedStock.set(key, {
                code: codeStr,
                lote: loteStr,
                qty: 0,
                rows: []
            });
        }
        const entry = requestedStock.get(key);
        entry.qty += qtyNum;
        entry.rows.push(rowNumber);
    });

    console.log(`Excel leídos: ${rowList.length} registros válidos.`);
    console.log(`Total productos únicos por combinación (código + lote): ${requestedStock.size}`);

    // 1. Cargar todos los productos de Miret en memoria
    console.log('Cargando productos de la base de datos...');
    const resProducts = await client.query(`
        SELECT id, codigo, descripcion, cliente_ruc 
        FROM productos 
        WHERE cliente_ruc = $1 OR cliente_id = 3
    `, [rucMiret]);

    const productsMap = new Map(); // key: lowercase code, val: array of products (in case of duplicates)
    resProducts.rows.forEach(p => {
        const codeKey = String(p.codigo).toLowerCase().trim();
        if (!productsMap.has(codeKey)) {
            productsMap.set(codeKey, []);
        }
        productsMap.get(codeKey).push(p);
    });

    // 2. Cargar todos los lotes con stock para estos productos
    console.log('Cargando lotes de la base de datos...');
    const productIds = resProducts.rows.map(p => p.id);
    let lotesMap = new Map(); // key: product_id, val: array of lotes

    if (productIds.length > 0) {
        const resLotes = await client.query(`
            SELECT id, producto_id, numero_lote, cantidad_disponible, fecha_vencimiento, created_at
            FROM lotes
            WHERE producto_id = ANY($1)
            ORDER BY fecha_vencimiento ASC, created_at ASC
        `, [productIds]);

        resLotes.rows.forEach(l => {
            if (!lotesMap.has(l.producto_id)) {
                lotesMap.set(l.producto_id, []);
            }
            lotesMap.get(l.producto_id).push(l);
        });
    }

    console.log('\n--- COMPARATIVA DE STOCK EN BASE DE DATOS (MIRET) ---');
    let errorsFound = 0;

    for (const [key, req] of requestedStock.entries()) {
        const codeKey = req.code.toLowerCase().trim();
        const matchedProds = productsMap.get(codeKey) || [];

        if (matchedProds.length === 0) {
            console.log(`❌ ERROR: Producto con código "${req.code}" no existe registrado para Miret Medical (RUC: ${rucMiret}).`);
            console.log(`   Solicitado en filas: ${req.rows.join(', ')} (Cantidad total: ${req.qty})`);
            errorsFound++;
            continue;
        }

        // Si hay varios, elegir el de mayor ID (mismo comportamiento del frontend)
        const product = matchedProds.sort((a, b) => b.id - a.id)[0];

        // Obtener lotes disponibles del producto
        const productLotes = lotesMap.get(product.id) || [];
        let matchingLotes = [];

        if (req.lote === 'FIFO') {
            matchingLotes = productLotes.filter(l => Number(l.cantidad_disponible) > 0);
        } else {
            matchingLotes = productLotes.filter(l => String(l.numero_lote).trim() === req.lote);
        }

        const totalAvailable = matchingLotes.reduce((acc, curr) => acc + Number(curr.cantidad_disponible), 0);

        if (totalAvailable < req.qty) {
            console.log(`❌ ERROR DE STOCK: Código "${req.code}" | Lote: "${req.lote}"`);
            console.log(`   - Solicitado: ${req.qty} unidades`);
            console.log(`   - Disponible en BD: ${totalAvailable} unidades`);
            console.log(`   - Filas de Excel: ${req.rows.join(', ')}`);
            if (matchingLotes.length > 0) {
                console.log(`   - Lotes reales del producto en BD:`);
                matchingLotes.forEach(l => {
                    console.log(`     * Lote: "${l.numero_lote}" | Disp: ${l.cantidad_disponible} | Vcto: ${l.fecha_vencimiento}`);
                });
            } else {
                console.log(`   - (No hay ningún lote con stock disponible en BD para este producto o no coincide el lote)`);
                if (productLotes.length > 0) {
                    console.log(`   - Lotes de este producto en BD con otra identificación:`);
                    productLotes.forEach(l => {
                        console.log(`     * Lote: "${l.numero_lote}" | Disp: ${l.cantidad_disponible} | Vcto: ${l.fecha_vencimiento}`);
                    });
                }
            }
            errorsFound++;
        }
    }

    if (errorsFound === 0) {
        console.log('\n✅ ¡Todo cuadra! No se encontraron problemas de stock.');
    } else {
        console.log(`\n❌ Se encontraron ${errorsFound} inconsistencias de stock.`);
    }

    await client.end();
}

main().catch(console.error);
