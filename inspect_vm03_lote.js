const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const res = await client.query(`
    SELECT l.id, l.numero_lote, l.cantidad_disponible, ni.cliente_id, c.razon_social, ni.id as nota_ingreso_id, p.codigo, p.descripcion
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
    JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
    JOIN clientes c ON ni.cliente_id = c.id
    WHERE l.numero_lote = 'VM03' OR l.numero_lote = 'VM03/38'
  `);
  
  console.log('Información detallada de los lotes VM03 y VM03/38:');
  console.log(res.rows);
  
  await client.end();
}

main().catch(err => console.error(err));
