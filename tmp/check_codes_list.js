const ds = require('../apps/api/src/config/database');

const codes = [
  '1011834HJ','11510002','11510005','26402804','300200350','41275150','41300150','41350150','41400150',
  'SFD5480HCS','SFD5480HTS','SF5040TC','SF5050TC','SF5060TC','50200150','50225150','53610002','53610009',
  '7521-13','7523-13','97888EINTD','OB1110T','BNMA/CB-1-3.0(1G )/150','OB0810T','OB1310T'
];

(async () => {
  await ds.initialize();

  const q = `
    WITH p AS (
      SELECT id, codigo, descripcion, fabricante, um, unidad_medida
      FROM productos
      WHERE codigo = ANY($1)
    ),
    d AS (
      SELECT d.id, d.producto_id, d.lote_numero, d.fecha_vencimiento, d.um AS d_um, d.fabricante AS d_fabricante,
             d.cantidad_total, d.cantidad,
             p.codigo, p.descripcion
      FROM nota_ingreso_detalles d
      JOIN p ON p.id = d.producto_id
    )
    SELECT
      codigo,
      COUNT(DISTINCT producto_id)::int AS productos_con_ese_codigo,
      SUM(CASE WHEN COALESCE(TRIM(descripcion),'') = '' OR UPPER(TRIM(descripcion)) = UPPER(TRIM(codigo)) THEN 1 ELSE 0 END)::int AS filas_desc_igual_codigo,
      SUM(CASE WHEN fecha_vencimiento IS NULL THEN 1 ELSE 0 END)::int AS filas_sin_vencimiento,
      SUM(CASE WHEN COALESCE(TRIM(d_fabricante),'') = '' THEN 1 ELSE 0 END)::int AS filas_sin_fabricante_detalle,
      SUM(CASE WHEN COALESCE(TRIM(d_um),'') = '' THEN 1 ELSE 0 END)::int AS filas_sin_um_detalle,
      SUM(CASE WHEN COALESCE(cantidad_total,cantidad,0)=0 THEN 1 ELSE 0 END)::int AS filas_sin_cantidad
    FROM d
    GROUP BY codigo
    ORDER BY codigo;
  `;

  const q2 = `
    SELECT codigo, descripcion, fabricante, um, unidad_medida, id
    FROM productos
    WHERE codigo = ANY($1)
    ORDER BY codigo, id DESC
    LIMIT 200;
  `;

  const resumen = await ds.query(q, [codes]);
  const maestros = await ds.query(q2, [codes]);

  console.log('=== RESUMEN POR CODIGO ===');
  console.log(JSON.stringify(resumen, null, 2));
  console.log('\n=== MAESTRO PRODUCTOS (lista codigos) ===');
  console.log(JSON.stringify(maestros, null, 2));

  await ds.destroy();
})().catch(async (e) => {
  console.error(e);
  try { await ds.destroy(); } catch (_) {}
  process.exit(1);
});
