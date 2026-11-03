const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Defina DATABASE_URL antes de ejecutar este script.');

const { Client } = require('pg');

const client = new Client({
  connectionString: databaseUrl,
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
