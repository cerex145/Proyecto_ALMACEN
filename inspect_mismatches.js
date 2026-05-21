const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('=== DETALLES EN DB PARA PRODUCTO 8426420086097 ===');
  const res1 = await client.query(`
    SELECT d.id, p.codigo, d.lote_numero, d.cantidad 
    FROM nota_salida_detalles d
    JOIN productos p ON p.id = d.producto_id
    WHERE d.nota_salida_id = 5 AND p.codigo = '8426420086097'
  `);
  console.log(res1.rows);

  console.log('\n=== DETALLES EN DB PARA PRODUCTO 8426420032247 ===');
  const res2 = await client.query(`
    SELECT d.id, p.codigo, d.lote_numero, d.cantidad 
    FROM nota_salida_detalles d
    JOIN productos p ON p.id = d.producto_id
    WHERE d.nota_salida_id = 5 AND p.codigo = '8426420032247'
  `);
  console.log(res2.rows);

  await client.end();
}

main().catch(err => console.error(err));
