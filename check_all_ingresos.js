const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('=== TODOS LOS INGRESOS DEL PRODUCTO 78 EN nota_ingreso_detalles ===');
  const res = await client.query(`
    SELECT * FROM nota_ingreso_detalles WHERE producto_id = 78
  `);
  console.log(res.rows);

  await client.end();
}

main().catch(err => console.error(err));
