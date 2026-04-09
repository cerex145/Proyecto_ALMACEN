const ds = require('../apps/api/src/config/database');

(async () => {
  await ds.initialize();

  const q1 = `
    SELECT
      COUNT(*)::int AS total_detalles,
      SUM(CASE WHEN COALESCE(TRIM(p.descripcion), '') = '' THEN 1 ELSE 0 END)::int AS sin_descripcion,
      SUM(CASE WHEN p.descripcion = p.codigo THEN 1 ELSE 0 END)::int AS descripcion_igual_codigo,
      SUM(CASE WHEN d.fecha_vencimiento IS NULL THEN 1 ELSE 0 END)::int AS sin_vencimiento_detalle,
      SUM(CASE WHEN COALESCE(TRIM(d.um), '') = '' THEN 1 ELSE 0 END)::int AS sin_um_detalle,
      SUM(CASE WHEN COALESCE(d.cantidad_total, d.cantidad, 0) = 0 THEN 1 ELSE 0 END)::int AS sin_cantidad
    FROM nota_ingreso_detalles d
    LEFT JOIN productos p ON p.id = d.producto_id;
  `;

  const q2 = `
    SELECT codigo, COUNT(*)::int AS repeticiones
    FROM productos
    GROUP BY codigo
    HAVING COUNT(*) > 1
    ORDER BY repeticiones DESC, codigo
    LIMIT 30;
  `;

  const q3 = `
    SELECT
      d.id,
      d.producto_id,
      p.codigo,
      p.descripcion,
      d.lote_numero,
      d.fecha_vencimiento,
      d.um,
      d.fabricante,
      d.cantidad,
      d.cantidad_total
    FROM nota_ingreso_detalles d
    LEFT JOIN productos p ON p.id = d.producto_id
    WHERE d.fecha_vencimiento IS NULL
       OR COALESCE(TRIM(d.um), '') = ''
       OR COALESCE(d.cantidad_total, d.cantidad, 0) = 0
       OR p.descripcion = p.codigo
    ORDER BY d.id DESC
    LIMIT 40;
  `;

  const [m] = await ds.query(q1);
  const dups = await ds.query(q2);
  const sample = await ds.query(q3);

  console.log('=== METRICAS ===');
  console.log(JSON.stringify(m, null, 2));
  console.log('\n=== CODIGOS DUPLICADOS (TOP 30) ===');
  console.log(JSON.stringify(dups, null, 2));
  console.log('\n=== MUESTRA PROBLEMAS (40) ===');
  console.log(JSON.stringify(sample, null, 2));

  await ds.destroy();
})().catch(async (e) => {
  console.error(e);
  try { await ds.destroy(); } catch (_) {}
  process.exit(1);
});
