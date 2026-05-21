const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const clientRes = await client.query(`
    SELECT id, razon_social, cuit FROM clientes WHERE cuit = '20600124871' OR razon_social ILIKE '%afecor%'
  `);
  
  console.log('Clientes:');
  console.log(clientRes.rows);
  
  if (clientRes.rows.length > 0) {
    const ids = clientRes.rows.map(r => r.id).join(',');
    const salidas = await client.query(`
      SELECT id, numero_salida, fecha, cliente_id, estado FROM notas_salida WHERE cliente_id IN (${ids})
    `);
    console.log('\nNotas de Salida de AFECORP:');
    console.log(salidas.rows);
  }
  
  await client.end();
}

main().catch(err => console.error(err));
