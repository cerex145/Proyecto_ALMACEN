-- ============================================================================
-- SEED DATA - DATOS DE PRUEBA PARA SISTEMA DE ALMACÉN
-- Nombres de tablas y columnas correctos
-- ============================================================================

USE almacen_db;

-- Limpiar datos existentes (en orden por dependencias)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE acta_recepcion_detalle;
TRUNCATE TABLE acta_recepcion;
TRUNCATE TABLE nota_salida_detalle;
TRUNCATE TABLE nota_salida;
TRUNCATE TABLE nota_ingreso_detalle;
TRUNCATE TABLE nota_ingreso;
TRUNCATE TABLE ajuste_stock;
TRUNCATE TABLE kardex;
TRUNCATE TABLE lote;
TRUNCATE TABLE producto;
TRUNCATE TABLE cliente;
TRUNCATE TABLE usuario;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USUARIOS
-- ============================================================================
-- Contraseña para todos: "password123" (hasheada con bcrypt)
INSERT INTO usuario (username, email, password, nombre_completo, rol, activo) VALUES
('admin', 'admin@almacen.com', '$2b$10$rZ8qPCqvAE7Q.LxJK0YxNe9P.fxKJ0mJ0YxNe9P.fxKJ0mJ0YxNe', 'Administrador del Sistema', 'ADMIN', true),
('jperez', 'jperez@almacen.com', '$2b$10$rZ8qPCqvAE7Q.LxJK0YxNe9P.fxKJ0mJ0YxNe9P.fxKJ0mJ0YxNe', 'Juan Pérez García', 'ALMACENERO', true),
('mlopez', 'mlopez@almacen.com', '$2b$10$rZ8qPCqvAE7Q.LxJK0YxNe9P.fxKJ0mJ0YxNe9P.fxKJ0mJ0YxNe', 'María López Rodríguez', 'ALMACENERO', true),
('cgarcia', 'cgarcia@almacen.com', '$2b$10$rZ8qPCqvAE7Q.LxJK0YxNe9P.fxKJ0mJ0YxNe9P.fxKJ0mJ0YxNe', 'Carlos García Martínez', 'SUPERVISOR', true),
('aruiz', 'aruiz@almacen.com', '$2b$10$rZ8qPCqvAE7Q.LxJK0YxNe9P.fxKJ0mJ0YxNe9P.fxKJ0mJ0YxNe', 'Ana Ruiz Sánchez', 'CONSULTOR', true);

-- ============================================================================
-- 2. CLIENTES
-- ============================================================================
INSERT INTO cliente (codigo, nombre, tipo_documento, numero_documento, direccion, telefono, email, activo) VALUES
('CLI001', 'Municipalidad Provincial de Lima', 'RUC', '20131377882', 'Av. Nicolás de Piérola 850, Lima', '(01) 315-1800', 'mesa.partes@munlima.gob.pe', true),
('CLI002', 'Hospital Nacional Dos de Mayo', 'RUC', '20131368924', 'Av. Grau cdra. 13, Cercado de Lima', '(01) 328-0028', 'informes@hospitaldosdemayo.gob.pe', true),
('CLI003', 'Universidad Nacional Mayor de San Marcos', 'RUC', '20154800675', 'Av. Universitaria cdra. 1, Lima', '(01) 619-7000', 'webmaster@unmsm.edu.pe', true),
('CLI004', 'Poder Judicial del Perú', 'RUC', '20159974378', 'Av. Paseo de la República cdra. 2, Lima', '(01) 410-1010', 'consultas@pj.gob.pe', true),
('CLI005', 'EsSalud - Red Almenara', 'RUC', '20131312955', 'Av. Grau 800, La Victoria', '(01) 324-2983', 'contacto.almenara@essalud.gob.pe', true),
('CLI006', 'Ministerio de Educación', 'RUC', '20131370645', 'Calle Del Comercio 193, San Borja', '(01) 615-5800', 'consultas@minedu.gob.pe', true),
('CLI007', 'Sedapal - Servicio de Agua Potable', 'RUC', '20100152356', 'Av. Benavides 2150, Miraflores', '(01) 317-3000', 'clientes@sedapal.com.pe', true),
('CLI008', 'Petroperú S.A.', 'RUC', '20100128218', 'Av. Paseo de la República 3361, San Isidro', '(01) 614-5000', 'contacto@petroperu.com.pe', true);

-- ============================================================================
-- 3. PRODUCTOS
-- ============================================================================
INSERT INTO producto (codigo, nombre, descripcion, categoria, unidad_medida, precio_unitario, stock_minimo, stock_actual, activo) VALUES
-- Papelería
('PROD001', 'Papel Bond A4 75gr', 'Papel bond blanco tamaño A4, 75 gramos, paquete x 500 hojas', 'PAPELERIA', 'PAQUETE', 12.50, 50, 0, true),
('PROD002', 'Lapicero Azul Faber Castell', 'Lapicero tinta azul, punta fina 0.7mm', 'PAPELERIA', 'UNIDAD', 1.50, 200, 0, true),
('PROD003', 'Archivador Lomo Ancho', 'Archivador palanca lomo ancho tamaño A4', 'PAPELERIA', 'UNIDAD', 8.90, 30, 0, true),

-- Tecnología
('PROD004', 'Mouse Inalámbrico Logitech M185', 'Mouse óptico inalámbrico, 2.4GHz, negro', 'TECNOLOGIA', 'UNIDAD', 35.00, 20, 0, true),
('PROD005', 'Teclado USB HP K1500', 'Teclado estándar USB, negro, español', 'TECNOLOGIA', 'UNIDAD', 45.00, 15, 0, true),
('PROD006', 'Monitor LED 24" LG', 'Monitor LED 24 pulgadas Full HD, HDMI', 'TECNOLOGIA', 'UNIDAD', 650.00, 5, 0, true),

-- Limpieza
('PROD007', 'Desinfectante Pino 1L', 'Desinfectante aroma pino, presentación 1 litro', 'LIMPIEZA', 'LITRO', 8.50, 40, 0, true),
('PROD008', 'Papel Higiénico Elite x24', 'Papel higiénico doble hoja, paquete x 24 rollos', 'LIMPIEZA', 'PAQUETE', 22.00, 20, 0, true),
('PROD009', 'Escoba de Paja', 'Escoba de paja natural con mango de madera', 'LIMPIEZA', 'UNIDAD', 12.00, 15, 0, true),

-- Mobiliario
('PROD010', 'Silla Giratoria Oficina', 'Silla giratoria con respaldo alto, brazos fijos', 'MOBILIARIO', 'UNIDAD', 280.00, 5, 0, true),
('PROD011', 'Escritorio Melamina 120x60', 'Escritorio melamina color cerezo 120x60cm', 'MOBILIARIO', 'UNIDAD', 350.00, 3, 0, true),
('PROD012', 'Estante Metálico 5 Niveles', 'Estante metálico gris 180x90x40cm, 5 niveles', 'MOBILIARIO', 'UNIDAD', 420.00, 3, 0, true),

-- Herramientas
('PROD013', 'Destornillador Plano 6"', 'Destornillador punta plana 6 pulgadas', 'HERRAMIENTAS', 'UNIDAD', 15.00, 10, 0, true),
('PROD014', 'Martillo Carpintero 16oz', 'Martillo de acero con mango de fibra de vidrio', 'HERRAMIENTAS', 'UNIDAD', 35.00, 8, 0, true),
('PROD015', 'Taladro Inalámbrico Bosch', 'Taladro percutor inalámbrico 12V, incluye batería', 'HERRAMIENTAS', 'UNIDAD', 320.00, 2, 0, true);

-- ============================================================================
-- 4. NOTAS DE INGRESO
-- ============================================================================
INSERT INTO nota_ingreso (numero, tipo_ingreso, proveedor_nombre, proveedor_ruc, fecha_ingreso, observaciones, total, estado, usuario_registra) VALUES
('NI-2026-001', 'COMPRA', 'Distribuidora Papelera SAC', '20456789123', '2026-01-15 09:30:00', 'Compra mensual de papelería', 2150.00, 'CONFIRMADO', 'jperez'),
('NI-2026-002', 'COMPRA', 'Tech Solutions Peru', '20567891234', '2026-01-18 14:20:00', 'Equipos de cómputo para área administrativa', 4850.00, 'CONFIRMADO', 'jperez'),
('NI-2026-003', 'COMPRA', 'Limpieza Total SAC', '20678912345', '2026-01-22 10:15:00', 'Productos de limpieza trimestre I', 1580.00, 'CONFIRMADO', 'mlopez'),
('NI-2026-004', 'DONACION', 'ONG Ayuda Social', '20789123456', '2026-01-25 11:00:00', 'Donación mobiliario oficina', 0.00, 'CONFIRMADO', 'mlopez'),
('NI-2026-005', 'COMPRA', 'Ferretería Industrial SAC', '20891234567', '2026-01-28 08:45:00', 'Herramientas varias', 1250.00, 'PENDIENTE', 'jperez');

-- ============================================================================
-- 5. DETALLES DE NOTAS DE INGRESO Y LOTES
-- ============================================================================
-- Nota NI-2026-001 (Papelería)
INSERT INTO nota_ingreso_detalle (nota_ingreso_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 100, 12.50, 1250.00),
(1, 2, 500, 1.50, 750.00),
(1, 3, 15, 8.90, 133.50);

INSERT INTO lote (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, nota_ingreso_id, estado) VALUES
('LT-2026-001', 1, 100, 100, '2026-01-15', NULL, 1, 'DISPONIBLE'),
('LT-2026-002', 2, 500, 500, '2026-01-15', NULL, 1, 'DISPONIBLE'),
('LT-2026-003', 3, 15, 15, '2026-01-15', NULL, 1, 'DISPONIBLE');

-- Nota NI-2026-002 (Tecnología)
INSERT INTO nota_ingreso_detalle (nota_ingreso_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(2, 4, 30, 35.00, 1050.00),
(2, 5, 25, 45.00, 1125.00),
(2, 6, 4, 650.00, 2600.00);

INSERT INTO lote (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, nota_ingreso_id, estado) VALUES
('LT-2026-004', 4, 30, 30, '2026-01-18', NULL, 2, 'DISPONIBLE'),
('LT-2026-005', 5, 25, 25, '2026-01-18', NULL, 2, 'DISPONIBLE'),
('LT-2026-006', 6, 4, 4, '2026-01-18', NULL, 2, 'DISPONIBLE');

-- Nota NI-2026-003 (Limpieza)
INSERT INTO nota_ingreso_detalle (nota_ingreso_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(3, 7, 80, 8.50, 680.00),
(3, 8, 35, 22.00, 770.00),
(3, 9, 10, 12.00, 120.00);

INSERT INTO lote (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, nota_ingreso_id, estado) VALUES
('LT-2026-007', 7, 80, 80, '2026-01-22', '2027-01-22', 3, 'DISPONIBLE'),
('LT-2026-008', 8, 35, 35, '2026-01-22', NULL, 3, 'DISPONIBLE'),
('LT-2026-009', 9, 10, 10, '2026-01-22', NULL, 3, 'DISPONIBLE');

-- Nota NI-2026-004 (Mobiliario - Donación)
INSERT INTO nota_ingreso_detalle (nota_ingreso_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(4, 10, 8, 0.00, 0.00),
(4, 11, 5, 0.00, 0.00);

INSERT INTO lote (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, nota_ingreso_id, estado) VALUES
('LT-2026-010', 10, 8, 8, '2026-01-25', NULL, 4, 'DISPONIBLE'),
('LT-2026-011', 11, 5, 5, '2026-01-25', NULL, 4, 'DISPONIBLE');

-- Nota NI-2026-005 (Herramientas - Pendiente)
INSERT INTO nota_ingreso_detalle (nota_ingreso_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(5, 13, 20, 15.00, 300.00),
(5, 14, 15, 35.00, 525.00),
(5, 15, 2, 320.00, 640.00);

INSERT INTO lote (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, nota_ingreso_id, estado) VALUES
('LT-2026-012', 13, 20, 20, '2026-01-28', NULL, 5, 'DISPONIBLE'),
('LT-2026-013', 14, 15, 15, '2026-01-28', NULL, 5, 'DISPONIBLE'),
('LT-2026-014', 15, 2, 2, '2026-01-28', NULL, 5, 'DISPONIBLE');

-- ============================================================================
-- 6. ACTAS DE RECEPCIÓN
-- ============================================================================
INSERT INTO acta_recepcion (numero, nota_ingreso_id, fecha_recepcion, responsable_entrega, responsable_recepcion, estado_mercancia, observaciones, estado, usuario_registra) VALUES
('AR-2026-001', 1, '2026-01-15 10:00:00', 'José Ramírez - Dist. Papelera', 'Juan Pérez', 'CONFORME', 'Mercadería en buen estado, embalaje íntegro', 'APROBADO', 'cgarcia'),
('AR-2026-002', 2, '2026-01-18 15:00:00', 'Miguel Torres - Tech Solutions', 'Juan Pérez', 'CONFORME', 'Equipos sellados, sin daños externos', 'APROBADO', 'cgarcia'),
('AR-2026-003', 3, '2026-01-22 11:00:00', 'Carmen Díaz - Limpieza Total', 'María López', 'CONFORME', 'Productos con fecha de vencimiento vigente', 'APROBADO', 'cgarcia');

-- ============================================================================
-- 7. DETALLES DE ACTAS DE RECEPCIÓN
-- ============================================================================
-- Acta AR-2026-001
INSERT INTO acta_recepcion_detalle (acta_recepcion_id, producto_id, cantidad_esperada, cantidad_recibida, diferencia, estado_producto, observaciones) VALUES
(1, 1, 100, 100, 0, 'CONFORME', 'Paquetes completos y sellados'),
(1, 2, 500, 500, 0, 'CONFORME', 'Cajas sin abrir'),
(1, 3, 15, 15, 0, 'CONFORME', 'Archivadores en buen estado');

-- Acta AR-2026-002
INSERT INTO acta_recepcion_detalle (acta_recepcion_id, producto_id, cantidad_esperada, cantidad_recibida, diferencia, estado_producto, observaciones) VALUES
(2, 4, 30, 30, 0, 'CONFORME', 'Equipos sellados con garantía'),
(2, 5, 25, 25, 0, 'CONFORME', 'Teclados nuevos en caja'),
(2, 6, 4, 4, 0, 'CONFORME', 'Monitores sin daños, funcionando');

-- Acta AR-2026-003
INSERT INTO acta_recepcion_detalle (acta_recepcion_id, producto_id, cantidad_esperada, cantidad_recibida, diferencia, estado_producto, observaciones) VALUES
(3, 7, 80, 80, 0, 'CONFORME', 'Fecha vencimiento: 01/2027'),
(3, 8, 35, 35, 0, 'CONFORME', 'Paquetes completos'),
(3, 9, 10, 10, 0, 'CONFORME', 'Escobas en buen estado');

-- ============================================================================
-- 8. NOTAS DE SALIDA
-- ============================================================================
INSERT INTO nota_salida (numero, tipo_salida, cliente_id, area_destino, solicitante, fecha_salida, observaciones, total, estado, usuario_registra) VALUES
('NS-2026-001', 'ENTREGA', 2, 'ADMINISTRACION', 'Dr. Ricardo Flores - Jefe Administrativo', '2026-01-16 09:00:00', 'Material de oficina mensual', 875.00, 'ENTREGADO', 'jperez'),
('NS-2026-002', 'ENTREGA', 3, 'RECTORADO', 'Lic. Patricia Vega - Asistente Rectorado', '2026-01-19 10:30:00', 'Equipamiento oficina rectorado', 1825.00, 'ENTREGADO', 'mlopez'),
('NS-2026-003', 'BAJA', NULL, 'ALMACEN', 'Carlos García - Supervisor', '2026-01-23 14:00:00', 'Productos en mal estado', 0.00, 'PROCESADO', 'cgarcia'),
('NS-2026-004', 'ENTREGA', 5, 'LIMPIEZA', 'Sr. Roberto Chávez - Jefe de Limpieza', '2026-01-24 08:00:00', 'Productos de limpieza mensual', 425.00, 'ENTREGADO', 'mlopez'),
('NS-2026-005', 'ENTREGA', 4, 'MANTENIMIENTO', 'Ing. Luis Castillo - Jefe Mantenimiento', '2026-01-29 11:00:00', 'Herramientas para reparaciones', 380.00, 'PENDIENTE', 'jperez');

-- ============================================================================
-- 9. DETALLES DE NOTAS DE SALIDA
-- ============================================================================
-- Salida NS-2026-001
INSERT INTO nota_salida_detalle (nota_salida_id, producto_id, lote_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 1, 50, 12.50, 625.00),
(1, 2, 2, 100, 1.50, 150.00),
(1, 3, 3, 10, 8.90, 89.00);

-- Salida NS-2026-002
INSERT INTO nota_salida_detalle (nota_salida_id, producto_id, lote_id, cantidad, precio_unitario, subtotal) VALUES
(2, 4, 4, 15, 35.00, 525.00),
(2, 5, 5, 10, 45.00, 450.00),
(2, 6, 6, 1, 650.00, 650.00);

-- Salida NS-2026-003 (Baja)
INSERT INTO nota_salida_detalle (nota_salida_id, producto_id, lote_id, cantidad, precio_unitario, subtotal) VALUES
(3, 2, 2, 10, 0.00, 0.00);

-- Salida NS-2026-004
INSERT INTO nota_salida_detalle (nota_salida_id, producto_id, lote_id, cantidad, precio_unitario, subtotal) VALUES
(4, 7, 7, 30, 8.50, 255.00),
(4, 8, 8, 5, 22.00, 110.00),
(4, 9, 9, 5, 12.00, 60.00);

-- Salida NS-2026-005 (Pendiente)
INSERT INTO nota_salida_detalle (nota_salida_id, producto_id, lote_id, cantidad, precio_unitario, subtotal) VALUES
(5, 13, 12, 10, 15.00, 150.00),
(5, 14, 13, 5, 35.00, 175.00);

-- ============================================================================
-- 10. AJUSTES DE STOCK
-- ============================================================================
INSERT INTO ajuste_stock (tipo_ajuste, producto_id, lote_id, cantidad, motivo, observaciones, fecha_ajuste, usuario_registra) VALUES
('INVENTARIO', 1, 1, -2, 'INVENTARIO_FISICO', 'Diferencia detectada en inventario físico mensual', '2026-01-27 16:00:00', 'cgarcia'),
('DANO', 2, 2, -5, 'PRODUCTO_DANADO', 'Lapiceros con defecto de fabricación', '2026-01-27 16:15:00', 'cgarcia'),
('VENCIMIENTO', 7, 7, -3, 'PRODUCTO_VENCIDO', 'Producto próximo a vencer, retirado preventivamente', '2026-01-28 09:00:00', 'mlopez');

-- ============================================================================
-- 11. KARDEX (Generado automáticamente por triggers, aquí ejemplos manuales)
-- ============================================================================
INSERT INTO kardex (producto_id, lote_id, tipo_movimiento, tipo_operacion, documento_referencia, cantidad, stock_anterior, stock_nuevo, fecha_movimiento, usuario_registra) VALUES
-- Ingresos NI-2026-001
(1, 1, 'INGRESO', 'COMPRA', 'NI-2026-001', 100, 0, 100, '2026-01-15 09:30:00', 'jperez'),
(2, 2, 'INGRESO', 'COMPRA', 'NI-2026-001', 500, 0, 500, '2026-01-15 09:30:00', 'jperez'),
(3, 3, 'INGRESO', 'COMPRA', 'NI-2026-001', 15, 0, 15, '2026-01-15 09:30:00', 'jperez'),

-- Salidas NS-2026-001
(1, 1, 'SALIDA', 'ENTREGA', 'NS-2026-001', 50, 100, 50, '2026-01-16 09:00:00', 'jperez'),
(2, 2, 'SALIDA', 'ENTREGA', 'NS-2026-001', 100, 500, 400, '2026-01-16 09:00:00', 'jperez'),
(3, 3, 'SALIDA', 'ENTREGA', 'NS-2026-001', 10, 15, 5, '2026-01-16 09:00:00', 'jperez'),

-- Ingresos NI-2026-002
(4, 4, 'INGRESO', 'COMPRA', 'NI-2026-002', 30, 0, 30, '2026-01-18 14:20:00', 'jperez'),
(5, 5, 'INGRESO', 'COMPRA', 'NI-2026-002', 25, 0, 25, '2026-01-18 14:20:00', 'jperez'),
(6, 6, 'INGRESO', 'COMPRA', 'NI-2026-002', 4, 0, 4, '2026-01-18 14:20:00', 'jperez'),

-- Salidas NS-2026-002
(4, 4, 'SALIDA', 'ENTREGA', 'NS-2026-002', 15, 30, 15, '2026-01-19 10:30:00', 'mlopez'),
(5, 5, 'SALIDA', 'ENTREGA', 'NS-2026-002', 10, 25, 15, '2026-01-19 10:30:00', 'mlopez'),
(6, 6, 'SALIDA', 'ENTREGA', 'NS-2026-002', 1, 4, 3, '2026-01-19 10:30:00', 'mlopez'),

-- Ingresos NI-2026-003
(7, 7, 'INGRESO', 'COMPRA', 'NI-2026-003', 80, 0, 80, '2026-01-22 10:15:00', 'mlopez'),
(8, 8, 'INGRESO', 'COMPRA', 'NI-2026-003', 35, 0, 35, '2026-01-22 10:15:00', 'mlopez'),
(9, 9, 'INGRESO', 'COMPRA', 'NI-2026-003', 10, 0, 10, '2026-01-22 10:15:00', 'mlopez'),

-- Salida baja NS-2026-003
(2, 2, 'SALIDA', 'BAJA', 'NS-2026-003', 10, 400, 390, '2026-01-23 14:00:00', 'cgarcia'),

-- Salidas NS-2026-004
(7, 7, 'SALIDA', 'ENTREGA', 'NS-2026-004', 30, 80, 50, '2026-01-24 08:00:00', 'mlopez'),
(8, 8, 'SALIDA', 'ENTREGA', 'NS-2026-004', 5, 35, 30, '2026-01-24 08:00:00', 'mlopez'),
(9, 9, 'SALIDA', 'ENTREGA', 'NS-2026-004', 5, 10, 5, '2026-01-24 08:00:00', 'mlopez'),

-- Ajustes
(1, 1, 'AJUSTE', 'INVENTARIO', 'AJ-2026-001', -2, 50, 48, '2026-01-27 16:00:00', 'cgarcia'),
(2, 2, 'AJUSTE', 'DANO', 'AJ-2026-002', -5, 390, 385, '2026-01-27 16:15:00', 'cgarcia'),
(7, 7, 'AJUSTE', 'VENCIMIENTO', 'AJ-2026-003', -3, 50, 47, '2026-01-28 09:00:00', 'mlopez');

-- ============================================================================
-- 12. ACTUALIZAR STOCK EN PRODUCTOS
-- ============================================================================
UPDATE producto SET stock_actual = 48 WHERE id = 1;
UPDATE producto SET stock_actual = 385 WHERE id = 2;
UPDATE producto SET stock_actual = 5 WHERE id = 3;
UPDATE producto SET stock_actual = 15 WHERE id = 4;
UPDATE producto SET stock_actual = 15 WHERE id = 5;
UPDATE producto SET stock_actual = 3 WHERE id = 6;
UPDATE producto SET stock_actual = 47 WHERE id = 7;
UPDATE producto SET stock_actual = 30 WHERE id = 8;
UPDATE producto SET stock_actual = 5 WHERE id = 9;
UPDATE producto SET stock_actual = 8 WHERE id = 10;
UPDATE producto SET stock_actual = 5 WHERE id = 11;
UPDATE producto SET stock_actual = 0 WHERE id = 12;
UPDATE producto SET stock_actual = 20 WHERE id = 13;
UPDATE producto SET stock_actual = 15 WHERE id = 14;
UPDATE producto SET stock_actual = 2 WHERE id = 15;

-- ============================================================================
-- 13. ACTUALIZAR CANTIDAD ACTUAL EN LOTES
-- ============================================================================
UPDATE lote SET cantidad_actual = 48 WHERE id = 1;
UPDATE lote SET cantidad_actual = 385 WHERE id = 2;
UPDATE lote SET cantidad_actual = 5 WHERE id = 3;
UPDATE lote SET cantidad_actual = 15 WHERE id = 4;
UPDATE lote SET cantidad_actual = 15 WHERE id = 5;
UPDATE lote SET cantidad_actual = 3 WHERE id = 6;
UPDATE lote SET cantidad_actual = 47 WHERE id = 7;
UPDATE lote SET cantidad_actual = 30 WHERE id = 8;
UPDATE lote SET cantidad_actual = 5 WHERE id = 9;

-- ============================================================================
-- RESUMEN DE DATOS CARGADOS
-- ============================================================================
SELECT 'RESUMEN DE CARGA DE DATOS' as '';
SELECT '=========================' as '';
SELECT CONCAT('Usuarios: ', COUNT(*)) as 'Total' FROM usuario;
SELECT CONCAT('Clientes: ', COUNT(*)) as 'Total' FROM cliente;
SELECT CONCAT('Productos: ', COUNT(*)) as 'Total' FROM producto;
SELECT CONCAT('Notas Ingreso: ', COUNT(*)) as 'Total' FROM nota_ingreso;
SELECT CONCAT('Lotes: ', COUNT(*)) as 'Total' FROM lote;
SELECT CONCAT('Actas Recepción: ', COUNT(*)) as 'Total' FROM acta_recepcion;
SELECT CONCAT('Notas Salida: ', COUNT(*)) as 'Total' FROM nota_salida;
SELECT CONCAT('Ajustes Stock: ', COUNT(*)) as 'Total' FROM ajuste_stock;
SELECT CONCAT('Movimientos Kardex: ', COUNT(*)) as 'Total' FROM kardex;

SELECT '' as '';
SELECT '✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE' as '';
SELECT '' as '';
SELECT 'Credenciales de acceso:' as '';
SELECT '  Usuario: admin | Password: password123' as '';
SELECT '  Usuario: jperez | Password: password123' as '';
SELECT '  Usuario: mlopez | Password: password123' as '';
