const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function findUsers() {
  try {
    await client.connect();
    const result = await client.query('SELECT id, nombre, usuario, email FROM usuarios;');
    console.log("Usuarios en BD:");
    console.table(result.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

findUsers();
