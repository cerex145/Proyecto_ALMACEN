-- Agrega columnas de desglose de cantidades para importación de salidas
ALTER TABLE nota_salida_detalles
    ADD COLUMN cant_bulto DECIMAL(10,2) NULL DEFAULT 0 AFTER cantidad,
    ADD COLUMN cant_caja DECIMAL(10,2) NULL DEFAULT 0 AFTER cant_bulto,
    ADD COLUMN cant_x_caja DECIMAL(10,2) NULL DEFAULT 0 AFTER cant_caja,
    ADD COLUMN cant_fraccion DECIMAL(10,2) NULL DEFAULT 0 AFTER cant_x_caja;
