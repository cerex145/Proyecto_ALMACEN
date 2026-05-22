const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('✅ Conectado\n');

  // 1. ¿Hay productos con mismo codigo pero diferente lote (campo productos.lote)?
  console.log('=== 1. PRODUCTOS CON MISMO CODIGO PERO DIFERENTE LOTE (campo productos.lote) ===');
  const r1 = await client.query(`
    SELECT 
      p.codigo,
      COUNT(*) AS total_registros,
      STRING_AGG(CAST(p.id AS text), ', ') AS ids,
      STRING_AGG(COALESCE(p.lote, '(sin lote)'), ' | ') AS lotes_en_producto,
      STRING_AGG(p.descripcion, ' | ') AS descripciones
    FROM productos p
    GROUP BY p.codigo
    HAVING COUNT(*) > 1
    ORDER BY total_registros DESC
    LIMIT 30
  `);
  if (r1.rows.length === 0) {
    console.log('No hay productos con codigo duplicado.\n');
  } else {
    console.log('⚠️  PRODUCTOS CON MISMO CODIGO (podrían ser del mismo producto con diferente lote):');
    console.table(r1.rows);
  }

  // 2. Ver qué valores tiene productos.lote - ¿se usa?
  console.log('\n=== 2. MUESTRA DE CAMPO productos.lote ===');
  const r2 = await client.query(`
    SELECT id, codigo, descripcion, lote AS lote_en_producto
    FROM productos
    WHERE lote IS NOT NULL AND lote <> ''
    LIMIT 20
  `);
  if (r2.rows.length === 0) {
    console.log('El campo productos.lote está vacío en todos los registros.');
  } else {
    console.table(r2.rows);
  }

  // 3. El BUG REAL: en el importador, busca solo por codigo
  // Si hay dos productos con mismo codigo pero diferente lote (en tabla lotes),
  // findOneBy({ codigo }) devuelve el PRIMERO que encuentre (indeterminado)
  // Verificar: para los productos con mismo codigo, ¿tienen lotes diferentes en tabla lotes?
  console.log('\n=== 3. PRODUCTOS CON MISMO CODIGO — VER SUS LOTES EN TABLA lotes ===');
  const r3 = await client.query(`
    SELECT 
      p.codigo,
      p.id AS producto_id,
      p.descripcion,
      COALESCE(p.lote, '(vacío)') AS lote_campo_producto,
      l.numero_lote,
      l.cantidad_disponible,
      l.cantidad_ingresada
    FROM productos p
    JOIN lotes l ON l.producto_id = p.id
    WHERE p.codigo IN (
      SELECT codigo FROM productos GROUP BY codigo HAVING COUNT(*) > 1
    )
    ORDER BY p.codigo, p.id, l.numero_lote
    LIMIT 50
  `);
  if (r3.rows.length === 0) {
    console.log('Sin datos (no hay duplicados de codigo con lotes).\n');
  } else {
    console.table(r3.rows);
  }

  // 4. En las salidas importadas: ¿se usó el producto correcto?
  // Si hay codigo "X" en dos producto_ids distintos, y el detalle dice producto_id = el primero,
  // pero el lote corresponde al segundo => mezcla
  console.log('\n=== 4. DETALLES DE SALIDA DONDE EL LOTE_NUMERO EXISTE EN LA BD PERO PARA OTRO PRODUCTO ===');
  const r4 = await client.query(`
    SELECT 
      ns.numero_salida,
      p_det.codigo AS cod_en_detalle,
      nsd.producto_id AS pid_en_detalle,
      nsd.lote_numero,
      -- ¿Existe ese lote_numero para OTRO producto con el mismo codigo?
      p_lote.id AS otro_producto_id,
      p_lote.codigo AS mismo_codigo_otro_pid,
      l_otro.numero_lote AS lote_del_otro_producto,
      l_otro.cantidad_disponible
    FROM nota_salida_detalles nsd
    JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
    JOIN productos p_det ON p_det.id = nsd.producto_id
    -- Buscar si hay otro producto con mismo codigo que tenga ese lote_numero
    JOIN lotes l_otro ON l_otro.numero_lote = nsd.lote_numero AND l_otro.producto_id <> nsd.producto_id
    JOIN productos p_lote ON p_lote.id = l_otro.producto_id AND p_lote.codigo = p_det.codigo
    WHERE nsd.lote_numero IS NOT NULL AND nsd.lote_numero <> ''
    LIMIT 30
  `);
  if (r4.rows.length === 0) {
    console.log('Sin mezclas detectadas entre productos con mismo codigo pero diferente lote.\n');
  } else {
    console.log('🚨 MEZCLAS DETECTADAS:');
    console.table(r4.rows);
  }

  // 5. CASO INVERSO: detalles donde el lote_numero NO existe para ese producto_id
  // pero SÍ existe para otro producto con el mismo código
  console.log('\n=== 5. DETALLES DONDE lote_numero NO CORRESPONDE AL PRODUCTO DEL DETALLE ===');
  const r5 = await client.query(`
    SELECT 
      ns.numero_salida,
      p_det.codigo,
      nsd.producto_id AS pid_detalle,
      nsd.lote_numero,
      -- El lote NO existe para este producto:
      CASE WHEN l_correcto.id IS NULL THEN 'NO EXISTE para este producto_id' ELSE 'OK' END AS lote_verificacion,
      -- Pero SÍ existe para otro producto:
      p_otro.id AS pid_donde_si_existe,
      p_otro.descripcion AS descripcion_otro_producto
    FROM nota_salida_detalles nsd
    JOIN notas_salida ns ON ns.id = nsd.nota_salida_id
    JOIN productos p_det ON p_det.id = nsd.producto_id
    LEFT JOIN lotes l_correcto ON l_correcto.numero_lote = nsd.lote_numero AND l_correcto.producto_id = nsd.producto_id
    LEFT JOIN lotes l_otro ON l_otro.numero_lote = nsd.lote_numero AND l_otro.producto_id <> nsd.producto_id
    LEFT JOIN productos p_otro ON p_otro.id = l_otro.producto_id
    WHERE nsd.lote_numero IS NOT NULL 
      AND nsd.lote_numero <> ''
      AND l_correcto.id IS NULL   -- el lote NO existe para el producto del detalle
      AND l_otro.id IS NOT NULL   -- PERO sí existe para otro producto
    LIMIT 30
  `);
  if (r5.rows.length === 0) {
    console.log('Sin asignaciones de lote a producto incorrecto.\n');
  } else {
    console.log('🚨 LOTES ASIGNADOS AL PRODUCTO EQUIVOCADO:');
    console.table(r5.rows);
  }

  // 6. Verificar la lógica de búsqueda de producto en importación
  // (findOneBy({ codigo })) - mostrar cuántos casos hay donde findOneBy daría resultado ambiguo
  console.log('\n=== 6. AMBIGÜEDAD EN BUSQUEDA POR CODIGO SOLO ===');
  const r6 = await client.query(`
    SELECT 
      p.codigo,
      COUNT(DISTINCT p.id) AS num_productos_con_ese_codigo,
      COUNT(DISTINCT l.numero_lote) AS lotes_distintos_total,
      STRING_AGG(DISTINCT l.numero_lote, ', ') AS lotes
    FROM productos p
    LEFT JOIN lotes l ON l.producto_id = p.id
    GROUP BY p.codigo
    HAVING COUNT(DISTINCT p.id) > 1
    ORDER BY num_productos_con_ese_codigo DESC
    LIMIT 20
  `);
  if (r6.rows.length === 0) {
    console.log('No hay códigos de producto ambiguos (cada codigo es único).\n');
  } else {
    console.log('⚠️  CODIGOS AMBIGUOS (findOneBy(codigo) daría resultado aleatorio):');
    console.table(r6.rows);
  }

  // 7. ¿Cómo están los productos reales? muestra general
  console.log('\n=== 7. MUESTRA: primeros 15 productos con sus lotes ===');
  const r7 = await client.query(`
    SELECT p.id, p.codigo, p.descripcion, COALESCE(p.lote,'') AS lote_producto, 
           COUNT(l.id) AS num_lotes, 
           STRING_AGG(l.numero_lote || '(' || l.cantidad_disponible::text || ')', ', ') AS lotes_disponibles
    FROM productos p
    LEFT JOIN lotes l ON l.producto_id = p.id
    GROUP BY p.id, p.codigo, p.descripcion, p.lote
    ORDER BY p.codigo
    LIMIT 15
  `);
  console.table(r7.rows);

  await client.end();
  console.log('\n✅ Diagnóstico completado');
}

main().catch(e => {
  console.error('ERROR:', e.message, e.stack);
  process.exit(1);
});
