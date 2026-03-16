-- Elimina campos de stock/cantidades y códigos internos de la gestión de productos
-- porque el stock se controla por movimientos (notas de ingreso/salida y lotes).
-- PostgreSQL

ALTER TABLE productos
  DROP COLUMN IF EXISTS stock_actual,
  DROP COLUMN IF EXISTS cantidad_bultos,
  DROP COLUMN IF EXISTS cantidad_cajas,
  DROP COLUMN IF EXISTS cantidad_por_caja,
  DROP COLUMN IF EXISTS cantidad_fraccion,
  DROP COLUMN IF EXISTS cantidad_total,
  DROP COLUMN IF EXISTS r_i,
  DROP COLUMN IF EXISTS codigo_gln,
  DROP COLUMN IF EXISTS codigo_interno;