-- Agregar campos de metadatos del producto al detalle de ingreso
-- Esto permite guardar una copia de la información del producto en el momento del ingreso

ALTER TABLE nota_ingreso_detalles
ADD COLUMN um VARCHAR(50) NULL AFTER fecha_vencimiento,
ADD COLUMN fabricante VARCHAR(200) NULL AFTER um,
ADD COLUMN temperatura_min_c DECIMAL(5,2) NULL AFTER fabricante,
ADD COLUMN temperatura_max_c DECIMAL(5,2) NULL AFTER temperatura_min_c;
