-- ============================================
-- TABLAS BASE (EXISTENTES)
-- ============================================

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

-- Tabla de Productos (ACTUALIZADA)
CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `proveedor` VARCHAR(200) NULL,
  `categoria_ingreso` ENUM('IMPORTACION', 'COMPRA_LOCAL', 'TRASLADO', 'DEVOLUCION') NULL,
  `procedencia` VARCHAR(200) NULL,
  `stock_actual` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_productos_codigo` (`codigo`),
  INDEX `IDX_productos_categoria` (`categoria_ingreso`),
  INDEX `IDX_productos_stock` (`stock_actual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE TRANSACCIONES
-- ============================================

-- Tabla de Notas de Ingreso
CREATE TABLE IF NOT EXISTS `notas_ingreso` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_ingreso` VARCHAR(50) NOT NULL,
  `fecha` DATE NOT NULL,
  `proveedor` VARCHAR(200) NOT NULL,
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

-- Tabla de Detalles de Notas de Ingreso
CREATE TABLE IF NOT EXISTS `nota_ingreso_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nota_ingreso_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `lote_numero` VARCHAR(100) NOT NULL,
  `fecha_vencimiento` DATE NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_nota_ingreso_detalles_nota_id` (`nota_ingreso_id`),
  INDEX `IDX_nota_ingreso_detalles_producto_id` (`producto_id`),
  INDEX `IDX_nota_ingreso_detalles_lote` (`lote_numero`),
  CONSTRAINT `FK_nota_ingreso_detalles_nota`
    FOREIGN KEY (`nota_ingreso_id`)
    REFERENCES `notas_ingreso` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_nota_ingreso_detalles_producto`
    FOREIGN KEY (`producto_id`)
    REFERENCES `productos` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Actas de Recepción
CREATE TABLE IF NOT EXISTS `actas_recepcion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nota_ingreso_id` INT NOT NULL,
  `numero_acta` VARCHAR(50) NOT NULL,
  `fecha_recepcion` DATE NOT NULL,
  `responsable_id` INT NULL,
  `estado` ENUM('CONFORME', 'OBSERVADO') NOT NULL DEFAULT 'CONFORME',
  `aprobado` TINYINT(1) NOT NULL DEFAULT 0,
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_actas_recepcion_numero` (`numero_acta`),
  INDEX `IDX_actas_recepcion_nota_id` (`nota_ingreso_id`),
  INDEX `IDX_actas_recepcion_fecha` (`fecha_recepcion`),
  INDEX `IDX_actas_recepcion_estado` (`estado`),
  CONSTRAINT `FK_actas_recepcion_nota`
    FOREIGN KEY (`nota_ingreso_id`)
    REFERENCES `notas_ingreso` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Detalles de Actas de Recepción
CREATE TABLE IF NOT EXISTS `acta_recepcion_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `acta_recepcion_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `lote_numero` VARCHAR(100) NOT NULL,
  `cantidad_esperada` DECIMAL(10,2) NOT NULL,
  `cantidad_recibida` DECIMAL(10,2) NOT NULL,
  `conforme` TINYINT(1) NOT NULL DEFAULT 1,
  `observaciones` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_acta_recepcion_detalles_acta_id` (`acta_recepcion_id`),
  INDEX `IDX_acta_recepcion_detalles_producto_id` (`producto_id`),
  CONSTRAINT `FK_acta_recepcion_detalles_acta`
    FOREIGN KEY (`acta_recepcion_id`)
    REFERENCES `actas_recepcion` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_acta_recepcion_detalles_producto`
    FOREIGN KEY (`producto_id`)
    REFERENCES `productos` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Notas de Salida
CREATE TABLE IF NOT EXISTS `notas_salida` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `numero_salida` VARCHAR(50) NOT NULL,
  `cliente_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
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
    FOREIGN KEY (`cliente_id`)
    REFERENCES `clientes` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Detalles de Notas de Salida
CREATE TABLE IF NOT EXISTS `nota_salida_detalles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nota_salida_id` INT NOT NULL,
  `producto_id` INT NOT NULL,
  `lote_id` INT NULL,
  `cantidad` DECIMAL(10,2) NOT NULL,
  `precio_unitario` DECIMAL(10,2) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `IDX_nota_salida_detalles_nota_id` (`nota_salida_id`),
  INDEX `IDX_nota_salida_detalles_producto_id` (`producto_id`),
  CONSTRAINT `FK_nota_salida_detalles_nota`
    FOREIGN KEY (`nota_salida_id`)
    REFERENCES `notas_salida` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `FK_nota_salida_detalles_producto`
    FOREIGN KEY (`producto_id`)
    REFERENCES `productos` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLAS DE INVENTARIO
-- ============================================

-- Tabla de Lotes
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
    FOREIGN KEY (`producto_id`)
    REFERENCES `productos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Kardex
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
    FOREIGN KEY (`producto_id`)
    REFERENCES `productos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Ajustes de Stock (EXISTENTE)
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

-- ============================================
-- TABLAS DE ALERTAS Y SISTEMA
-- ============================================

-- Tabla de Alertas de Vencimiento
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

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `permisos` JSON NOT NULL DEFAULT '{}',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `UK_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios
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
    FOREIGN KEY (`rol_id`)
    REFERENCES `roles` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Auditoría
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

-- ============================================
-- INSERTS INICIALES (OPCIONAL)
-- ============================================

-- Insertar roles por defecto
INSERT INTO `roles` (`nombre`, `descripcion`, `permisos`, `activo`) VALUES
('ADMINISTRADOR', 'Acceso total al sistema', '{"*": true}', 1),
('ALMACENERO', 'Gestión de inventario y transacciones', '{"ingresos": true, "salidas": true, "kardex": true, "lotes": true}', 1),
('CONSULTA', 'Solo consulta de datos', '{"kardex": true, "reportes": true}', 1)
ON DUPLICATE KEY UPDATE `nombre`=VALUES(`nombre`);
