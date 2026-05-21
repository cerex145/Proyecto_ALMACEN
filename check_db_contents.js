const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  // Count records
  const tables = ['notas_ingreso', 'nota_ingreso_detalles', 'lotes', 'productos', 'clientes'];
  for (const t of tables) {
    const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
    console.log(`Table ${t}: ${r.rows[0].count} records`);
  }

  // Get recent details if any
  const details = await client.query(`
    SELECT d.*, p.codigo as prod_codigo, p.descripcion as prod_desc
    FROM nota_ingreso_detalles d
    JOIN productos p ON d.producto_id = p.id
    LIMIT 10
  `);
  console.log('\nSample details in DB:');
  console.log(details.rows);

  await client.end();
}

main().catch(err => console.error(err));
