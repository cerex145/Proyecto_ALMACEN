const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    console.log('=== INVESTIGACIÓN DE STOCK Y CLIENTES EN SUPABASE ===');

    // 1. Ver si hay códigos de producto repetidos en la tabla 'productos'
    const resDupCodes = await client.query(`
        SELECT codigo, COUNT(*) as cantidad, STRING_AGG(DISTINCT COALESCE(cliente_ruc, 'NULL'), ', ') as ructs
        FROM productos
        GROUP BY codigo
        HAVING COUNT(*) > 1
    `);
    console.log('\n1. Códigos de producto duplicados en la tabla productos:', resDupCodes.rows);

    // 2. Ver cuántos productos tienen cliente_ruc = NULL
    const resNullRuc = await client.query(`
        SELECT COUNT(*) as total_productos, 
               COUNT(*) FILTER (WHERE cliente_ruc IS NULL) as ruc_nulos,
               COUNT(*) FILTER (WHERE cliente_ruc IS NOT NULL) as ruc_con_valor
        FROM productos
    `);
    console.log('\n2. Distribución de RUCs en productos:', resNullRuc.rows[0]);

    // 3. Buscar productos con el mismo código y ver si tienen lotes de diferentes clientes
    const resSharedStock = await client.query(`
        SELECT p.codigo, p.descripcion, 
               COUNT(DISTINCT l.id) as total_lotes,
               COUNT(DISTINCT ni.cliente_ruc) as rucs_ingreso_distintos,
               STRING_AGG(DISTINCT ni.cliente_ruc, ', ') as rucs_propietarios
        FROM lotes l
        JOIN productos p ON l.producto_id = p.id
        LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
        GROUP BY p.codigo, p.descripcion
        HAVING COUNT(DISTINCT ni.cliente_ruc) > 1
        LIMIT 10
    `);
    console.log('\n3. Productos con lotes de ingresos de DIFERENTES RUCs/clientes (Stock Compartido):', resSharedStock.rows);

    // 4. Ver un ejemplo concreto de stock compartido (el primero de la lista anterior si existe)
    if (resSharedStock.rows.length > 0) {
        const sampleCode = resSharedStock.rows[0].codigo;
        console.log(`\n4. Detalle de lotes para el producto de ejemplo: ${sampleCode}`);
        const resDetail = await client.query(`
            SELECT l.id as lote_id, l.numero_lote, l.cantidad_disponible, 
                   ni.id as ingreso_id, ni.numero_documento, ni.cliente_ruc, c.razon_social as cliente_nombre
            FROM lotes l
            JOIN productos p ON l.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
            LEFT JOIN clientes c ON ni.cliente_ruc = c.cuit
            WHERE p.codigo = $1
        `, [sampleCode]);
        console.log(resDetail.rows);
    }

    await client.end();
}

main().catch(console.error);
