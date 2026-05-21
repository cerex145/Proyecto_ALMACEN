const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('=== INFORMACIÓN DEL PRODUCTO 8426420032247 ===');
  const prodRes = await client.query(`
    SELECT id, codigo, descripcion 
    FROM productos 
    WHERE codigo = '8426420032247'
  `);
  console.log(prodRes.rows);

  if (prodRes.rows.length > 0) {
    const productId = prodRes.rows[0].id;

    console.log('\n=== LOTES DEL PRODUCTO EN LA TABLA lotes ===');
    const lotesRes = await client.query(`
      SELECT id, numero_lote, cantidad_ingresada, cantidad_disponible, nota_ingreso_id 
      FROM lotes 
      WHERE producto_id = $1
    `, [productId]);
    console.log(lotesRes.rows);

    console.log('\n=== INGRESOS EN LA DB (HISTORIAL) PARA ESTE PRODUCTO ===');
    const ingresosRes = await client.query(`
      SELECT nid.nota_ingreso_id, ni.numero_ingreso, nid.lote, nid.cantidad, ni.fecha
      FROM nota_ingreso_detalles nid
      JOIN notas_ingreso ni ON ni.id = nid.nota_ingreso_id
      WHERE nid.producto_id = $1
    `, [productId]);
    console.log(ingresosRes.rows);

    console.log('\n=== OTRAS SALIDAS QUE CONSUMIERON ESTE PRODUCTO Y LOTE ===');
    const salidasRes = await client.query(`
      SELECT nsd.nota_salida_id, ns.numero_salida, nsd.lote_numero, nsd.cantidad, ns.fecha
      FROM nota_salida_detalles nsd
      JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
      WHERE nsd.producto_id = $1
    `, [productId]);
    console.log(salidasRes.rows);
  }

  await client.end();
}

main().catch(err => console.error(err));
