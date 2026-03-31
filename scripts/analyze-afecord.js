const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function analyze() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const resClientes = await client.query(`
            SELECT id FROM clientes 
            WHERE LOWER(razon_social) LIKE '%afecord%' 
        `);
        const afecordIds = resClientes.rows.map(r => r.id);
        const inClause = afecordIds.length > 0 ? afecordIds.join(',') : '-1';
        
        const resProv = await client.query(`SELECT COUNT(*) FROM productos WHERE COALESCE(LOWER(proveedor), '') LIKE '%afecord%'`);
        const resCli = await client.query(`SELECT COUNT(*) FROM productos WHERE COALESCE(cliente_id, -1) IN (${inClause}) OR COALESCE(LOWER(cliente_ruc), '') LIKE '%afecord%'`);
        const resTotal = await client.query(`SELECT COUNT(*) FROM productos`);
        
        console.log(`=== ANALISIS PÚBLICO DE PRODUCTOS ===`);
        console.log(`📊 Productos Totales en Almacén: ${resTotal.rows[0].count}`);
        console.log(`🏢 Productos etiquetados con PROVEEDOR = 'afecord': ${resProv.rows[0].count}`);
        console.log(`👤 Productos etiquetados con CLIENTE (Dueño) = 'afecord': ${resCli.rows[0].count}`);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

analyze();
