-- Migración 010: Crear tablas para Actas de Recepción
-- Las actas NO modifican el inventario, solo documentan el control de calidad

-- Tabla principal de actas de recepción
CREATE TABLE IF NOT EXISTS actas_recepcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo_documento VARCHAR(100),
    numero_documento VARCHAR(100),
    cliente_id INT NOT NULL,
    proveedor VARCHAR(255),
    tipo_operacion VARCHAR(50),
    tipo_conteo VARCHAR(100),
    condicion_temperatura VARCHAR(100),
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalles de acta de recepción
CREATE TABLE IF NOT EXISTS actas_recepcion_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acta_id INT NOT NULL,
    producto_id INT NOT NULL,
    producto_codigo VARCHAR(100),
    producto_nombre VARCHAR(255),
    fabricante VARCHAR(200),
    lote_numero VARCHAR(100) NOT NULL,
    fecha_vencimiento DATE,
    um VARCHAR(50),
    temperatura_min DECIMAL(5,2),
    temperatura_max DECIMAL(5,2),
    cantidad_solicitada DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad_recibida DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad_bultos DECIMAL(12,2) DEFAULT 0,
    cantidad_cajas DECIMAL(12,2) DEFAULT 0,
    cantidad_por_caja DECIMAL(12,2) DEFAULT 0,
    cantidad_fraccion DECIMAL(12,2) DEFAULT 0,
    aspecto VARCHAR(10) DEFAULT 'EMB',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acta_id) REFERENCES actas_recepcion(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para mejorar rendimiento
CREATE INDEX idx_actas_fecha ON actas_recepcion(fecha);
CREATE INDEX idx_actas_cliente ON actas_recepcion(cliente_id);
CREATE INDEX idx_actas_tipo_doc ON actas_recepcion(tipo_documento, numero_documento);
CREATE INDEX idx_actas_det_acta ON actas_recepcion_detalles(acta_id);
CREATE INDEX idx_actas_det_producto ON actas_recepcion_detalles(producto_id);
CREATE INDEX idx_actas_det_lote ON actas_recepcion_detalles(lote_numero);
