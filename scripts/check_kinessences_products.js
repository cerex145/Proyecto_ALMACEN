const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
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
