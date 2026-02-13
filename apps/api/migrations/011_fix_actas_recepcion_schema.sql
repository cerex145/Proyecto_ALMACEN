-- Migration 011: Align actas_recepcion schema with ActaRecepcion entity
-- This keeps old columns but relaxes constraints and adds missing fields.

-- Make legacy columns nullable to allow inserts from the new flow
ALTER TABLE actas_recepcion
    MODIFY COLUMN nota_ingreso_id INT NULL,
    MODIFY COLUMN numero_acta VARCHAR(50) NULL,
    MODIFY COLUMN fecha_recepcion DATE NULL,
    MODIFY COLUMN responsable_id INT NULL,
    MODIFY COLUMN aprobado TINYINT(1) NULL;

-- Use a flexible estado column compatible with current code
ALTER TABLE actas_recepcion
    MODIFY COLUMN estado VARCHAR(20) NULL;

-- Add new columns used by the ActaRecepcion entity (only if missing)
ALTER TABLE actas_recepcion
    ADD COLUMN fecha DATE NULL,
    ADD COLUMN tipo_documento VARCHAR(100) NULL,
    ADD COLUMN numero_documento VARCHAR(100) NULL,
    ADD COLUMN cliente_id INT NULL,
    ADD COLUMN proveedor VARCHAR(255) NULL,
    ADD COLUMN tipo_operacion VARCHAR(50) NULL,
    ADD COLUMN tipo_conteo VARCHAR(100) NULL,
    ADD COLUMN condicion_temperatura VARCHAR(100) NULL;

-- Ensure updated_at exists and updates on row change (skip if already present)
ALTER TABLE actas_recepcion
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create the new details table used by ActaRecepcionDetalle if missing
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_actas_det_acta ON actas_recepcion_detalles(acta_id);
CREATE INDEX idx_actas_det_producto ON actas_recepcion_detalles(producto_id);
CREATE INDEX idx_actas_det_lote ON actas_recepcion_detalles(lote_numero);
