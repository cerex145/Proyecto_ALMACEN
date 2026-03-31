/**
 * cleanup-products-afecorp.js — Borrar SOLO productos de AFECORP (con P)
 */

const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function cleanupProductsAfecorp() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN');
        console.log('🔄 Iniciando purga de PRODUCTOS de AFECORP...');

        // Identificar el ID real de AFECORP (con P)
        const resClientes = await client.query(`SELECT id FROM clientes WHERE LOWER(razon_social) LIKE '%afecorp%'`);
        const afecorpIds = resClientes.rows.map(r => r.id);
        const inClause = afecorpIds.length > 0 ? afecorpIds.join(',') : '-999999';
        
        // Buscar explícitamente solo los productos que les pertenecen (44)
        const resProds = await client.query(`
            SELECT id FROM productos 
            WHERE LOWER(proveedor) LIKE '%afecorp%' 
               OR cliente_id IN (${inClause})
               OR LOWER(cliente_ruc) LIKE '%afecorp%'
        `);
        
        const prodsIds = resProds.rows.map(r => r.id);
        
        if (prodsIds.length > 0) {
            const inIds = prodsIds.join(',');
            
            // Eliminar solo las dependencias directas de estos productos para no romper FK
            await client.query(`DELETE FROM alertas_vencimiento WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM ajustes_stock WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM lotes WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM kardex WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_ingreso_detalles WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM nota_salida_detalles WHERE producto_id IN (${inIds})`);
            await client.query(`DELETE FROM acta_recepcion_detalles WHERE producto_id IN (${inIds})`);
            
            // Finalmente, borrar los productos
            await client.query(`DELETE FROM productos WHERE id IN (${inIds})`);
            
            console.log(`✔️  ${prodsIds.length} Productos de AFECORP eliminados correctamente.`);
        } else {
            console.log('✅ No se encontraron productos asociados a Afecorp.');
        }

        await client.query('COMMIT');
        console.log('✅ OPERACIÓN COMPLETADA CON ÉXITO.');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error, revirtiendo cambios...', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

cleanupProductsAfecorp();
