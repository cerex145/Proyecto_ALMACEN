-- =====================================================
-- SISTEMA DE GESTIÓN DE ALMACÉN
-- Forward Engineering Script for MySQL
-- Versión: 1.0
-- Fecha: 20 Enero 2026
-- =====================================================

-- Crear base de datos
DROP DATABASE IF EXISTS almacen_db;
CREATE DATABASE almacen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE almacen_db;

-- =====================================================
-- MÓDULO DE SEGURIDAD
-- =====================================================

-- Tabla: roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'Administrador, Almacenero, Consulta',
    descripcion TEXT,
    permisos JSON COMMENT 'Control de acceso por módulo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_username (username)
) ENGINE=InnoDB;

-- =====================================================
-- MÓDULO DE CATÁLOGOS
-- =====================================================

-- Tabla: categorias_ingreso
CREATE TABLE categorias_ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL COMMENT 'Importación, Compra local, Traslado, Devolución',
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Tabla: clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    nombre_comercial VARCHAR(200),
    contacto VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    INDEX idx_clientes_ruc (ruc),
    INDEX idx_clientes_razon_social (razon_social),
    INDEX idx_clientes_codigo (codigo)
) ENGINE=InnoDB;

-- Tabla: proveedores
CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla: productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    unidad_medida VARCHAR(20) COMMENT 'kg, unidad, caja, etc.',
    categoria_ingreso_id INT,
    procedencia VARCHAR(100),
    fabricante VARCHAR(100),
    stock_actual DECIMAL(10,2) DEFAULT 0,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (categoria_ingreso_id) REFERENCES categorias_ingreso(id),
    FOREIGN KEY (created_by) REFERENCES usuarios(id),
    INDEX idx_productos_codigo (codigo),
    INDEX idx_productos_descripcion (descripcion),
    INDEX idx_productos_categoria (categoria_ingreso_id)
) ENGINE=InnoDB;

-- Tabla: lotes
CREATE TABLE lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    fecha_produccion DATE,
    fecha_vencimiento DATE,
    stock_lote DECIMAL(10,2) DEFAULT 0,
    proveedor VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producto_lote (producto_id, numero_lote),
    INDEX idx_lotes_producto (producto_id),
    INDEX idx_lotes_numero (numero_lote),
    INDEX idx_lotes_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB;

-- =====================================================
-- MÓDULO DE INGRESOS
-- =====================================================

-- Tabla: ingresos (Nota de Ingreso)
CREATE TABLE ingresos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_ingreso VARCHAR(20) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    proveedor_id INT,
    responsable_id INT NOT NULL,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'registrado' COMMENT 'registrado, aprobado, anulado',
    archivo_importacion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
    INDEX idx_ingresos_fecha (fecha),
    INDEX idx_ingresos_numero (numero_ingreso),
    INDEX idx_ingresos_proveedor (proveedor_id)
) ENGINE=InnoDB;

-- Tabla: detalle_ingreso
CREATE TABLE detalle_ingreso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ingreso_id INT NOT NULL,
    producto_id INT NOT NULL,
    lote_id INT,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingreso_id) REFERENCES ingresos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_detalle_ingreso_ingreso (ingreso_id),
    INDEX idx_detalle_ingreso_producto (producto_id)
) ENGINE=InnoDB;

-- Tabla: actas_recepcion
CREATE TABLE actas_recepcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_acta VARCHAR(20) UNIQUE NOT NULL,
    ingreso_id INT COMMENT 'Asociada a nota de ingreso',
    fecha_recepcion DATE NOT NULL,
    responsable_recepcion_id INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' COMMENT 'pendiente, conforme, observado, aprobado',
    observaciones TEXT,
    archivo_importacion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ingreso_id) REFERENCES ingresos(id),
    FOREIGN KEY (responsable_recepcion_id) REFERENCES usuarios(id),
    INDEX idx_actas_ingreso (ingreso_id),
    INDEX idx_actas_fecha (fecha_recepcion)
) ENGINE=InnoDB;

-- Tabla: detalle_acta
CREATE TABLE detalle_acta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acta_id INT NOT NULL,
    producto_id INT NOT NULL,
    lote_id INT,
    cantidad_esperada DECIMAL(10,2) COMMENT 'De la nota de ingreso',
    cantidad_recibida DECIMAL(10,2) NOT NULL,
    estado_producto VARCHAR(20) DEFAULT 'conforme' COMMENT 'conforme, observado, rechazado',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acta_id) REFERENCES actas_recepcion(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_detalle_acta_acta (acta_id),
    INDEX idx_detalle_acta_producto (producto_id)
) ENGINE=InnoDB;

-- =====================================================
-- MÓDULO DE SALIDAS
-- =====================================================

-- Tabla: salidas
CREATE TABLE salidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_salida VARCHAR(20) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    cliente_id INT,
    responsable_id INT NOT NULL,
    tipo_salida VARCHAR(20) DEFAULT 'venta' COMMENT 'venta, traslado, merma, otro',
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'procesado' COMMENT 'procesado, anulado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
    INDEX idx_salidas_fecha (fecha),
    INDEX idx_salidas_cliente (cliente_id),
    INDEX idx_salidas_numero (numero_salida)
) ENGINE=InnoDB;

-- Tabla: detalle_salida
CREATE TABLE detalle_salida (
    id INT AUTO_INCREMENT PRIMARY KEY,
    salida_id INT NOT NULL,
    producto_id INT NOT NULL,
    lote_id INT,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salida_id) REFERENCES salidas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_detalle_salida_salida (salida_id),
    INDEX idx_detalle_salida_producto (producto_id)
) ENGINE=InnoDB;

-- =====================================================
-- MÓDULO DE CONTROL
-- =====================================================

-- Tabla: kardex
CREATE TABLE kardex (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    lote_id INT,
    fecha DATE NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL COMMENT 'ingreso, salida, ajuste',
    documento_tipo VARCHAR(20) COMMENT 'nota_ingreso, nota_salida, acta, ajuste',
    documento_id INT,
    cantidad_entrada DECIMAL(10,2) DEFAULT 0,
    cantidad_salida DECIMAL(10,2) DEFAULT 0,
    saldo DECIMAL(10,2) NOT NULL,
    responsable_id INT,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
    INDEX idx_kardex_producto (producto_id),
    INDEX idx_kardex_lote (lote_id),
    INDEX idx_kardex_fecha (fecha),
    INDEX idx_kardex_tipo (tipo_movimiento)
) ENGINE=InnoDB;

-- Tabla: ajustes
CREATE TABLE ajustes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_ajuste VARCHAR(20) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    producto_id INT NOT NULL,
    lote_id INT,
    tipo_ajuste VARCHAR(20) NOT NULL COMMENT 'aumento, disminucion',
    cantidad DECIMAL(10,2) NOT NULL,
    motivo TEXT NOT NULL,
    responsable_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
    INDEX idx_ajustes_producto (producto_id),
    INDEX idx_ajustes_fecha (fecha)
) ENGINE=InnoDB;

-- Tabla: alertas_vencimiento
CREATE TABLE alertas_vencimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lote_id INT NOT NULL,
    producto_id INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    dias_restantes INT,
    prioridad VARCHAR(20) COMMENT 'critica (<7), alta (<15), media (<30)',
    estado VARCHAR(20) DEFAULT 'activa' COMMENT 'activa, vista, resuelta',
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vista_por_usuario_id INT,
    fecha_vista TIMESTAMP NULL,
    FOREIGN KEY (lote_id) REFERENCES lotes(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (vista_por_usuario_id) REFERENCES usuarios(id),
    INDEX idx_alertas_lote (lote_id),
    INDEX idx_alertas_estado (estado),
    INDEX idx_alertas_prioridad (prioridad)
) ENGINE=InnoDB;

-- =====================================================
-- MÓDULO DE AUDITORÍA
-- =====================================================

-- Tabla: auditoria
CREATE TABLE auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(50) NOT NULL COMMENT 'create, update, delete, login, export',
    modulo VARCHAR(50) NOT NULL COMMENT 'productos, ingresos, salidas, kardex',
    registro_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_auditoria_usuario (usuario_id),
    INDEX idx_auditoria_fecha (created_at),
    INDEX idx_auditoria_modulo (modulo)
) ENGINE=InnoDB;

-- Tabla: importaciones
CREATE TABLE importaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL COMMENT 'ingreso, acta',
    archivo_nombre VARCHAR(255) NOT NULL,
    archivo_ruta VARCHAR(500),
    registros_totales INT,
    registros_exitosos INT,
    registros_errores INT,
    errores JSON,
    usuario_id INT NOT NULL,
    estado VARCHAR(20) DEFAULT 'procesado' COMMENT 'procesado, error',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_importaciones_usuario (usuario_id),
    INDEX idx_importaciones_tipo (tipo_documento)
) ENGINE=InnoDB;

-- Tabla: configuracion
CREATE TABLE configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) COMMENT 'number, string, boolean, json',
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso total al sistema', '{"productos": {"create": true, "read": true, "update": true, "delete": true}, "ingresos": {"create": true, "read": true, "update": true, "delete": true}, "salidas": {"create": true, "read": true, "update": true, "delete": true}, "kardex": {"read": true, "export": true}, "usuarios": {"create": true, "read": true, "update": true, "delete": true}}'),
('Almacenero', 'Gestión de productos e inventario', '{"productos": {"create": true, "read": true, "update": true, "delete": false}, "ingresos": {"create": true, "read": true, "update": true, "delete": false}, "salidas": {"create": true, "read": true, "update": false, "delete": false}, "kardex": {"read": true, "export": true}}'),
('Consulta', 'Solo lectura de información', '{"productos": {"read": true}, "ingresos": {"read": true}, "salidas": {"read": true}, "kardex": {"read": true, "export": true}}');

-- Insertar categorías de ingreso predefinidas
INSERT INTO categorias_ingreso (nombre, descripcion) VALUES
('Importación', 'Productos importados del extranjero'),
('Compra Local', 'Productos adquiridos localmente'),
('Traslado', 'Productos trasladados de otros almacenes'),
('Devolución', 'Productos devueltos por clientes');

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('dias_alerta_vencimiento_critica', '7', 'number', 'Días para alerta crítica de vencimiento'),
('dias_alerta_vencimiento_alta', '15', 'number', 'Días para alerta alta de vencimiento'),
('dias_alerta_vencimiento_media', '30', 'number', 'Días para alerta media de vencimiento'),
('ejecutar_alertas_automaticas', 'true', 'boolean', 'Activar generación automática de alertas'),
('formato_numero_ingreso', 'ING-{YEAR}-{NUM:4}', 'string', 'Formato para número de ingreso'),
('formato_numero_salida', 'SAL-{YEAR}-{NUM:4}', 'string', 'Formato para número de salida'),
('formato_numero_acta', 'ACT-{YEAR}-{NUM:4}', 'string', 'Formato para número de acta'),
('formato_numero_ajuste', 'AJU-{YEAR}-{NUM:4}', 'string', 'Formato para número de ajuste');

-- Usuario administrador inicial (password: admin123)
INSERT INTO usuarios (username, password_hash, nombre_completo, email, rol_id) VALUES
('admin', '$2b$10$YourHashedPasswordHere', 'Administrador del Sistema', 'admin@almacen.com', 1);

-- =====================================================
-- TRIGGERS AUTOMÁTICOS
-- =====================================================

DELIMITER $$

-- Trigger: Actualizar stock al registrar ingreso
CREATE TRIGGER trigger_stock_ingreso
AFTER INSERT ON detalle_ingreso
FOR EACH ROW
BEGIN
    -- Actualizar stock del producto
    UPDATE productos 
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id = NEW.producto_id;
    
    -- Actualizar stock del lote
    IF NEW.lote_id IS NOT NULL THEN
        UPDATE lotes 
        SET stock_lote = stock_lote + NEW.cantidad
        WHERE id = NEW.lote_id;
    END IF;
    
    -- Registrar en kardex
    INSERT INTO kardex (producto_id, lote_id, fecha, tipo_movimiento, documento_tipo, 
                        documento_id, cantidad_entrada, saldo, responsable_id)
    SELECT NEW.producto_id, NEW.lote_id, CURDATE(), 'ingreso', 'nota_ingreso',
           NEW.ingreso_id, NEW.cantidad,
           (SELECT stock_actual FROM productos WHERE id = NEW.producto_id),
           (SELECT responsable_id FROM ingresos WHERE id = NEW.ingreso_id);
END$$

-- Trigger: Validar y actualizar stock al registrar salida
CREATE TRIGGER trigger_validar_stock_salida
BEFORE INSERT ON detalle_salida
FOR EACH ROW
BEGIN
    DECLARE stock_disponible DECIMAL(10,2);
    
    -- Verificar stock disponible
    SELECT stock_actual INTO stock_disponible
    FROM productos WHERE id = NEW.producto_id;
    
    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para la salida';
    END IF;
END$$

CREATE TRIGGER trigger_stock_salida
AFTER INSERT ON detalle_salida
FOR EACH ROW
BEGIN
    -- Actualizar stock del producto
    UPDATE productos 
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.producto_id;
    
    -- Actualizar stock del lote
    IF NEW.lote_id IS NOT NULL THEN
        UPDATE lotes 
        SET stock_lote = stock_lote - NEW.cantidad
        WHERE id = NEW.lote_id;
    END IF;
    
    -- Registrar en kardex
    INSERT INTO kardex (producto_id, lote_id, fecha, tipo_movimiento, documento_tipo, 
                        documento_id, cantidad_salida, saldo, responsable_id)
    SELECT NEW.producto_id, NEW.lote_id, CURDATE(), 'salida', 'nota_salida',
           NEW.salida_id, NEW.cantidad,
           (SELECT stock_actual FROM productos WHERE id = NEW.producto_id),
           (SELECT responsable_id FROM salidas WHERE id = NEW.salida_id);
END$$

-- Trigger: Registrar ajuste en kardex
CREATE TRIGGER trigger_ajuste_kardex
AFTER INSERT ON ajustes
FOR EACH ROW
BEGIN
    DECLARE nuevo_saldo DECIMAL(10,2);
    
    -- Actualizar stock según tipo de ajuste
    IF NEW.tipo_ajuste = 'aumento' THEN
        UPDATE productos SET stock_actual = stock_actual + NEW.cantidad WHERE id = NEW.producto_id;
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE lotes SET stock_lote = stock_lote + NEW.cantidad WHERE id = NEW.lote_id;
        END IF;
    ELSE
        UPDATE productos SET stock_actual = stock_actual - NEW.cantidad WHERE id = NEW.producto_id;
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE lotes SET stock_lote = stock_lote - NEW.cantidad WHERE id = NEW.lote_id;
        END IF;
    END IF;
    
    -- Obtener saldo actualizado
    SELECT stock_actual INTO nuevo_saldo FROM productos WHERE id = NEW.producto_id;
    
    -- Registrar en kardex
    INSERT INTO kardex (producto_id, lote_id, fecha, tipo_movimiento, documento_tipo,
                        documento_id, cantidad_entrada, cantidad_salida, saldo, 
                        responsable_id, observaciones)
    VALUES (NEW.producto_id, NEW.lote_id, NEW.fecha, 'ajuste', 'ajuste',
            NEW.id,
            IF(NEW.tipo_ajuste = 'aumento', NEW.cantidad, 0),
            IF(NEW.tipo_ajuste = 'disminucion', NEW.cantidad, 0),
            nuevo_saldo, NEW.responsable_id, NEW.motivo);
END$$

DELIMITER ;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER $$

-- Procedimiento: Generar alertas de vencimiento
CREATE PROCEDURE generar_alertas_vencimiento()
BEGIN
    DECLARE dias_critica INT;
    DECLARE dias_alta INT;
    DECLARE dias_media INT;
    
    -- Obtener configuración
    SELECT valor INTO dias_critica FROM configuracion WHERE clave = 'dias_alerta_vencimiento_critica';
    SELECT valor INTO dias_alta FROM configuracion WHERE clave = 'dias_alerta_vencimiento_alta';
    SELECT valor INTO dias_media FROM configuracion WHERE clave = 'dias_alerta_vencimiento_media';
    
    -- Limpiar alertas antiguas resueltas
    DELETE FROM alertas_vencimiento 
    WHERE estado = 'resuelta' AND fecha_alerta < DATE_SUB(CURDATE(), INTERVAL 30 DAY);
    
    -- Generar nuevas alertas
    INSERT INTO alertas_vencimiento (lote_id, producto_id, fecha_vencimiento, 
                                      dias_restantes, prioridad, estado)
    SELECT l.id, l.producto_id, l.fecha_vencimiento,
           DATEDIFF(l.fecha_vencimiento, CURDATE()) as dias_restantes,
           CASE 
               WHEN DATEDIFF(l.fecha_vencimiento, CURDATE()) <= dias_critica THEN 'critica'
               WHEN DATEDIFF(l.fecha_vencimiento, CURDATE()) <= dias_alta THEN 'alta'
               WHEN DATEDIFF(l.fecha_vencimiento, CURDATE()) <= dias_media THEN 'media'
           END as prioridad,
           'activa'
    FROM lotes l
    WHERE l.fecha_vencimiento IS NOT NULL
      AND l.stock_lote > 0
      AND l.fecha_vencimiento >= CURDATE()
      AND DATEDIFF(l.fecha_vencimiento, CURDATE()) <= dias_media
      AND NOT EXISTS (
          SELECT 1 FROM alertas_vencimiento a 
          WHERE a.lote_id = l.id AND a.estado = 'activa'
      );
END$$

-- Procedimiento: Obtener kardex por producto
CREATE PROCEDURE obtener_kardex_producto(
    IN p_producto_id INT,
    IN p_lote_id INT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT k.*, p.codigo, p.descripcion, l.numero_lote, u.nombre_completo as responsable
    FROM kardex k
    INNER JOIN productos p ON k.producto_id = p.id
    LEFT JOIN lotes l ON k.lote_id = l.id
    LEFT JOIN usuarios u ON k.responsable_id = u.id
    WHERE k.producto_id = COALESCE(p_producto_id, k.producto_id)
      AND (p_lote_id IS NULL OR k.lote_id = p_lote_id)
      AND k.fecha BETWEEN COALESCE(p_fecha_inicio, '1900-01-01') AND COALESCE(p_fecha_fin, '2099-12-31')
    ORDER BY k.fecha DESC, k.id DESC;
END$$

DELIMITER ;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Stock actual por producto con alertas
CREATE VIEW v_stock_productos AS
SELECT 
    p.id,
    p.codigo,
    p.descripcion,
    p.unidad_medida,
    p.stock_actual,
    p.stock_minimo,
    c.nombre as categoria_ingreso,
    CASE 
        WHEN p.stock_actual <= 0 THEN 'sin_stock'
        WHEN p.stock_actual <= p.stock_minimo THEN 'stock_bajo'
        ELSE 'normal'
    END as estado_stock,
    (SELECT COUNT(*) FROM alertas_vencimiento av 
     WHERE av.producto_id = p.id AND av.estado = 'activa') as alertas_activas
FROM productos p
LEFT JOIN categorias_ingreso c ON p.categoria_ingreso_id = c.id
WHERE p.activo = TRUE;

-- Vista: Productos próximos a vencer
CREATE VIEW v_productos_por_vencer AS
SELECT 
    av.id,
    p.codigo,
    p.descripcion,
    l.numero_lote,
    l.fecha_vencimiento,
    av.dias_restantes,
    av.prioridad,
    av.estado,
    l.stock_lote
FROM alertas_vencimiento av
INNER JOIN productos p ON av.producto_id = p.id
INNER JOIN lotes l ON av.lote_id = l.id
WHERE av.estado = 'activa'
ORDER BY av.dias_restantes ASC;

-- =====================================================
-- EVENTOS PROGRAMADOS (requiere event_scheduler = ON)
-- =====================================================

-- Evento: Generar alertas diariamente
CREATE EVENT IF NOT EXISTS evento_alertas_diarias
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO CALL generar_alertas_vencimiento();

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 'Base de datos almacen_db creada exitosamente' as mensaje;
