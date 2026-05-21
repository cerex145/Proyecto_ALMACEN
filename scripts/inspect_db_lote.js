const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  console.log('=== PRODUCTO Y LOTES EN LA DB ===');
  const res = await client.query(`
    SELECT l.id, l.numero_lote, l.cantidad_ingresada, l.cantidad_disponible, p.codigo, p.descripcion 
    FROM lotes l 
    JOIN productos p ON l.producto_id = p.id 
    WHERE l.numero_lote = 'SP1124052316'
  `);
  
  console.log('Lote SP1124052316:');
  console.log(res.rows);

  console.log('\n=== TODOS LOS LOTES CON DISCREPANCIA ===');
  const resAll = await client.query(`
    SELECT l.id, l.numero_lote, l.cantidad_ingresada, l.cantidad_disponible, p.codigo, p.descripcion 
    FROM lotes l 
    JOIN productos p ON l.producto_id = p.id
    ORDER BY p.codigo, l.numero_lote
  `);
  resAll.rows.forEach(r => {
    if (r.cantidad_ingresada !== r.cantidad_disponible) {
      console.log(`Lote ${r.numero_lote} | Prod=${r.descripcion} | Ing=${r.cantidad_ingresada} | Disp=${r.cantidad_disponible}`);
    }
  });

  await client.end();
}

main().catch(err => console.error(err));
