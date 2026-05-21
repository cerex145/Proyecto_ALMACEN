const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const ns = await client.query('SELECT * FROM notas_salida WHERE cliente_id = 2');
  console.log('Notas de Salida registradas para AFECORP (Cliente 2):');
  console.log(ns.rows);
  
  if (ns.rows.length > 0) {
    const ids = ns.rows.map(r => r.id).join(',');
    const nsd = await client.query(`
      SELECT d.*, p.codigo as prod_codigo 
      FROM nota_salida_detalles d
      JOIN productos p ON d.producto_id = p.id
      WHERE d.nota_salida_id IN (${ids})
    `);
    console.log('\nDetalles de las Notas de Salida:');
    console.log(`Total detalles: ${nsd.rows.length}`);
    nsd.rows.forEach(r => {
      console.log(`- Nota ID: ${r.nota_salida_id} | Prod: ${r.prod_codigo} | Lote: ${r.lote_numero} | Cantidad: ${r.cantidad}`);
    });
  }
  
  await client.end();
}

main().catch(err => console.error(err));
