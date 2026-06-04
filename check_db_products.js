const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Buscando productos en DB conteniendo RSC061125-HW45:');
  const res = await client.query(`
    SELECT id, codigo, descripcion
    FROM productos
    WHERE UPPER(codigo) LIKE '%RSC061125-HW45%'
  `);

  res.rows.forEach(r => {
    console.log(`   - ID: ${r.id}, Código: "${r.codigo}", Descripción: "${r.descripcion}"`);
  });

  console.log('\nBuscando stock de lotes en DB para estos productos:');
  const lotesRes = await client.query(`
    SELECT l.id, l.numero_lote, l.cantidad_disponible, p.codigo, ni.proveedor
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
    LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
    WHERE UPPER(p.codigo) LIKE '%RSC061125-HW45%'
  `);

  lotesRes.rows.forEach(l => {
    console.log(`   - Lote: "${l.numero_lote}", Stock: ${l.cantidad_disponible}, Producto en DB: "${l.codigo}" (Proveedor: ${l.proveedor})`);
  });

  await client.end();
}

main().catch(console.error);
