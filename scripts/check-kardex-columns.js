const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Defina DATABASE_URL antes de ejecutar este script.');

const { Client } = require('pg');
const DATABASE_URL = databaseUrl;

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

client.connect().then(async () => {
    // Obtener columnas de kardex
    const result = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'kardex' ORDER BY ordinal_position`);
    
    console.log('Columnas de kardex:');
    result.rows.forEach(row => console.log('  -', row.column_name));
    
    client.end();
});
