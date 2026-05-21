const { Client } = require('pg');

const DB = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Ver las salidas del cliente AFECORP (ID: 2)
  const r1 = await client.query(`SELECT id, numero_salida, estado FROM notas_salida WHERE cliente_id = 2`);
  console.log('Salidas de AFECORP encontradas:', r1.rows.length);
  r1.rows.forEach(r => console.log(` - ID: ${r.id}, Numero: ${r.numero_salida}, Estado: ${r.estado}`));

  if (r1.rows.length === 0) {
    console.log('No hay salidas para eliminar.');
    await client.end();
    return;
  }

  const salidaIds = r1.rows.map(r => r.id);

  // Primero eliminar los detalles de salida
  const r2 = await client.query(`DELETE FROM nota_salida_detalles WHERE nota_salida_id = ANY($1::int[])`, [salidaIds]);
  console.log(`Detalles de salida eliminados: ${r2.rowCount}`);

  // Eliminar movimientos de kardex asociados a las salidas
  const r3 = await client.query(`DELETE FROM kardex WHERE documento_tipo = 'NOTA_SALIDA' AND referencia_id = ANY($1::int[])`, [salidaIds]);
  console.log(`Movimientos de kardex (salida) eliminados: ${r3.rowCount}`);

  // Restaurar stock en lotes (revertir los descuentos)
  // Obtenemos los movimientos ya eliminados por lo que tenemos que reconstruir desde los detalles eliminados
  // En su lugar, recalculamos el stock de los lotes desde los ingresos
  // Primero obtenemos todos los lotes del cliente
  const r4 = await client.query(`
    UPDATE lotes l
    SET cantidad_disponible = l.cantidad_ingresada
    FROM productos p
    WHERE l.producto_id = p.id AND p.cliente_id = 2
  `);
  console.log(`Stock de lotes restaurado al valor original de ingreso: ${r4.rowCount} lotes`);

  // Ahora descontar solo las salidas activas restantes (no hay ninguna ya)
  // Eliminar las notas de salida
  const r5 = await client.query(`DELETE FROM notas_salida WHERE id = ANY($1::int[])`, [salidaIds]);
  console.log(`Notas de salida eliminadas: ${r5.rowCount}`);

  console.log('\n✅ Salidas de AFECORP eliminadas exitosamente. Stock restaurado al estado de ingreso.');
  await client.end();
}

main().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
