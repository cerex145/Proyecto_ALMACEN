const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const searchLotes = ['25A574', '25A567', '24A361', '25A552', '25A572', '25A763'];
  console.log('Buscando lotes en la BASE DE DATOS (Supabase):');

  for (const lote of searchLotes) {
    const res = await client.query(`
      SELECT l.id, l.numero_lote, l.cantidad_disponible, p.codigo, p.descripcion, ni.cliente_ruc, ni.proveedor
      FROM lotes l
      JOIN productos p ON l.producto_id = p.id
      LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
      WHERE UPPER(l.numero_lote) = UPPER($1)
    `, [lote]);

    if (res.rows.length === 0) {
      console.log(`Lote "${lote}": ❌ No existe en absoluto en la Base de Datos.`);
    } else {
      console.log(`Lote "${lote}": ✅ ENCONTRADO en BD (${res.rows.length} registros):`);
      res.rows.forEach(r => {
        console.log(`   - ID: ${r.id}, Stock: ${r.cantidad_disponible}, Producto: ${r.codigo} - ${r.descripcion}`);
        console.log(`     Cliente RUC en DB: ${r.cliente_ruc}, Proveedor: ${r.proveedor}`);
      });
    }
  }

  await client.end();
}

main().catch(console.error);
