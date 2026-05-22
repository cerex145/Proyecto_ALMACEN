const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('✅ Conectado a Supabase\n');

  // 1. Lotes con mismo numero_lote pero diferente producto_id (el bug principal)
  console.log('=== 1. LOTES CON MISMO NUMERO_LOTE PERO DIFERENTE PRODUCTO (BUG POTENCIAL) ===');
  const r1 = await client.query(`
    SELECT 
      l.numero_lote,
      COUNT(DISTINCT l.producto_id) AS productos_distintos,
      STRING_AGG(DISTINCT p.codigo, ', ') AS codigos_producto,
      STRING_AGG(DISTINCT p.descripcion, ' | ') AS descripciones,
      SUM(l.cantidad_disponible) AS stock_total
    FROM lotes l
    JOIN productos p ON p.id = l.producto_id
    GROUP BY l.numero_lote
    HAVING COUNT(DISTINCT l.producto_id) > 1
    ORDER BY productos_distintos DESC
    LIMIT 30
  `);
  if (r1.rows.length === 0) {
    console.log('Sin duplicados de numero_lote con diferente producto.\n');
  } else {
    console.table(r1.rows);
  }

  // 2. Verificar índices en la tabla lotes
  console.log('\n=== 2. INDICES EN TABLA LOTES ===');
  const r2 = await client.query(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'lotes'
    ORDER BY indexname
  `);
  console.table(r2.rows);

  // 3. Verificar detalles de salida que tienen lote_id pero lote_numero no coincide con el lote real
  console.log('\n=== 3. DETALLES DE SALIDA CON LOTE_ID INCONSISTENTE ===');
  const r3 = await client.query(`
    SELECT 
      nsd.id AS detalle_id,
      ns.numero_salida,
      p.codigo AS cod_producto,
      nsd.lote_id,
      nsd.lote_numero AS lote_numero_en_detalle,
      l.numero_lote AS lote_numero_real,
      l.producto_id AS lote_producto_id,
      nsd.producto_id AS detalle_producto_id
    FROM nota_salida_detalles nsd
    JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
    JOIN productos p ON p.id = nsd.producto_id
    LEFT JOIN lotes l ON l.id = nsd.lote_id
    WHERE nsd.lote_id IS NOT NULL
      AND (l.numero_lote <> nsd.lote_numero OR l.producto_id <> nsd.producto_id)
    LIMIT 30
  `);
  if (r3.rows.length === 0) {
    console.log('Sin inconsistencias de lote_id vs lote_numero.\n');
  } else {
    console.table(r3.rows);
  }

  // 4. Detalles de salida donde el lote_numero no existe en la tabla lotes para ese producto
  console.log('\n=== 4. DETALLES DE SALIDA CON LOTE_NUMERO QUE NO EXISTE PARA ESE PRODUCTO ===');
  const r4 = await client.query(`
    SELECT 
      nsd.id AS detalle_id,
      ns.numero_salida,
      p.codigo AS cod_producto,
      nsd.lote_numero,
      nsd.producto_id,
      COUNT(l.id) AS lotes_encontrados
    FROM nota_salida_detalles nsd
    JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
    JOIN productos p ON p.id = nsd.producto_id
    LEFT JOIN lotes l ON l.numero_lote = nsd.lote_numero AND l.producto_id = nsd.producto_id
    WHERE nsd.lote_numero IS NOT NULL AND nsd.lote_numero <> ''
    GROUP BY nsd.id, ns.numero_salida, p.codigo, nsd.lote_numero, nsd.producto_id
    HAVING COUNT(l.id) = 0
    LIMIT 30
  `);
  if (r4.rows.length === 0) {
    console.log('Sin lote_numero huerfanos.\n');
  } else {
    console.table(r4.rows);
  }

  // 5. Buscar en detalles de salida donde el lote_numero existe para OTRO producto (mezcla)
  console.log('\n=== 5. LOTE_NUMERO QUE EXISTE PARA UN PRODUCTO DISTINTO (MEZCLA REAL) ===');
  const r5 = await client.query(`
    SELECT 
      nsd.id AS detalle_id,
      ns.numero_salida,
      p_det.codigo AS cod_producto_detalle,
      nsd.lote_numero,
      p_lote.codigo AS cod_producto_del_lote,
      l.id AS lote_id_encontrado,
      l.cantidad_disponible
    FROM nota_salida_detalles nsd
    JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
    JOIN productos p_det ON p_det.id = nsd.producto_id
    -- El lote existe pero para OTRO producto
    JOIN lotes l ON l.numero_lote = nsd.lote_numero AND l.producto_id <> nsd.producto_id
    JOIN productos p_lote ON p_lote.id = l.producto_id
    -- Y NO existe para el producto correcto
    LEFT JOIN lotes l_correcto ON l_correcto.numero_lote = nsd.lote_numero AND l_correcto.producto_id = nsd.producto_id
    WHERE nsd.lote_numero IS NOT NULL 
      AND nsd.lote_numero <> ''
      AND l_correcto.id IS NULL
    LIMIT 30
  `);
  if (r5.rows.length === 0) {
    console.log('Sin mezcla de lote entre productos distintos.\n');
  } else {
    console.log('⚠️  ENCONTRADO - Mezcla de lote entre productos:');
    console.table(r5.rows);
  }

  // 6. Verificar en la búsqueda de productos por codigo - si hay productos con mismo código
  console.log('\n=== 6. PRODUCTOS CON MISMO CODIGO (DUPLICADOS) ===');
  const r6 = await client.query(`
    SELECT codigo, COUNT(*) AS veces, STRING_AGG(CAST(id AS text), ', ') AS ids, 
           STRING_AGG(descripcion, ' | ') AS descripciones
    FROM productos
    GROUP BY codigo
    HAVING COUNT(*) > 1
    ORDER BY veces DESC
    LIMIT 20
  `);
  if (r6.rows.length === 0) {
    console.log('Sin códigos duplicados en productos.\n');
  } else {
    console.log('⚠️  PRODUCTOS CON CODIGO DUPLICADO:');
    console.table(r6.rows);
  }

  // 7. Verificar constraint en productos.codigo
  console.log('\n=== 7. INDICES EN TABLA PRODUCTOS ===');
  const r7 = await client.query(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'productos'
    ORDER BY indexname
  `);
  console.table(r7.rows);

  // 8. Muestra de lotes actuales para verificar integridad
  console.log('\n=== 8. RESUMEN: Total lotes por producto (top 10 con más lotes) ===');
  const r8 = await client.query(`
    SELECT p.codigo, p.descripcion, COUNT(l.id) AS num_lotes, 
           SUM(l.cantidad_disponible) AS stock_total
    FROM lotes l
    JOIN productos p ON p.id = l.producto_id
    GROUP BY p.id, p.codigo, p.descripcion
    ORDER BY num_lotes DESC
    LIMIT 10
  `);
  console.table(r8.rows);

  await client.end();
  console.log('\n✅ Diagnóstico completado');
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
