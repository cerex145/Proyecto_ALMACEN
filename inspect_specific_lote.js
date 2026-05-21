const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const res = await client.query('SELECT * FROM lotes WHERE producto_id = 5589');
  console.log('Lotes in DB for product 5589 (afe.pd2205027ve r-100):');
  console.log(res.rows);
  
  await client.end();
}

main().catch(err => console.error(err));
