-- ============================================================================
-- SEED DATA - DATOS DE PRUEBA PARA SISTEMA DE ALMACÉN
-- Adaptado a estructura real de almacen_db
-- ============================================================================

USE almacen_db;

-- Limpiar datos existentes (en orden por dependencias)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE auditoria;
TRUNCATE TABLE kardex;
TRUNCATE TABLE detalle_salida;
TRUNCATE TABLE detalle_acta;
TRUNCATE TABLE detalle_ingreso;
TRUNCATE TABLE ajustes;
TRUNCATE TABLE alertas_vencimiento;
TRUNCATE TABLE lotes;
TRUNCATE TABLE salidas;
TRUNCATE TABLE actas_recepcion;
TRUNCATE TABLE ingresos;
TRUNCATE TABLE importaciones;
TRUNCATE TABLE productos;
TRUNCATE TABLE proveedores;
TRUNCATE TABLE clientes;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE roles;
TRUNCATE TABLE categorias_ingreso;
TRUNCATE TABLE configuracion;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('ADMIN', 'Administrador del sistema con acceso total', '{"modulos": ["usuarios", "reportes", "configuracion", "ingresos", "salidas", "almacen"]}'),
('ALMACENERO', 'Personal de almacén que registra operaciones', '{"modulos": ["ingresos", "salidas", "almacen", "reportes"]}'),
('SUPERVISOR', 'Supervisor que aprueba operaciones', '{"modulos": ["ingresos", "salidas", "almacen", "reportes", "aprobaciones"]}'),
('CONSULTOR', 'Usuario de solo consulta', '{"modulos": ["reportes", "consultas"]}'),
('CONTADOR', 'Acceso a reportes financieros', '{"modulos": ["reportes", "consultas"]}');

-- ============================================================================
-- 2. USUARIOS
-- ============================================================================
-- Contraseña para todos: "password123" (hasheada con bcrypt)
INSERT INTO usuarios (username, password_hash, nombre_completo, email, rol_id, activo) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador del Sistema', 'admin@almacen.com', 1, true),
('jperez', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Juan Pérez García', 'jperez@almacen.com', 2, true),
('mlopez', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'María López Rodríguez', 'mlopez@almacen.com', 2, true),
('cgarcia', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Carlos García Martínez', 'cgarcia@almacen.com', 3, true),
('aruiz', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Ana Ruiz Sánchez', 'aruiz@almacen.com', 4, true);

-- ============================================================================
-- 3. CATEGORÍAS DE INGRESO
-- ============================================================================
INSERT INTO categorias_ingreso (nombre, descripcion, activo) VALUES
('COMPRA', 'Compra a proveedores', true),
('DONACION', 'Donaciones de terceros', true),
('TRASLADO', 'Traslado de otras sedes', true),
('DEVOLUCION', 'Devolución de clientes', true),
('IMPORTACION', 'Importación de productos', true);

-- ============================================================================
-- 4. PROVEEDORES
-- ============================================================================
INSERT INTO proveedores (ruc, razon_social, contacto, telefono, email, direccion, activo) VALUES
('20456789123', 'Distribuidora Papelera SAC', 'José Ramírez', '(01) 555-1234', 'contacto@papelera.com', 'Av. Industrial 450, Lima', true),
('20567891234', 'Tech Solutions Peru SAC', 'Miguel Torres', '(01) 555-2345', 'ventas@techsolutions.com', 'Av. Tecnológica 200, San Isidro', true),
('20678912345', 'Limpieza Total SAC', 'Carmen Díaz', '(01) 555-3456', 'pedidos@limpieza.com', 'Av. Comercial 300, Chorrillos', true),
('20789123456', 'ONG Ayuda Social', 'Roberto Chávez', '(01) 555-4567', 'contacto@ayudasocial.org', 'Calle Social 100, Lima', true),
('20891234567', 'Ferretería Industrial SAC', 'Luis Castillo', '(01) 555-5678', 'ventas@ferreteria.com', 'Av. Industrial 800, Ate', true);

-- ============================================================================
-- 5. CLIENTES
-- ============================================================================
INSERT INTO clientes (codigo, ruc, razon_social, nombre_comercial, contacto, telefono, email, direccion, activo, created_by) VALUES
('CLI001', '20131377882', 'Municipalidad Provincial de Lima', 'Municipio Lima', 'Dr. Rafael Vidal', '(01) 315-1800', 'mesa.partes@munlima.gob.pe', 'Av. Nicolás de Piérola 850, Lima', true, 1),
('CLI002', '20131368924', 'Hospital Nacional Dos de Mayo', 'Hospital 2 Mayo', 'Dra. Rosa Mendoza', '(01) 328-0028', 'gerencia@hdm.gob.pe', 'Av. Grau cdra. 13, Lima', true, 1),
('CLI003', '20154800675', 'Universidad Nacional Mayor de San Marcos', 'UNMSM', 'Lic. Patricia Vega', '(01) 619-7000', 'rectorado@unmsm.edu.pe', 'Av. Universitaria cdra. 1, Lima', true, 1),
('CLI004', '20159974378', 'Poder Judicial del Perú', 'PJ Peru', 'Ing. Fernando López', '(01) 410-1010', 'adquisiciones@pj.gob.pe', 'Av. Paseo de la República cdra. 2, Lima', true, 1),
('CLI005', '20131312955', 'EsSalud - Red Almenara', 'EsSalud Almenara', 'Sr. Marco Soto', '(01) 324-2983', 'almacen.almenara@essalud.gob.pe', 'Av. Grau 800, La Victoria', true, 1),
('CLI006', '20131370645', 'Ministerio de Educación', 'Minedu', 'Lic. Elena García', '(01) 615-5800', 'adquisiciones@minedu.gob.pe', 'Calle Del Comercio 193, San Borja', true, 1),
('CLI007', '20100152356', 'Sedapal - Servicio de Agua', 'Sedapal', 'Ing. David Quispe', '(01) 317-3000', 'compras@sedapal.com.pe', 'Av. Benavides 2150, Miraflores', true, 1),
('CLI008', '20100128218', 'Petroperú S.A.', 'Petroperú', 'Sr. Carlos Mendoza', '(01) 614-5000', 'adquisiciones@petroperu.com.pe', 'Av. Paseo de la República 3361, San Isidro', true, 1);

-- ============================================================================
-- 6. PRODUCTOS
-- ============================================================================
INSERT INTO productos (codigo, descripcion, unidad_medida, categoria_ingreso_id, procedencia, fabricante, stock_actual, stock_minimo, activo) VALUES
-- Papelería
('PROD001', 'Papel Bond A4 75gr - Paquete x 500 hojas', 'PAQUETE', 1, 'Perú', 'Copamex', 100, 50, true),
('PROD002', 'Lapicero Azul Faber Castell punta 0.7mm', 'UNIDAD', 1, 'Alemania', 'Faber Castell', 500, 200, true),
('PROD003', 'Archivador Lomo Ancho A4', 'UNIDAD', 1, 'Perú', 'Kores', 15, 10, true),

-- Tecnología
('PROD004', 'Mouse Inalámbrico Logitech M185', 'UNIDAD', 1, 'China', 'Logitech', 30, 10, true),
('PROD005', 'Teclado USB HP K1500', 'UNIDAD', 1, 'China', 'HP', 25, 8, true),
('PROD006', 'Monitor LED 24 pulgadas LG Full HD', 'UNIDAD', 1, 'Corea', 'LG', 4, 2, true),

-- Limpieza
('PROD007', 'Desinfectante Pino 1 Litro', 'LITRO', 1, 'Perú', 'Dix', 80, 30, true),
('PROD008', 'Papel Higiénico Elite doble hoja x 24', 'PAQUETE', 1, 'Perú', 'Elite', 35, 15, true),
('PROD009', 'Escoba de Paja con mango de madera', 'UNIDAD', 1, 'Perú', 'Local', 10, 5, true),

-- Mobiliario
('PROD010', 'Silla Giratoria Oficina respaldo alto', 'UNIDAD', 1, 'China', 'Generic', 8, 3, true),
('PROD011', 'Escritorio Melamina color cerezo 120x60', 'UNIDAD', 1, 'Perú', 'Madepar', 5, 2, true),
('PROD012', 'Estante Metálico 5 niveles gris', 'UNIDAD', 1, 'Perú', 'Industrial', 3, 1, true),

-- Herramientas
('PROD013', 'Destornillador Plano 6 pulgadas', 'UNIDAD', 1, 'Perú', 'Truper', 20, 5, true),
('PROD014', 'Martillo Carpintero 16oz acero', 'UNIDAD', 1, 'México', 'Truper', 15, 5, true),
('PROD015', 'Taladro Inalámbrico Bosch 12V', 'UNIDAD', 1, 'Alemania', 'Bosch', 2, 1, true);

-- ============================================================================
-- 7. INGRESOS (Notas de Ingreso)
-- ============================================================================
INSERT INTO ingresos (numero, categoria_id, proveedor_id, fecha_ingreso, valor_total, estado, observaciones, registrado_por, aprobado_por) VALUES
('ING-2026-001', 1, 1, '2026-01-15 09:30:00', 2150.00, 'APROBADO', 'Compra mensual de papelería', 2, 4),
('ING-2026-002', 1, 2, '2026-01-18 14:20:00', 4850.00, 'APROBADO', 'Equipos de cómputo para área administrativa', 2, 4),
('ING-2026-003', 1, 3, '2026-01-22 10:15:00', 1580.00, 'APROBADO', 'Productos de limpieza trimestre I', 3, 4),
('ING-2026-004', 2, 4, '2026-01-25 11:00:00', 0.00, 'APROBADO', 'Donación mobiliario oficina', 3, 4),
('ING-2026-005', 1, 5, '2026-01-28 08:45:00', 1250.00, 'PENDIENTE', 'Herramientas varias', 2, NULL);

-- ============================================================================
-- 8. DETALLES DE INGRESOS
-- ============================================================================
INSERT INTO detalle_ingreso (ingreso_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 100, 12.50, 1250.00),
(1, 2, 500, 1.50, 750.00),
(1, 3, 15, 8.90, 133.50),

(2, 4, 30, 35.00, 1050.00),
(2, 5, 25, 45.00, 1125.00),
(2, 6, 4, 650.00, 2600.00),

(3, 7, 80, 8.50, 680.00),
(3, 8, 35, 22.00, 770.00),
(3, 9, 10, 12.00, 120.00),

(4, 10, 8, 0.00, 0.00),
(4, 11, 5, 0.00, 0.00),

(5, 13, 20, 15.00, 300.00),
(5, 14, 15, 35.00, 525.00),
(5, 15, 2, 320.00, 640.00);

-- ============================================================================
-- 9. LOTES
-- ============================================================================
INSERT INTO lotes (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, ingreso_id, estado) VALUES
('LT-2026-001', 1, 100, 50, '2026-01-15', NULL, 1, 'DISPONIBLE'),
('LT-2026-002', 2, 500, 400, '2026-01-15', NULL, 1, 'DISPONIBLE'),
('LT-2026-003', 3, 15, 5, '2026-01-15', NULL, 1, 'DISPONIBLE'),

('LT-2026-004', 4, 30, 15, '2026-01-18', NULL, 2, 'DISPONIBLE'),
('LT-2026-005', 5, 25, 15, '2026-01-18', NULL, 2, 'DISPONIBLE'),
('LT-2026-006', 6, 4, 3, '2026-01-18', NULL, 2, 'DISPONIBLE'),

('LT-2026-007', 7, 80, 50, '2026-01-22', '2027-01-22', 3, 'DISPONIBLE'),
('LT-2026-008', 8, 35, 30, '2026-01-22', NULL, 3, 'DISPONIBLE'),
('LT-2026-009', 9, 10, 5, '2026-01-22', NULL, 3, 'DISPONIBLE'),

('LT-2026-010', 10, 8, 8, '2026-01-25', NULL, 4, 'DISPONIBLE'),
('LT-2026-011', 11, 5, 5, '2026-01-25', NULL, 4, 'DISPONIBLE'),

('LT-2026-012', 13, 20, 20, '2026-01-28', NULL, 5, 'DISPONIBLE'),
('LT-2026-013', 14, 15, 15, '2026-01-28', NULL, 5, 'DISPONIBLE'),
('LT-2026-014', 15, 2, 2, '2026-01-28', NULL, 5, 'DISPONIBLE');

-- ============================================================================
-- 10. ACTAS DE RECEPCIÓN
-- ============================================================================
INSERT INTO actas_recepcion (numero, ingreso_id, fecha_recepcion, responsable_entrega, responsable_recepcion, estado_mercancia, observaciones, estado, registrado_por, aprobado_por) VALUES
('ACT-2026-001', 1, '2026-01-15 10:00:00', 'José Ramírez', 'Juan Pérez', 'CONFORME', 'Mercadería en buen estado, embalaje íntegro', 'APROBADO', 2, 4),
('ACT-2026-002', 2, '2026-01-18 15:00:00', 'Miguel Torres', 'Juan Pérez', 'CONFORME', 'Equipos sellados, sin daños externos', 'APROBADO', 2, 4),
('ACT-2026-003', 3, '2026-01-22 11:00:00', 'Carmen Díaz', 'María López', 'CONFORME', 'Productos con fecha de vencimiento vigente', 'APROBADO', 3, 4);

-- ============================================================================
-- 11. DETALLES DE ACTAS DE RECEPCIÓN
-- ============================================================================
INSERT INTO detalle_acta (acta_id, producto_id, cantidad_esperada, cantidad_recibida, diferencia, estado_producto, observaciones) VALUES
(1, 1, 100, 100, 0, 'CONFORME', 'Paquetes completos y sellados'),
(1, 2, 500, 500, 0, 'CONFORME', 'Cajas sin abrir'),
(1, 3, 15, 15, 0, 'CONFORME', 'Archivadores en buen estado'),

(2, 4, 30, 30, 0, 'CONFORME', 'Equipos sellados con garantía'),
(2, 5, 25, 25, 0, 'CONFORME', 'Teclados nuevos en caja'),
(2, 6, 4, 4, 0, 'CONFORME', 'Monitores sin daños, funcionando'),

(3, 7, 80, 80, 0, 'CONFORME', 'Fecha vencimiento: 01/2027'),
(3, 8, 35, 35, 0, 'CONFORME', 'Paquetes completos'),
(3, 9, 10, 10, 0, 'CONFORME', 'Escobas en buen estado');

-- ============================================================================
-- 12. SALIDAS (Notas de Salida)
-- ============================================================================
INSERT INTO salidas (numero, tipo_salida, cliente_id, area_destino, solicitante, fecha_salida, valor_total, estado, observaciones, registrado_por, aprobado_por) VALUES
('SAL-2026-001', 'ENTREGA', 2, 'ADMINISTRACION', 'Dr. Ricardo Flores', '2026-01-16 09:00:00', 875.00, 'ENTREGADO', 'Material de oficina mensual', 2, 4),
('SAL-2026-002', 'ENTREGA', 3, 'RECTORADO', 'Lic. Patricia Vega', '2026-01-19 10:30:00', 1825.00, 'ENTREGADO', 'Equipamiento oficina rectorado', 3, 4),
('SAL-2026-003', 'BAJA', NULL, 'ALMACEN', 'Carlos García', '2026-01-23 14:00:00', 0.00, 'PROCESADO', 'Productos en mal estado', 4, 4),
('SAL-2026-004', 'ENTREGA', 5, 'LIMPIEZA', 'Sr. Roberto Chávez', '2026-01-24 08:00:00', 425.00, 'ENTREGADO', 'Productos de limpieza mensual', 3, 4),
('SAL-2026-005', 'ENTREGA', 4, 'MANTENIMIENTO', 'Ing. Luis Castillo', '2026-01-29 11:00:00', 380.00, 'PENDIENTE', 'Herramientas para reparaciones', 2, NULL);

-- ============================================================================
-- 13. DETALLES DE SALIDAS
-- ============================================================================
INSERT INTO detalle_salida (salida_id, lote_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 50, 12.50, 625.00),
(1, 2, 2, 100, 1.50, 150.00),
(1, 3, 3, 10, 8.90, 89.00),

(2, 4, 4, 15, 35.00, 525.00),
(2, 5, 5, 10, 45.00, 450.00),
(2, 6, 6, 1, 650.00, 650.00),

(3, 2, 2, 10, 0.00, 0.00),

(4, 7, 7, 30, 8.50, 255.00),
(4, 8, 8, 5, 22.00, 110.00),
(4, 9, 9, 5, 12.00, 60.00),

(5, 12, 13, 10, 15.00, 150.00),
(5, 13, 14, 5, 35.00, 175.00);

-- ============================================================================
-- 14. AJUSTES DE STOCK
-- ============================================================================
INSERT INTO ajustes (tipo_ajuste, producto_id, lote_id, cantidad, motivo, observaciones, fecha_ajuste, registrado_por) VALUES
('INVENTARIO', 1, 1, -2, 'Diferencia inventario físico', 'Diferencia detectada en inventario físico mensual', '2026-01-27 16:00:00', 4),
('DANO', 2, 2, -5, 'Producto dañado', 'Lapiceros con defecto de fabricación', '2026-01-27 16:15:00', 4),
('VENCIMIENTO', 7, 7, -3, 'Producto vencido', 'Producto próximo a vencer, retirado preventivamente', '2026-01-28 09:00:00', 3);

-- ============================================================================
-- 15. ACTUALIZAR STOCK EN PRODUCTOS
-- ============================================================================
UPDATE productos SET stock_actual = 48 WHERE id = 1;
UPDATE productos SET stock_actual = 385 WHERE id = 2;
UPDATE productos SET stock_actual = 5 WHERE id = 3;
UPDATE productos SET stock_actual = 15 WHERE id = 4;
UPDATE productos SET stock_actual = 15 WHERE id = 5;
UPDATE productos SET stock_actual = 3 WHERE id = 6;
UPDATE productos SET stock_actual = 47 WHERE id = 7;
UPDATE productos SET stock_actual = 30 WHERE id = 8;
UPDATE productos SET stock_actual = 5 WHERE id = 9;
UPDATE productos SET stock_actual = 8 WHERE id = 10;
UPDATE productos SET stock_actual = 5 WHERE id = 11;
UPDATE productos SET stock_actual = 0 WHERE id = 12;
UPDATE productos SET stock_actual = 20 WHERE id = 13;
UPDATE productos SET stock_actual = 15 WHERE id = 14;
UPDATE productos SET stock_actual = 2 WHERE id = 15;

-- ============================================================================
-- RESUMEN DE CARGA
-- ============================================================================
SELECT 'DATOS CARGADOS EXITOSAMENTE' as '';
SELECT CONCAT('Usuarios: ', COUNT(*)) FROM usuarios;
SELECT CONCAT('Clientes: ', COUNT(*)) FROM clientes;
SELECT CONCAT('Productos: ', COUNT(*)) FROM productos;
SELECT CONCAT('Ingresos: ', COUNT(*)) FROM ingresos;
SELECT CONCAT('Lotes: ', COUNT(*)) FROM lotes;
SELECT CONCAT('Actas Recepción: ', COUNT(*)) FROM actas_recepcion;
SELECT CONCAT('Salidas: ', COUNT(*)) FROM salidas;
SELECT CONCAT('Ajustes Stock: ', COUNT(*)) FROM ajustes;
