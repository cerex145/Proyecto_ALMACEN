-- Agregar nuevos campos a la tabla de clientes
ALTER TABLE `clientes`
  ADD COLUMN `distrito` VARCHAR(100) NULL AFTER `direccion`,
  ADD COLUMN `provincia` VARCHAR(100) NULL AFTER `distrito`,
  ADD COLUMN `departamento` VARCHAR(100) NULL AFTER `provincia`,
  ADD COLUMN `categoria_riesgo` ENUM('Bajo', 'Alto', 'No verificado') NULL AFTER `departamento`,
  ADD COLUMN `estado` ENUM('Activo', 'Inactivo', 'Potencial', 'Blokeado') NOT NULL DEFAULT 'Activo' AFTER `categoria_riesgo`;
