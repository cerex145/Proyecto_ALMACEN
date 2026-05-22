const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('✅ Conectado\n');

  // Detalle de los 3 lotes problemáticos
  console.log('=== DETALLE DE LOTES CON NUMERO_LOTE COMPARTIDO ENTRE PRODUCTOS ===');
  const r1 = await client.query(`
    SELECT 
      l.id AS lote_id,
      l.numero_lote,
      l.producto_id,
      p.codigo AS cod_producto,
      p.descripcion,
      l.cantidad_disponible,
      l.cantidad_ingresada,
      l.fecha_vencimiento
    FROM lotes l
    JOIN productos p ON p.id = l.producto_id
    WHERE l.numero_lote IN ('202510', 'SM04', 'VM03/38')
    ORDER BY l.numero_lote, l.producto_id
  `);
  console.table(r1.rows);

  // Ver si el kardex tiene mezclas para estos lotes
  console.log('\n=== KARDEX DE ESOS LOTES ===');
  const r2 = await client.query(`
    SELECT 
      k.id,
      k.lote_numero,
      k.producto_id,
      p.codigo AS cod_producto,
      k.tipo_movimiento,
      k.cantidad,
      k.saldo,
      k.documento_numero,
      k.referencia_id
    FROM kardex k
    JOIN productos p ON p.id = k.producto_id
    WHERE k.lote_numero IN ('202510', 'SM04', 'VM03/38')
    ORDER BY k.lote_numero, k.producto_id, k.id
    LIMIT 50
  `);
  console.table(r2.rows);

  // Ver el fallback del kardex_fallback en el historial (el problema de mezcla)
  // La query del historial hace: GROUP BY referencia_id, producto_id -> MIN(lote_numero)
  // Esto puede devolver el lote de OTRO producto si hay lotes cruzados en kardex
  console.log('\n=== VERIFICAR KARDEX_FALLBACK: Notas que usan fallback y podrían cruzar lotes ===');
  const r3 = await client.query(`
    SELECT 
      ns.numero_salida,
      k.referencia_id AS nota_id,
      k.producto_id,
      p.codigo AS cod_producto,
      MIN(NULLIF(k.lote_numero, '')) AS lote_fallback,
      COUNT(*) AS movimientos
    FROM kardex k
    JOIN notas_salida ns ON ns.id = k.referencia_id
    JOIN productos p ON p.id = k.producto_id
    WHERE k.tipo_movimiento = 'SALIDA'
      AND k.lote_numero IS NOT NULL
      AND k.lote_numero <> ''
    GROUP BY ns.numero_salida, k.referencia_id, k.producto_id, p.codigo
    -- Verificar si el lote_fallback existe en otro producto
    HAVING MIN(NULLIF(k.lote_numero, '')) IN (
      SELECT numero_lote FROM lotes l2 
      WHERE l2.producto_id <> k.producto_id
    )
    LIMIT 20
  `);
  if (r3.rows.length === 0) {
    console.log('Sin cruces en kardex_fallback.');
  } else {
    console.log('⚠️  CRUCES DETECTADOS:');
    console.table(r3.rows);
  }

  // Verificar constraint UNIQUE en lotes - debería ser (producto_id, numero_lote)
  console.log('\n=== CONSTRAINTS EN TABLA LOTES ===');
  const r4 = await client.query(`
    SELECT conname, pg_get_constraintdef(oid) AS constraint_def
    FROM pg_constraint
    WHERE conrelid = 'lotes'::regclass
  `);
  console.table(r4.rows);

  // Ver cuantas salidas usan detalles sin lote_id (dependencia del fallback)
  console.log('\n=== DETALLES DE SALIDA SIN LOTE_ID (dependen de lote_numero texto) ===');
  const r5 = await client.query(`
    SELECT 
      COUNT(*) FILTER (WHERE lote_id IS NULL AND lote_numero IS NOT NULL AND lote_numero <> '') AS sin_lote_id_con_numero,
      COUNT(*) FILTER (WHERE lote_id IS NOT NULL) AS con_lote_id,
      COUNT(*) FILTER (WHERE lote_numero IS NULL OR lote_numero = '') AS sin_lote_en_absoluto,
      COUNT(*) AS total
    FROM nota_salida_detalles
  `);
  console.table(r5.rows);

  // Muestra de 10 salidas recientes con sus detalles para ver estructura
  console.log('\n=== 10 SALIDAS RECIENTES CON DETALLE ===');
  const r6 = await client.query(`
    SELECT 
      ns.numero_salida,
      ns.fecha,
      p.codigo AS cod_producto,
      nsd.lote_id,
      nsd.lote_numero,
      l.numero_lote AS lote_numero_real,
      l.producto_id AS lote_producto_id,
      nsd.cantidad,
      nsd.fecha_vencimiento
    FROM nota_salida_detalles nsd
    JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
    JOIN productos p ON p.id = nsd.producto_id
    LEFT JOIN lotes l ON l.id = nsd.lote_id
    ORDER BY ns.id DESC, nsd.id ASC
    LIMIT 20
  `);
  console.table(r6.rows);

  await client.end();
  console.log('\n✅ Análisis completado');
}

main().catch(e => {
  console.error('ERROR:', e.message, e.stack);
  process.exit(1);
});
