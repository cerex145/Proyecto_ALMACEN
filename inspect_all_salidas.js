const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const res = await client.query(`
    SELECT ns.id, ns.numero_salida, ns.fecha, ns.cliente_id, ns.estado, c.razon_social 
    FROM notas_salida ns
    JOIN clientes c ON ns.cliente_id = c.id
  `);
  console.log('Todas las Notas de Salida en la DB:');
  console.log(res.rows);
  
  await client.end();
}

main().catch(err => console.error(err));
