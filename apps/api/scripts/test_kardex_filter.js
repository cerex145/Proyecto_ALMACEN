const { Client } = require('pg');
require('dotenv').config({ path: 'apps/api/.env' });

async function check() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'almacen_db'
    });

    try {
        await client.connect();
        
        // Let's test the kardex fetch manually to see what it would return for 'miret'
        const res = await client.query(`
            SELECT 
                k.id, k.producto_id, k.tipo_movimiento,
                p.descripcion, ni.proveedor, c.razon_social as cliente
            FROM kardex k
            LEFT JOIN productos p ON k.producto_id = p.id
            LEFT JOIN notas_ingreso ni ON k.documento_tipo IN ('NOTA_INGRESO', 'Factura', 'Boleta de Venta', 'Guía de Remisión Remitente') AND k.referencia_id = ni.id AND k.tipo_movimiento IN ('INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION')
            LEFT JOIN notas_salida ns ON k.documento_tipo = 'NOTA_SALIDA' AND k.referencia_id = ns.id AND k.tipo_movimiento IN ('SALIDA', 'AJUSTE_NEGATIVO')
            LEFT JOIN clientes c ON ns.cliente_id = c.id
            WHERE ni.proveedor ILIKE '%miret%' OR c.razon_social ILIKE '%miret%'
               OR EXISTS (
                    SELECT 1 FROM lotes l__cf
                    JOIN notas_ingreso ni__cf ON l__cf.nota_ingreso_id = ni__cf.id
                    WHERE l__cf.producto_id = k.producto_id
                    AND ni__cf.proveedor ILIKE '%miret%'
               )
            LIMIT 10;
        `);
        console.log("With EXISTS:", res.rows);
        
        const res2 = await client.query(`
            SELECT COUNT(*) FROM kardex k
            WHERE EXISTS (
                    SELECT 1 FROM lotes l__cf
                    JOIN notas_ingreso ni__cf ON l__cf.nota_ingreso_id = ni__cf.id
                    WHERE l__cf.producto_id = k.producto_id
                    AND ni__cf.proveedor ILIKE '%miret%'
               )
        `);
        console.log("Total matched by EXISTS:", res2.rows[0].count);

    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
