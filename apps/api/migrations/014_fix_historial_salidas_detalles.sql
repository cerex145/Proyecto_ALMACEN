-- Repara columnas faltantes en nota_salida_detalles y recupera datos históricos posibles

SET @sql = IF(
  EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_salida_detalles'
      AND COLUMN_NAME = 'cant_bulto'
  ),
  'SELECT 1',
  'ALTER TABLE nota_salida_detalles ADD COLUMN cant_bulto DECIMAL(10,2) NULL DEFAULT 0 AFTER cantidad'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_salida_detalles'
      AND COLUMN_NAME = 'cant_caja'
  ),
  'SELECT 1',
  'ALTER TABLE nota_salida_detalles ADD COLUMN cant_caja DECIMAL(10,2) NULL DEFAULT 0 AFTER cant_bulto'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_salida_detalles'
      AND COLUMN_NAME = 'cant_x_caja'
  ),
  'SELECT 1',
  'ALTER TABLE nota_salida_detalles ADD COLUMN cant_x_caja DECIMAL(10,2) NULL DEFAULT 0 AFTER cant_caja'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_salida_detalles'
      AND COLUMN_NAME = 'cant_fraccion'
  ),
  'SELECT 1',
  'ALTER TABLE nota_salida_detalles ADD COLUMN cant_fraccion DECIMAL(10,2) NULL DEFAULT 0 AFTER cant_x_caja'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE nota_salida_detalles
SET cantidad_total = cantidad
WHERE cantidad_total IS NULL;

UPDATE nota_salida_detalles d
JOIN (
  SELECT referencia_id, producto_id, MIN(NULLIF(lote_numero, '')) AS lote_numero
  FROM kardex
  WHERE tipo_movimiento = 'SALIDA'
    AND lote_numero IS NOT NULL
    AND lote_numero <> ''
  GROUP BY referencia_id, producto_id
) k
  ON k.referencia_id = d.nota_salida_id
 AND k.producto_id = d.producto_id
SET d.lote_numero = k.lote_numero
WHERE d.lote_numero IS NULL
   OR d.lote_numero = ''
   OR d.lote_numero = '-';

UPDATE nota_salida_detalles d
JOIN lotes l
  ON l.producto_id = d.producto_id
 AND l.numero_lote = d.lote_numero
SET d.fecha_vencimiento = l.fecha_vencimiento
WHERE d.fecha_vencimiento IS NULL
  AND d.lote_numero IS NOT NULL
  AND d.lote_numero <> ''
  AND d.lote_numero <> '-';

UPDATE nota_salida_detalles d
JOIN (
  SELECT producto_id, MAX(CASE WHEN um IS NOT NULL AND um <> '' AND um <> '-' THEN um END) AS um
  FROM nota_salida_detalles
  GROUP BY producto_id
) u
  ON u.producto_id = d.producto_id
SET d.um = u.um
WHERE (d.um IS NULL OR d.um = '' OR d.um = '-')
  AND u.um IS NOT NULL;

UPDATE nota_salida_detalles d
SET
  d.cant_bulto = 1,
  d.cant_caja = 1,
  d.cant_x_caja = COALESCE(d.cantidad_total, d.cantidad),
  d.cant_fraccion = 0
WHERE COALESCE(d.cant_bulto, 0) = 0
  AND COALESCE(d.cant_caja, 0) = 0
  AND COALESCE(d.cant_x_caja, 0) = 0
  AND COALESCE(d.cant_fraccion, 0) = 0
  AND COALESCE(d.cantidad_total, d.cantidad, 0) > 0;
