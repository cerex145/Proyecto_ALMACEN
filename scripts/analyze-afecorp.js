const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Defina DATABASE_URL antes de ejecutar este script.');

const { Client } = require('pg');

const DATABASE_URL = databaseUrl;

async function analyzeAfecorp() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const resClientes = await client.query(`SELECT id, razon_social FROM clientes WHERE LOWER(razon_social) LIKE '%afecorp%'`);
        const afecorpIds = resClientes.rows.map(r => r.id);
        const inClause = afecorpIds.length > 0 ? afecorpIds.join(',') : '-999999';
        
        const qProd = `SELECT COUNT(*) FROM productos WHERE LOWER(proveedor) LIKE '%afecorp%' OR cliente_id IN (${inClause})`;
        const countProd = await client.query(qProd);
        
        console.log(`=== ANALISIS REAL DE AFECORP (CON P) ===`);
        console.log(`¿Clientes encontrados con AFECORP?:`, resClientes.rows);
        console.log(`Productos realmente de AFECORP: ${countProd.rows[0].count}`);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}
analyzeAfecorp();
