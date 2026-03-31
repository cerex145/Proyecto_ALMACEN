const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function analyze() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const resClientes = await client.query(`SELECT id FROM clientes WHERE LOWER(razon_social) LIKE '%afecord%'`);
        const afecordIds = resClientes.rows.map(r => r.id);
        const inClause = afecordIds.length > 0 ? afecordIds.join(',') : '-999999';
        
        const qProd = `SELECT COUNT(*) FROM productos WHERE LOWER(proveedor) LIKE '%afecord%' OR cliente_id IN (${inClause})`;
        const countProd = await client.query(qProd);
        
        const qIngresos = `SELECT COUNT(*) FROM notas_ingreso WHERE LOWER(proveedor) LIKE '%afecord%' OR cliente_id IN (${inClause})`;
        const countIng = await client.query(qIngresos);
        
        const qSalidas = `SELECT COUNT(*) FROM notas_salida WHERE cliente_id IN (${inClause})`;
        const countSal = await client.query(qSalidas);
        
        console.log(`=== ANALISIS REAL DE AFECORD ===`);
        console.log(`Productos realmente de AFECORD: ${countProd.rows[0].count}`);
        console.log(`Notas de Ingreso de AFECORD: ${countIng.rows[0].count}`);
        console.log(`Notas de Salida a AFECORD: ${countSal.rows[0].count}`);
        console.log(`Cliente AFECORD encontrado en BD: ${afecordIds.length > 0 ? 'SÍ' : 'NO'}`);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}
analyze();
