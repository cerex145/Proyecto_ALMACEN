-- ============================================================
-- Esquema PostgreSQL para migración desde MySQL (Docker)
-- Ejecutar en Supabase antes de correr el script de datos.
-- ============================================================

-- Deshabilitar FKs temporalmente (no aplica en creación inicial)
-- Orden: tablas sin FK primero, luego las que dependen.

-- 1) roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  permisos JSONB NOT NULL DEFAULT '{}',
  activo SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Los datos se copian con el script migrate-mysql-to-postgres.js

-- 2) clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  razon_social VARCHAR(200) NOT NULL,
  cuit VARCHAR(13),
  direccion VARCHAR(300),
  distrito VARCHAR(100),
  provincia VARCHAR(100),
  departamento VARCHAR(100),
  categoria_riesgo VARCHAR(50),
  estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
  telefono VARCHAR(50),
  email VARCHAR(100),
  activo SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3) productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(300) NOT NULL,
  proveedor VARCHAR(200),
  tipo_documento VARCHAR(100),
  numero_documento VARCHAR(100),
  fecha_documento DATE,
  registro_sanitario VARCHAR(100),
  lote VARCHAR(100),
  fabricante VARCHAR(200),
  categoria_ingreso VARCHAR(50),
  procedencia VARCHAR(200),
  unidad VARCHAR(20) NOT NULL DEFAULT 'UND',
  unidad_otro VARCHAR(50),
  um VARCHAR(20),
  temperatura_min_c DECIMAL(6,2),
  temperatura_max_c DECIMAL(6,2),
  cantidad_bultos DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad_cajas DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad_por_caja DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad_fraccion DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidad_medida VARCHAR(50),
  observaciones TEXT,
  stock_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
  activo SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4) usuarios (depende de roles)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  activo SMALLINT NOT NULL DEFAULT 1,
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5) notas_ingreso
CREATE TABLE IF NOT EXISTS notas_ingreso (
  id SERIAL PRIMARY KEY,
  numero_ingreso VARCHAR(50) NOT NULL UNIQUE,
  numero_guia INT,
  fecha DATE NOT NULL,
  cliente_id INT REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  proveedor VARCHAR(200) NOT NULL,
  tipo_documento VARCHAR(100),
  numero_documento VARCHAR(100),
  responsable_id INT,
  estado VARCHAR(50) NOT NULL DEFAULT 'REGISTRADA',
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6) nota_ingreso_detalles
CREATE TABLE IF NOT EXISTS nota_ingreso_detalles (
  id SERIAL PRIMARY KEY,
  nota_ingreso_id INT NOT NULL REFERENCES notas_ingreso(id) ON DELETE CASCADE ON UPDATE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  lote_numero VARCHAR(100) NOT NULL,
  fecha_vencimiento DATE,
  um VARCHAR(50),
  fabricante VARCHAR(200),
  temperatura_min_c DECIMAL(5,2),
  temperatura_max_c DECIMAL(5,2),
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2),
  cantidad_bultos DECIMAL(10,2) DEFAULT 0,
  cantidad_cajas DECIMAL(10,2) DEFAULT 0,
  cantidad_por_caja DECIMAL(10,2) DEFAULT 0,
  cantidad_fraccion DECIMAL(10,2) DEFAULT 0,
  cantidad_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7) lotes
CREATE TABLE IF NOT EXISTS lotes (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  numero_lote VARCHAR(100) NOT NULL,
  fecha_vencimiento DATE,
  cantidad_ingresada DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad_disponible DECIMAL(10,2) NOT NULL DEFAULT 0,
  cantidad_inicial DECIMAL(10,2),
  cantidad_actual DECIMAL(10,2),
  estado VARCHAR(20) DEFAULT 'ACTIVO',
  nota_ingreso_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8) notas_salida
CREATE TABLE IF NOT EXISTS notas_salida (
  id SERIAL PRIMARY KEY,
  numero_salida VARCHAR(50) NOT NULL UNIQUE,
  cliente_id INT REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha DATE NOT NULL,
  tipo_documento VARCHAR(50),
  numero_documento VARCHAR(100),
  fecha_ingreso DATE,
  motivo_salida TEXT,
  responsable_id INT,
  estado VARCHAR(50) NOT NULL DEFAULT 'REGISTRADA',
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9) nota_salida_detalles
CREATE TABLE IF NOT EXISTS nota_salida_detalles (
  id SERIAL PRIMARY KEY,
  nota_salida_id INT NOT NULL REFERENCES notas_salida(id) ON DELETE CASCADE ON UPDATE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  lote_id INT,
  cantidad DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cant_bulto DECIMAL(10,2) DEFAULT 0,
  cant_caja DECIMAL(10,2) DEFAULT 0,
  cant_x_caja DECIMAL(10,2) DEFAULT 0,
  cant_fraccion DECIMAL(10,2) DEFAULT 0,
  lote_numero VARCHAR(100),
  fecha_vencimiento DATE,
  um VARCHAR(50),
  fabricante VARCHAR(200),
  temperatura_min_c DECIMAL(5,2),
  temperatura_max_c DECIMAL(5,2),
  cantidad_total DECIMAL(10,2)
);

-- 10) actas_recepcion
CREATE TABLE IF NOT EXISTS actas_recepcion (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  tipo_documento VARCHAR(100),
  numero_documento VARCHAR(100),
  cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  proveedor VARCHAR(255),
  tipo_operacion VARCHAR(50),
  tipo_conteo VARCHAR(100),
  condicion_temperatura VARCHAR(100),
  observaciones TEXT,
  responsable_recepcion VARCHAR(255),
  responsable_entrega VARCHAR(255),
  jefe_almacen VARCHAR(255),
  estado VARCHAR(20) NOT NULL DEFAULT 'activa',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11) actas_recepcion_detalles (nombre en MySQL 012; columna acta_id)
CREATE TABLE IF NOT EXISTS actas_recepcion_detalles (
  id SERIAL PRIMARY KEY,
  acta_id INT NOT NULL REFERENCES actas_recepcion(id) ON DELETE CASCADE ON UPDATE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
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
  aspecto VARCHAR(10) NOT NULL DEFAULT 'EMB',
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vista para compatibilidad con entidad que usa acta_recepcion_detalles (singular)
CREATE OR REPLACE VIEW acta_recepcion_detalles AS
SELECT id, acta_id AS acta_recepcion_id, producto_id, producto_codigo, producto_nombre,
  fabricante, lote_numero, fecha_vencimiento, um, temperatura_min, temperatura_max,
  cantidad_solicitada, cantidad_recibida, cantidad_bultos, cantidad_cajas,
  cantidad_por_caja, cantidad_fraccion, aspecto, observaciones, created_at
FROM actas_recepcion_detalles;

-- 12) kardex
CREATE TABLE IF NOT EXISTS kardex (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  lote_numero VARCHAR(100),
  tipo_movimiento VARCHAR(50) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  saldo DECIMAL(10,2) NOT NULL,
  documento_tipo VARCHAR(50),
  documento_numero VARCHAR(50),
  referencia_id INT,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13) ajustes_stock
CREATE TABLE IF NOT EXISTS ajustes_stock (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  motivo VARCHAR(300) NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14) alertas_vencimiento
CREATE TABLE IF NOT EXISTS alertas_vencimiento (
  id SERIAL PRIMARY KEY,
  lote_id INT,
  producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  lote_numero VARCHAR(100) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'VIGENTE',
  dias_faltantes INT,
  dias_para_vencer INT,
  cantidad INT DEFAULT 0,
  leida SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15) auditorias
CREATE TABLE IF NOT EXISTS auditorias (
  id SERIAL PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(100) NOT NULL,
  registro_id INT,
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_notas_ingreso_fecha ON notas_ingreso(fecha);
CREATE INDEX IF NOT EXISTS idx_notas_ingreso_estado ON notas_ingreso(estado);
CREATE INDEX IF NOT EXISTS idx_notas_salida_cliente ON notas_salida(cliente_id);
CREATE INDEX IF NOT EXISTS idx_notas_salida_fecha ON notas_salida(fecha);
CREATE INDEX IF NOT EXISTS idx_kardex_producto ON kardex(producto_id);
CREATE INDEX IF NOT EXISTS idx_kardex_created_at ON kardex(created_at);

-- Compatibilidad para bases ya creadas antes de este ajuste
ALTER TABLE productos ADD COLUMN IF NOT EXISTS fecha_documento DATE;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(50);

ALTER TABLE lotes ADD COLUMN IF NOT EXISTS cantidad_inicial DECIMAL(10,2);
ALTER TABLE lotes ADD COLUMN IF NOT EXISTS cantidad_actual DECIMAL(10,2);
ALTER TABLE lotes ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO';
ALTER TABLE lotes ALTER COLUMN cantidad_ingresada SET DEFAULT 0;
ALTER TABLE lotes ALTER COLUMN cantidad_disponible SET DEFAULT 0;

ALTER TABLE notas_salida ALTER COLUMN cliente_id DROP NOT NULL;

ALTER TABLE alertas_vencimiento ADD COLUMN IF NOT EXISTS dias_para_vencer INT;
ALTER TABLE alertas_vencimiento ADD COLUMN IF NOT EXISTS cantidad INT DEFAULT 0;
ALTER TABLE alertas_vencimiento ALTER COLUMN lote_id DROP NOT NULL;
