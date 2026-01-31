-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) NOT NULL,
  `razon_social` VARCHAR(200) NOT NULL,
  `cuit` VARCHAR(13) NULL,
  `direccion` VARCHAR(300) NULL,
  `telefono` VARCHAR(50) NULL,
  `email` VARCHAR(100) NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_clientes_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Ajustes de Stock
CREATE TABLE IF NOT EXISTS `ajustes_stock` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `tipo` ENUM('AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO') NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `motivo` VARCHAR(300) NOT NULL,
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_ajustes_producto_id` (`producto_id`),
  INDEX `IDX_ajustes_tipo` (`tipo`),
  INDEX `IDX_ajustes_created_at` (`created_at`),
  CONSTRAINT `FK_ajustes_producto` 
    FOREIGN KEY (`producto_id`) 
    REFERENCES `productos` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
