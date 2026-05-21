const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const res = await client.query(`
    SELECT l.id, p.codigo, p.descripcion, l.numero_lote, l.cantidad_ingresada, l.cantidad_disponible 
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
    ORDER BY p.codigo, l.numero_lote
  `);
  
  console.log('Stock de Lotes en Base de Datos:');
  console.log(`Total de lotes en DB: ${res.rows.length}`);
  
  let totalDisponible = 0;
  res.rows.forEach(r => {
    totalDisponible += Number(r.cantidad_disponible);
    if (Number(r.cantidad_disponible) > 0) {
      console.log(`- Código: ${r.codigo} | Lote: ${r.numero_lote} | Desc: ${r.descripcion.substring(0, 40)} | Ingresado: ${r.cantidad_ingresada} | Disponible: ${r.cantidad_disponible}`);
    }
  });
  
  console.log(`\nSuma total disponible en todos los lotes: ${totalDisponible}`);
  
  await client.end();
}

main().catch(err => console.error(err));
