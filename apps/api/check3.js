const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(async () => {
  // Ver el campo lote en productos
  const r3 = await client.query(
    "SELECT id, codigo, lote, descripcion FROM productos WHERE lote IS NOT NULL AND lote <> '' ORDER BY codigo LIMIT 30"
  );
  console.log('\nPRODUCTOS CON CAMPO lote LLENO:');
  r3.rows.forEach(row => console.log(JSON.stringify(row)));

  // Lotes con mismo numero en distintos productos  
  const r2 = await client.query(
    "SELECT l.numero_lote, STRING_AGG(DISTINCT p.codigo, ', ') as codigos, STRING_AGG(DISTINCT CAST(l.producto_id AS text), ', ') as producto_ids FROM lotes l JOIN productos p ON p.id = l.producto_id GROUP BY l.numero_lote HAVING COUNT(DISTINCT l.producto_id) > 1 LIMIT 20"
  );
  console.log('\nLOTES CON MISMO NUMERO EN DISTINTOS PRODUCTOS:');
  r2.rows.forEach(row => console.log(JSON.stringify(row)));

  // Productos con mismo codigo
  const r1 = await client.query(
    "SELECT p.codigo, COUNT(*) AS total, STRING_AGG(CAST(p.id AS text), ', ') AS ids, STRING_AGG(COALESCE(p.lote,'(sin lote)'), ' | ') AS lotes_campo_producto FROM productos p GROUP BY p.codigo HAVING COUNT(*) > 1 ORDER BY total DESC LIMIT 30"
  );
  console.log('\nPRODUCTOS CON MISMO CODIGO:');
  if (r1.rows.length === 0) console.log('Ningun producto con codigo duplicado');
  r1.rows.forEach(row => console.log(JSON.stringify(row)));

  await client.end();
}).catch(e => console.error(e.message, e.stack));
