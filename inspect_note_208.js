const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const r = await client.query('SELECT * FROM notas_ingreso WHERE id = 208');
  console.log('Nota 208 details:');
  console.log(r.rows);
  await client.end();
}

main().catch(err => console.error(err));
