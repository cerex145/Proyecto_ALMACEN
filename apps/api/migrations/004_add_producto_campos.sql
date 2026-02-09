-- Agregar campos adicionales a productos
ALTER TABLE `productos`
  ADD COLUMN `tipo_documento` ENUM('Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra') NULL AFTER `proveedor`,
  ADD COLUMN `numero_documento` VARCHAR(100) NULL AFTER `tipo_documento`,
  ADD COLUMN `registro_sanitario` VARCHAR(100) NULL AFTER `numero_documento`,
  ADD COLUMN `lote` VARCHAR(100) NULL AFTER `registro_sanitario`,
  ADD COLUMN `fabricante` VARCHAR(200) NULL AFTER `lote`,
  ADD COLUMN `fecha_vencimiento` DATE NULL AFTER `procedencia`,
  ADD COLUMN `unidad` VARCHAR(20) NOT NULL DEFAULT 'UND' AFTER `fecha_vencimiento`,
  ADD COLUMN `unidad_otro` VARCHAR(50) NULL AFTER `unidad`,
  ADD COLUMN `um` ENUM('', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G') NULL AFTER `unidad_otro`,
  ADD COLUMN `temperatura_c` DECIMAL(6,2) NULL AFTER `um`,
  ADD COLUMN `cantidad_bultos` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `temperatura_c`,
  ADD COLUMN `cantidad_cajas` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `cantidad_bultos`,
  ADD COLUMN `cantidad_por_caja` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `cantidad_cajas`,
  ADD COLUMN `cantidad_fraccion` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `cantidad_por_caja`,
  ADD COLUMN `cantidad_total` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER `cantidad_fraccion`,
  ADD COLUMN `observaciones` TEXT NULL AFTER `cantidad_total`;
