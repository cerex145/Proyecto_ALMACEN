const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Defina DATABASE_URL antes de ejecutar este script.');

const { Client } = require('pg');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    // Check products with Kinessences in name
    const res = await client.query(`
      SELECT *
      FROM productos
      WHERE UPPER(descripcion) LIKE '%KINES%'
    `);
    console.log('--- PRODUCTOS DE KINESSENCES EN BD ---');
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
