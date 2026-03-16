-- ============================================================
-- MIGRACIÓN 016: Corregir columnas faltantes en lotes y nota_salida_detalles
-- Fecha: 2026-03-15
-- Descripción: Agrega columnas críticas que la entidad TypeORM
--   no tenía declaradas y por eso no se guardaban correctamente.
-- ============================================================

-- ============================================================
-- TABLA: lotes
-- Agrega cantidad_ingresada, cantidad_disponible, nota_ingreso_id
-- si aún no existen (idempotente)
-- ============================================================
SET @col_ing = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'lotes'
      AND COLUMN_NAME  = 'cantidad_ingresada');
SET @sql_ing = IF(@col_ing = 0,
    'ALTER TABLE lotes ADD COLUMN cantidad_ingresada DECIMAL(10,2) NOT NULL DEFAULT 0',
    'SELECT 1');
PREPARE s FROM @sql_ing; EXECUTE s; DEALLOCATE PREPARE s;

SET @col_dis = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'lotes'
      AND COLUMN_NAME  = 'cantidad_disponible');
SET @sql_dis = IF(@col_dis = 0,
    'ALTER TABLE lotes ADD COLUMN cantidad_disponible DECIMAL(10,2) NOT NULL DEFAULT 0',
    'SELECT 1');
PREPARE s FROM @sql_dis; EXECUTE s; DEALLOCATE PREPARE s;

SET @col_ni = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'lotes'
      AND COLUMN_NAME  = 'nota_ingreso_id');
SET @sql_ni = IF(@col_ni = 0,
    'ALTER TABLE lotes ADD COLUMN nota_ingreso_id INT NULL',
    'SELECT 1');
PREPARE s FROM @sql_ni; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- TABLA: nota_salida_detalles
-- Agrega lote_id, precio_unitario, lote_numero, fecha_vencimiento,
-- um, fabricante, cant_bulto, cant_caja, cant_x_caja, cant_fraccion,
-- cantidad_total si no existen
-- ============================================================
SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='lote_id');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN lote_id INT NULL AFTER producto_id','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='precio_unitario');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN precio_unitario DECIMAL(10,2) NULL','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='lote_numero');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN lote_numero VARCHAR(100) NULL','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='fecha_vencimiento');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN fecha_vencimiento DATE NULL','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='um');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN um VARCHAR(50) NULL','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='fabricante');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN fabricante VARCHAR(200) NULL','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='cant_bulto');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN cant_bulto DECIMAL(10,2) NULL DEFAULT 0','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='cant_caja');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN cant_caja DECIMAL(10,2) NULL DEFAULT 0','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='cant_x_caja');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN cant_x_caja DECIMAL(10,2) NULL DEFAULT 0','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='cant_fraccion');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN cant_fraccion DECIMAL(10,2) NULL DEFAULT 0','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

SET @c = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='nota_salida_detalles' AND COLUMN_NAME='cantidad_total');
SET @s = IF(@c=0,'ALTER TABLE nota_salida_detalles ADD COLUMN cantidad_total DECIMAL(10,2) NULL DEFAULT 0','SELECT 1');
PREPARE s FROM @s; EXECUTE s; DEALLOCATE PREPARE s;

-- ============================================================
-- TABLA: nota_ingreso_detalles
-- Asegura que cantidad_total sea la fuente del stock
-- (por si hubo ingresos sin rellenar cantidad_total)
-- ============================================================
UPDATE nota_ingreso_detalles
SET cantidad_total = cantidad
WHERE (cantidad_total IS NULL OR cantidad_total = 0) AND cantidad > 0;
