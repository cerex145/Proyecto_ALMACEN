const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Defina DATABASE_URL antes de ejecutar este script.');

const { Client } = require('pg');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, codigo, cuit, razon_social FROM clientes');
  console.log(res.rows);
  await client.end();
}

main();
