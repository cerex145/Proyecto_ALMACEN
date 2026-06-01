const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  const codes = ['NVT23030', 'TSCMG-35-260-LESDC', 'RSC061125-HW45', 'RS*R60N10MQ', 'AHW14R001S'];
  for (const code of codes) {
    console.log(`\n=== Buscando producto: ${code} ===`);
    const prodRes = await client.query('SELECT * FROM productos WHERE UPPER(codigo) = UPPER($1)', [code]);
    if (prodRes.rows.length === 0) {
      console.log(`No se encontró el producto ${code} en DB.`);
      continue;
    }
    const p = prodRes.rows[0];
    console.log(`Producto ID: ${p.id}, Código: ${p.codigo}, Descripción: ${p.descripcion}`);
    
    const lotesRes = await client.query(`
      SELECT l.id, l.numero_lote, l.cantidad_disponible, ni.id as ingreso_id, ni.cliente_ruc, ni.proveedor
      FROM lotes l
      LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
      WHERE l.producto_id = $1
    `, [p.id]);
    
    console.log(`Lotes encontrados (${lotesRes.rows.length}):`);
    lotesRes.rows.forEach(l => {
      console.log(`  - Lote: ${l.numero_lote}, Stock: ${l.cantidad_disponible}, RUC Cliente: ${l.cliente_ruc}, Proveedor/Cliente: ${l.proveedor} (Ingreso ID: ${l.ingreso_id})`);
    });
  }

  await client.end();
}

main().catch(console.error);
