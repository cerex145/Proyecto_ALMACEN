const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

client.connect().then(async () => {
    // Obtener columnas de kardex
    const result = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'kardex' ORDER BY ordinal_position`);
    
    console.log('Columnas de kardex:');
    result.rows.forEach(row => console.log('  -', row.column_name));
    
    client.end();
});
