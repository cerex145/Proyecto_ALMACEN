const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function query() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    
    // Get all clients
    const res = await client.query('SELECT id, razon_social, codigo FROM clientes');
    console.log("CLIENTES:");
    console.table(res.rows);

    // Get count of productos and notas without these clients
    // A bit harder without knowing exactly what's inside. Let's just dump first.
    
    await client.end();
}

query();
