-- ============================================================
-- MIGRACIÓN 012: Sincronización completa BD con entidades
-- Fecha: 2026-03-02
-- Descripción: Script idempotente que crea o actualiza todas
--   las tablas para que coincidan exactamente con las entidades
--   TypeORM del código. Seguro de ejecutar múltiples veces.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1) TABLA: roles
-- ============================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `permisos` JSON NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de roles
INSERT IGNORE INTO `roles` (`nombre`, `descripcion`, `permisos`, `activo`) VALUES
('ADMINISTRADOR', 'Acceso total al sistema', '{"*": true}', 1),
('ALMACENERO', 'Gestión de inventario y transacciones', '{"ingresos": true, "salidas": true, "kardex": true, "lotes": true}', 1),
('CONSULTA', 'Solo consulta de datos', '{"kardex": true, "reportes": true}', 1);

-- ============================================================
-- 2) TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `usuario` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol_id` INT NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `ultimo_acceso` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_usuarios_usuario` (`usuario`),
  INDEX `IDX_usuarios_rol_id` (`rol_id`),
  INDEX `IDX_usuarios_activo` (`activo`),
  CONSTRAINT `FK_usuarios_rol`
    FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario admin por defecto (password: admin123 en bcrypt)
INSERT IGNORE INTO `usuarios` (`nombre`, `usuario`, `email`, `password`, `rol_id`, `activo`) VALUES
('Administrador', 'admin', 'admin@almacen.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1);

-- ============================================================
-- 3) TABLA: clientes
-- ============================================================
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) NOT NULL,
  `razon_social` VARCHAR(200) NOT NULL,
  `cuit` VARCHAR(13) NULL,
  `direccion` VARCHAR(300) NULL,
  `distrito` VARCHAR(100) NULL,
  `provincia` VARCHAR(100) NULL,
  `departamento` VARCHAR(100) NULL,
  `categoria_riesgo` ENUM('Bajo', 'Alto', 'No verificado') NULL,
  `estado` ENUM('Activo', 'Inactivo', 'Potencial', 'Blokeado') NOT NULL DEFAULT 'Activo',
  `telefono` VARCHAR(50) NULL,
  `email` VARCHAR(100) NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_clientes_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4) TABLA: productos
-- ============================================================
CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `proveedor` VARCHAR(200) NULL,
  `tipo_documento` ENUM('Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra') NULL,
  `numero_documento` VARCHAR(100) NULL,
  `registro_sanitario` VARCHAR(100) NULL,
  `lote` VARCHAR(100) NULL,
  `fabricante` VARCHAR(200) NULL,
  `categoria_ingreso` ENUM('IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION') NULL,
  `procedencia` VARCHAR(200) NULL,
  `fecha_vencimiento` DATE NULL,
  `unidad` VARCHAR(20) NOT NULL DEFAULT 'UND',
  `unidad_otro` VARCHAR(50) NULL,
  `um` ENUM('', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND') NULL,
  `temperatura_min_c` DECIMAL(6,2) NULL,
  `temperatura_max_c` DECIMAL(6,2) NULL,
  `cantidad_bultos` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `cantidad_cajas` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `cantidad_por_caja` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `cantidad_fraccion` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `cantidad_total` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `observaciones` TEXT NULL,
  `stock_actual` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_productos_codigo` (`codigo`),
  INDEX `IDX_productos_categoria` (`categoria_ingreso`),
  INDEX `IDX_productos_stock` (`stock_actual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas faltantes a productos si ya existe la tabla
-- (por si la tabla fue creada sin estos campos)
ALTER TABLE `productos`
  MODIFY COLUMN `um` ENUM('', 'AMP', 'FRS', 'BLT', 'TUB', 'SOB', 'CJ', 'KG', 'G', 'UND') NULL;

-- ============================================================
-- 5) TABLA: notas_ingreso
-- ============================================================
CREATE TABLE IF NOT EXISTS `notas_ingreso` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_ingreso` VARCHAR(50) NOT NULL,
  `fecha` DATE NOT NULL,
  `proveedor` VARCHAR(200) NOT NULL,
  `tipo_documento` ENUM('Factura', 'Invoice', 'Boleta de Venta', 'Guía de Remisión Remitente', 'Guía de Remisión Transportista', 'Orden de Compra') NULL,
  `numero_documento` VARCHAR(100) NULL,
  `responsable_id` INT NULL,
  `estado` ENUM('REGISTRADA', 'PARCIALMENTE_RECIBIDA', 'RECIBIDA_CONFORME', 'RECIBIDA_OBSERVADA') NOT NULL DEFAULT 'REGISTRADA',
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_notas_ingreso_numero` (`numero_ingreso`),
  INDEX `IDX_notas_ingreso_fecha` (`fecha`),
  INDEX `IDX_notas_ingreso_estado` (`estado`),
  INDEX `IDX_notas_ingreso_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6) TABLA: nota_ingreso_detalles
-- ============================================================
CREATE TABLE IF NOT EXISTS `nota_ingreso_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nota_ingreso_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `lote_numero` VARCHAR(100) NOT NULL,
  `fecha_vencimiento` DATE NULL,
  `um` VARCHAR(50) NULL,
  `fabricante` VARCHAR(200) NULL,
  `temperatura_min_c` DECIMAL(5,2) NULL,
  `temperatura_max_c` DECIMAL(5,2) NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NULL,
  `cantidad_bultos` DECIMAL(10,2) DEFAULT 0,
  `cantidad_cajas` DECIMAL(10,2) DEFAULT 0,
  `cantidad_por_caja` DECIMAL(10,2) DEFAULT 0,
  `cantidad_fraccion` DECIMAL(10,2) DEFAULT 0,
  `cantidad_total` DECIMAL(10,2) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_nid_nota_id` (`nota_ingreso_id`),
  INDEX `IDX_nid_producto_id` (`producto_id`),
  INDEX `IDX_nid_lote` (`lote_numero`),
  CONSTRAINT `FK_nid_nota`
    FOREIGN KEY (`nota_ingreso_id`) REFERENCES `notas_ingreso` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_nid_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7) TABLA: lotes
-- ============================================================
CREATE TABLE IF NOT EXISTS `lotes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `numero_lote` VARCHAR(100) NOT NULL,
  `fecha_vencimiento` DATE NULL,
  `cantidad_ingresada` DECIMAL(10,2) NOT NULL,
  `cantidad_disponible` DECIMAL(10,2) NOT NULL,
  `nota_ingreso_id` INT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_lotes_producto_id` (`producto_id`),
  INDEX `IDX_lotes_numero` (`numero_lote`),
  INDEX `IDX_lotes_vencimiento` (`fecha_vencimiento`),
  INDEX `IDX_lotes_disponible` (`cantidad_disponible`),
  CONSTRAINT `FK_lotes_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8) TABLA: notas_salida
-- ============================================================
CREATE TABLE IF NOT EXISTS `notas_salida` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_salida` VARCHAR(50) NOT NULL,
  `cliente_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `tipo_documento` VARCHAR(50) NULL,
  `numero_documento` VARCHAR(100) NULL,
  `fecha_ingreso` DATE NULL,
  `motivo_salida` TEXT NULL,
  `responsable_id` INT NULL,
  `estado` ENUM('REGISTRADA', 'DESPACHO_PENDIENTE', 'DESPACHADA') NOT NULL DEFAULT 'REGISTRADA',
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_notas_salida_numero` (`numero_salida`),
  INDEX `IDX_notas_salida_cliente_id` (`cliente_id`),
  INDEX `IDX_notas_salida_fecha` (`fecha`),
  INDEX `IDX_notas_salida_estado` (`estado`),
  CONSTRAINT `FK_notas_salida_cliente`
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas faltantes a notas_salida si ya existe
-- (idempotente vía procedimiento auxiliar)
DROP PROCEDURE IF EXISTS add_col_if_missing;
DELIMITER $$
CREATE PROCEDURE add_col_if_missing()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notas_salida'
      AND COLUMN_NAME = 'tipo_documento'
  ) THEN
    ALTER TABLE `notas_salida` ADD COLUMN `tipo_documento` VARCHAR(50) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notas_salida'
      AND COLUMN_NAME = 'numero_documento'
  ) THEN
    ALTER TABLE `notas_salida` ADD COLUMN `numero_documento` VARCHAR(100) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notas_salida'
      AND COLUMN_NAME = 'fecha_ingreso'
  ) THEN
    ALTER TABLE `notas_salida` ADD COLUMN `fecha_ingreso` DATE NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notas_salida'
      AND COLUMN_NAME = 'motivo_salida'
  ) THEN
    ALTER TABLE `notas_salida` ADD COLUMN `motivo_salida` TEXT NULL;
  END IF;
END$$
DELIMITER ;
CALL add_col_if_missing();
DROP PROCEDURE IF EXISTS add_col_if_missing;

-- ============================================================
-- 9) TABLA: nota_salida_detalles
-- ============================================================
CREATE TABLE IF NOT EXISTS `nota_salida_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nota_salida_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `lote_id` INT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_nsd_nota_id` (`nota_salida_id`),
  INDEX `IDX_nsd_producto_id` (`producto_id`),
  CONSTRAINT `FK_nsd_nota`
    FOREIGN KEY (`nota_salida_id`) REFERENCES `notas_salida` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_nsd_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10) TABLA: actas_recepcion
-- ============================================================
CREATE TABLE IF NOT EXISTS `actas_recepcion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `tipo_documento` VARCHAR(100) NULL,
  `numero_documento` VARCHAR(100) NULL,
  `cliente_id` INT NOT NULL,
  `proveedor` VARCHAR(255) NULL,
  `tipo_operacion` VARCHAR(50) NULL,
  `tipo_conteo` VARCHAR(100) NULL,
  `condicion_temperatura` VARCHAR(100) NULL,
  `observaciones` TEXT NULL,
  `responsable_recepcion` VARCHAR(255) NULL,
  `responsable_entrega` VARCHAR(255) NULL,
  `jefe_almacen` VARCHAR(255) NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'activa',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_actas_fecha` (`fecha`),
  INDEX `IDX_actas_cliente` (`cliente_id`),
  CONSTRAINT `FK_actas_cliente`
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columnas faltantes de responsables si ya existe la tabla
DROP PROCEDURE IF EXISTS fix_actas;
DELIMITER $$
CREATE PROCEDURE fix_actas()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'responsable_recepcion'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `responsable_recepcion` VARCHAR(255) NULL,
      ADD COLUMN `responsable_entrega` VARCHAR(255) NULL,
      ADD COLUMN `jefe_almacen` VARCHAR(255) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'condicion_temperatura'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `condicion_temperatura` VARCHAR(100) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'tipo_conteo'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `tipo_conteo` VARCHAR(100) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'tipo_operacion'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `tipo_operacion` VARCHAR(50) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'proveedor'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `proveedor` VARCHAR(255) NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'cliente_id'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `cliente_id` INT NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'actas_recepcion'
      AND COLUMN_NAME = 'fecha'
  ) THEN
    ALTER TABLE `actas_recepcion`
      ADD COLUMN `fecha` DATE NULL;
  END IF;
END$$
DELIMITER ;
CALL fix_actas();
DROP PROCEDURE IF EXISTS fix_actas;

-- ============================================================
-- 11) TABLA: actas_recepcion_detalles
-- ============================================================
CREATE TABLE IF NOT EXISTS `actas_recepcion_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `acta_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `producto_codigo` VARCHAR(100) NULL,
  `producto_nombre` VARCHAR(255) NULL,
  `fabricante` VARCHAR(200) NULL,
  `lote_numero` VARCHAR(100) NOT NULL,
  `fecha_vencimiento` DATE NULL,
  `um` VARCHAR(50) NULL,
  `temperatura_min` DECIMAL(5,2) NULL,
  `temperatura_max` DECIMAL(5,2) NULL,
  `cantidad_solicitada` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `cantidad_recibida` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `cantidad_bultos` DECIMAL(12,2) NULL DEFAULT 0,
  `cantidad_cajas` DECIMAL(12,2) NULL DEFAULT 0,
  `cantidad_por_caja` DECIMAL(12,2) NULL DEFAULT 0,
  `cantidad_fraccion` DECIMAL(12,2) NULL DEFAULT 0,
  `aspecto` VARCHAR(10) NOT NULL DEFAULT 'EMB',
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_ard_acta_id` (`acta_id`),
  INDEX `IDX_ard_producto_id` (`producto_id`),
  INDEX `IDX_ard_lote` (`lote_numero`),
  CONSTRAINT `FK_ard_acta`
    FOREIGN KEY (`acta_id`) REFERENCES `actas_recepcion` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_ard_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12) TABLA: kardex
-- ============================================================
CREATE TABLE IF NOT EXISTS `kardex` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `producto_id` INT NOT NULL,
  `lote_numero` VARCHAR(100) NULL,
  `tipo_movimiento` ENUM('INGRESO', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'AJUSTE_POR_RECEPCION') NOT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `saldo` DECIMAL(10,2) NOT NULL,
  `documento_tipo` VARCHAR(50) NULL,
  `documento_numero` VARCHAR(50) NULL,
  `referencia_id` INT NULL,
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_kardex_producto_id` (`producto_id`),
  INDEX `IDX_kardex_tipo_movimiento` (`tipo_movimiento`),
  INDEX `IDX_kardex_lote_numero` (`lote_numero`),
  INDEX `IDX_kardex_created_at` (`created_at`),
  INDEX `IDX_kardex_documento` (`documento_tipo`, `documento_numero`),
  CONSTRAINT `FK_kardex_producto`
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13) TABLA: ajustes_stock
-- ============================================================
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
    FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14) TABLA: alertas_vencimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS `alertas_vencimiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lote_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `lote_numero` VARCHAR(100) NOT NULL,
  `fecha_vencimiento` DATE NOT NULL,
  `estado` ENUM('VIGENTE', 'PROXIMO_A_VENCER', 'VENCIDO', 'DESCARTADO') NOT NULL DEFAULT 'VIGENTE',
  `dias_faltantes` INT NULL,
  `leida` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_alertas_lote_id` (`lote_id`),
  INDEX `IDX_alertas_producto_id` (`producto_id`),
  INDEX `IDX_alertas_estado` (`estado`),
  INDEX `IDX_alertas_fecha_vencimiento` (`fecha_vencimiento`),
  INDEX `IDX_alertas_leida` (`leida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15) TABLA: auditorias
-- ============================================================
CREATE TABLE IF NOT EXISTS `auditorias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `tabla_afectada` VARCHAR(100) NOT NULL,
  `registro_id` INT NULL,
  `valores_anteriores` JSON NULL,
  `valores_nuevos` JSON NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_auditorias_usuario_id` (`usuario_id`),
  INDEX `IDX_auditorias_tabla` (`tabla_afectada`),
  INDEX `IDX_auditorias_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CORRECCIONES SOBRE TABLAS EXISTENTES (si fueron creadas por
-- migraciones anteriores con diferente estructura)
-- ============================================================

-- Corrección: nota_ingreso_detalles - agregar columnas faltantes
DROP PROCEDURE IF EXISTS fix_nid;
DELIMITER $$
CREATE PROCEDURE fix_nid()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_ingreso_detalles'
      AND COLUMN_NAME = 'um'
  ) THEN
    ALTER TABLE `nota_ingreso_detalles`
      ADD COLUMN `um` VARCHAR(50) NULL AFTER `fecha_vencimiento`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_ingreso_detalles'
      AND COLUMN_NAME = 'fabricante'
  ) THEN
    ALTER TABLE `nota_ingreso_detalles`
      ADD COLUMN `fabricante` VARCHAR(200) NULL AFTER `um`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_ingreso_detalles'
      AND COLUMN_NAME = 'temperatura_min_c'
  ) THEN
    ALTER TABLE `nota_ingreso_detalles`
      ADD COLUMN `temperatura_min_c` DECIMAL(5,2) NULL AFTER `fabricante`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_ingreso_detalles'
      AND COLUMN_NAME = 'temperatura_max_c'
  ) THEN
    ALTER TABLE `nota_ingreso_detalles`
      ADD COLUMN `temperatura_max_c` DECIMAL(5,2) NULL AFTER `temperatura_min_c`;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'nota_ingreso_detalles'
      AND COLUMN_NAME = 'cantidad_bultos'
  ) THEN
    ALTER TABLE `nota_ingreso_detalles`
      ADD COLUMN `cantidad_bultos` DECIMAL(10,2) DEFAULT 0 AFTER `precio_unitario`,
      ADD COLUMN `cantidad_cajas` DECIMAL(10,2) DEFAULT 0 AFTER `cantidad_bultos`,
      ADD COLUMN `cantidad_por_caja` DECIMAL(10,2) DEFAULT 0 AFTER `cantidad_cajas`,
      ADD COLUMN `cantidad_fraccion` DECIMAL(10,2) DEFAULT 0 AFTER `cantidad_por_caja`,
      ADD COLUMN `cantidad_total` DECIMAL(10,2) DEFAULT 0 AFTER `cantidad_fraccion`;
  END IF;
END$$
DELIMITER ;
CALL fix_nid();
DROP PROCEDURE IF EXISTS fix_nid;

-- Corrección: productos - asegurar columnas temperatura separadas
DROP PROCEDURE IF EXISTS fix_productos;
DELIMITER $$
CREATE PROCEDURE fix_productos()
BEGIN
  -- Si existe temperatura_c (columna antigua) y no existen las nuevas, migrar
  IF EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'temperatura_c'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'productos'
        AND COLUMN_NAME = 'temperatura_min_c'
    ) THEN
      ALTER TABLE `productos`
        ADD COLUMN `temperatura_min_c` DECIMAL(6,2) NULL AFTER `temperatura_c`,
        ADD COLUMN `temperatura_max_c` DECIMAL(6,2) NULL AFTER `temperatura_min_c`;
      -- Migrar datos de temperatura_c a temperatura_max_c como fallback
      UPDATE `productos` SET `temperatura_max_c` = `temperatura_c` WHERE `temperatura_c` IS NOT NULL;
    END IF;
  END IF;

  -- Agregar stock_actual si falta
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'stock_actual'
  ) THEN
    ALTER TABLE `productos`
      ADD COLUMN `stock_actual` DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;

  -- Agregar activo si falta
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'productos'
      AND COLUMN_NAME = 'activo'
  ) THEN
    ALTER TABLE `productos`
      ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1;
  END IF;
END$$
DELIMITER ;
CALL fix_productos();
DROP PROCEDURE IF EXISTS fix_productos;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT
  TABLE_NAME AS 'Tabla',
  TABLE_ROWS AS 'Filas',
  CREATE_TIME AS 'Creada'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

SELECT 'MIGRACIÓN 012 COMPLETADA EXITOSAMENTE' AS resultado;
