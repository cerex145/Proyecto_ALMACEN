const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const res = await client.query("SELECT id, codigo, descripcion FROM productos WHERE descripcion ILIKE '%kinessence%' OR descripcion ILIKE '%kinstyle%'");
  console.log('Productos de Kinessences en la Base de Datos:');
  console.log(res.rows);
  
  await client.end();
}

main().catch(err => console.error(err));
