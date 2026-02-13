-- Agregar columnas de cantidad detallada a nota_ingreso_detalles
-- Estas columnas permiten registrar cantidades en diferentes unidades (bultos, cajas, etc.)

ALTER TABLE nota_ingreso_detalles
ADD COLUMN cantidad_bultos DECIMAL(10,2) DEFAULT 0 AFTER precio_unitario,
ADD COLUMN cantidad_cajas DECIMAL(10,2) DEFAULT 0 AFTER cantidad_bultos,
ADD COLUMN cantidad_por_caja DECIMAL(10,2) DEFAULT 0 AFTER cantidad_cajas,
ADD COLUMN cantidad_fraccion DECIMAL(10,2) DEFAULT 0 AFTER cantidad_por_caja,
ADD COLUMN cantidad_total DECIMAL(10,2) DEFAULT 0 AFTER cantidad_fraccion;

-- Actualizar registros existentes para que cantidad_total refleje la cantidad actual
UPDATE nota_ingreso_detalles
SET cantidad_total = cantidad
WHERE cantidad_total = 0 OR cantidad_total IS NULL;
