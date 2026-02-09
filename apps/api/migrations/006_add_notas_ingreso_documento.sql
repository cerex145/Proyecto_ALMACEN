-- Agregar tipo y número de documento a notas_ingreso
ALTER TABLE `notas_ingreso`
  ADD COLUMN `tipo_documento` ENUM('Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra') NULL AFTER `proveedor`,
  ADD COLUMN `numero_documento` VARCHAR(100) NULL AFTER `tipo_documento`;
