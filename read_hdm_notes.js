const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Buscando clientes que coincidan con HDM o ruc 20605390332...');
  const clientsRes = await client.query(`
    SELECT id, razon_social, cuit FROM clientes WHERE cuit = '20605390332' OR razon_social ILIKE '%hdm%'
  `);
  console.log('Clientes encontrados:', clientsRes.rows);

  if (clientsRes.rows.length === 0) {
    console.log('No se encontró el cliente HDM.');
    await client.end();
    return;
  }

  const clientIds = clientsRes.rows.map(r => r.id).join(',');

  console.log('\nBuscando notas de salida para estos clientes...');
  const notasRes = await client.query(`
    SELECT id, numero_salida, fecha, cliente_id, estado, observaciones, 
           (SELECT SUM(cantidad) FROM nota_salida_detalles WHERE nota_salida_id = notas_salida.id) as sum_detalles
    FROM notas_salida 
    WHERE cliente_id IN (${clientIds})
  `);
  console.log('Notas de salida encontradas:');
  console.log(notasRes.rows);

  await client.end();
}

main().catch(err => console.error(err));
