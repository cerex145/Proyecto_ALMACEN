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
    JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
    WHERE ni.cliente_id = 2
    ORDER BY p.codigo, l.numero_lote
  `);
  
  console.log('Lotes de AFECORP (Cliente 2) en la Base de Datos:');
  console.log(`Total lotes encontrados: ${res.rows.length}`);
  
  let discrepantes = 0;
  res.rows.forEach(r => {
    const ingresada = Number(r.cantidad_ingresada);
    const disponible = Number(r.cantidad_disponible);
    if (ingresada !== disponible) {
      discrepantes++;
      console.log(`- Código: ${r.codigo} | Lote: ${r.numero_lote} | Ingresada: ${ingresada} | Disponible: ${disponible} (DIFERENCIA: ${ingresada - disponible})`);
    }
  });
  
  console.log(`Total de lotes con stock discrepante (ingresado != disponible): ${discrepantes}`);
  
  // Vamos a ver si hay alguna nota de salida registrada
  const salidas = await client.query('SELECT COUNT(*) FROM notas_salida WHERE cliente_id = 2');
  console.log(`Notas de salida activas para AFECORP: ${salidas.rows[0].count}`);
  
  await client.end();
}

main().catch(err => console.error(err));
