const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
c.connect().then(async () => {
  const r = await c.query(`
    DELETE FROM clientes 
    WHERE codigo = '12345' 
       OR codigo = '1234567890'
       OR razon_social ILIKE '%Arnold%ALVA%'
       OR razon_social ILIKE '%HOla%'
    RETURNING codigo, razon_social
  `);
  if (r.rowCount > 0) {
    r.rows.forEach(cl => console.log(`✅ Eliminado: [${cl.codigo}] ${cl.razon_social}`));
  } else {
    console.log('⚠️ No se encontraron los clientes');
  }
  const restantes = await c.query('SELECT COUNT(*) FROM clientes');
  console.log(`\n👥 Clientes restantes: ${restantes.rows[0].count}`);
  await c.end();
}).catch(e => { console.error('❌', e.message); c.end(); });
