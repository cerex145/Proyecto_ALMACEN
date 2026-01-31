-- Datos de prueba para almacen_db
USE almacen_db;
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

SET FOREIGN_KEY_CHECKS = 1;

-- ROLES
INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN', 'Administrador'),
('ALMACENERO', 'Personal de almacén'),
('SUPERVISOR', 'Supervisor'),
('CONSULTOR', 'Consulta');

-- USUARIOS
INSERT INTO usuarios (username, password_hash, nombre_completo, email, rol_id, activo) VALUES
('admin', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Admin', 'admin@almacen.com', 1, true),
('jperez', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Juan Pérez', 'j@almacen.com', 2, true),
('mlopez', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'María López', 'm@almacen.com', 2, true),
('cgarcia', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Carlos García', 'c@almacen.com', 3, true),
('aruiz', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Ana Ruiz', 'a@almacen.com', 4, true);

-- PROVEEDORES
INSERT INTO proveedores (ruc, razon_social, contacto, telefono, email, direccion) VALUES
('20456789123', 'Papelera SAC', 'José', '555-1234', 'p@papelera.com', 'Av. Industrial'),
('20567891234', 'Tech Solutions', 'Miguel', '555-2345', 'v@tech.com', 'Av. Tecnológica'),
('20678912345', 'Limpieza Total', 'Carmen', '555-3456', 'p@limpieza.com', 'Av. Comercial'),
('20789123456', 'ONG Ayuda', 'Roberto', '555-4567', 'c@ong.org', 'Calle Social'),
('20891234567', 'Ferretería', 'Luis', '555-5678', 'v@ferreteria.com', 'Av. Industrial');

-- CLIENTES
INSERT INTO clientes (codigo, ruc, razon_social, nombre_comercial, contacto, telefono, email, direccion) VALUES
('CLI001', '20131377882', 'Municipalidad Lima', 'Municipio', 'Rafael', '315', 'c@munlima.gob.pe', 'Av. Nicolás'),
('CLI002', '20131368924', 'Hospital Dos de Mayo', 'Hospital', 'Rosa', '328', 'g@hospital.gob.pe', 'Av. Grau'),
('CLI003', '20154800675', 'Universidad SM', 'UNMSM', 'Patricia', '619', 'r@unmsm.edu.pe', 'Av. Universitaria'),
('CLI004', '20159974378', 'Poder Judicial', 'PJ', 'Fernando', '410', 'a@pj.gob.pe', 'Av. República'),
('CLI005', '20131312955', 'EsSalud', 'EsSalud', 'Marco', '324', 'a@essalud.gob.pe', 'Av. Grau 800'),
('CLI006', '20131370645', 'Ministerio Edu', 'Minedu', 'Elena', '615', 'c@minedu.gob.pe', 'Calle Comercio'),
('CLI007', '20100152356', 'Sedapal', 'Agua', 'David', '317', 'c@sedapal.com', 'Av. Benavides'),
('CLI008', '20100128218', 'Petroperú', 'Petroperú', 'Carlos', '614', 'a@petroperu.com', 'Av. República');

-- PRODUCTOS
INSERT INTO productos (codigo, descripcion, unidad_medida, stock_actual, stock_minimo) VALUES
('PROD001', 'Papel Bond A4', 'paquete', 100, 50),
('PROD002', 'Lapicero Azul', 'unidad', 500, 200),
('PROD003', 'Archivador A4', 'unidad', 15, 10),
('PROD004', 'Mouse Inalámbrico', 'unidad', 30, 10),
('PROD005', 'Teclado USB', 'unidad', 25, 8),
('PROD006', 'Monitor 24 pulgadas', 'unidad', 4, 2),
('PROD007', 'Desinfectante 1L', 'litro', 80, 30),
('PROD008', 'Papel Higiénico', 'paquete', 35, 15),
('PROD009', 'Escoba de Paja', 'unidad', 10, 5),
('PROD010', 'Silla Giratoria', 'unidad', 8, 3),
('PROD011', 'Escritorio', 'unidad', 5, 2),
('PROD012', 'Estante 5 Niveles', 'unidad', 3, 1),
('PROD013', 'Destornillador', 'unidad', 20, 5),
('PROD014', 'Martillo', 'unidad', 15, 5),
('PROD015', 'Taladro Inalámbrico', 'unidad', 2, 1);

-- INGRESOS
INSERT INTO ingresos (numero_ingreso, fecha, proveedor_id, responsable_id, observaciones, estado) VALUES
('ING-2026-001', '2026-01-15', 1, 2, 'Papelería', 'registrado'),
('ING-2026-002', '2026-01-18', 2, 2, 'Equipos', 'registrado'),
('ING-2026-003', '2026-01-22', 3, 3, 'Limpieza', 'registrado'),
('ING-2026-004', '2026-01-25', 4, 3, 'Donación', 'registrado'),
('ING-2026-005', '2026-01-28', 5, 2, 'Herramientas', 'registrado');

-- DETALLES DE INGRESOS
INSERT INTO detalle_ingreso (ingreso_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 100, 12.50), (1, 2, 500, 1.50), (1, 3, 15, 8.90),
(2, 4, 30, 35.00), (2, 5, 25, 45.00), (2, 6, 4, 650.00),
(3, 7, 80, 8.50), (3, 8, 35, 22.00), (3, 9, 10, 12.00),
(4, 10, 8, 0.00), (4, 11, 5, 0.00),
(5, 13, 20, 15.00), (5, 14, 15, 35.00), (5, 15, 2, 320.00);

-- LOTES
INSERT INTO lotes (codigo, producto_id, cantidad_inicial, cantidad_actual, fecha_ingreso, fecha_vencimiento, ingreso_id, estado) VALUES
('LT-2026-001', 1, 100, 50, '2026-01-15', NULL, 1, 'disponible'),
('LT-2026-002', 2, 500, 400, '2026-01-15', NULL, 1, 'disponible'),
('LT-2026-003', 3, 15, 5, '2026-01-15', NULL, 1, 'disponible'),
('LT-2026-004', 4, 30, 15, '2026-01-18', NULL, 2, 'disponible'),
('LT-2026-005', 5, 25, 15, '2026-01-18', NULL, 2, 'disponible'),
('LT-2026-006', 6, 4, 3, '2026-01-18', NULL, 2, 'disponible'),
('LT-2026-007', 7, 80, 50, '2026-01-22', '2027-01-22', 3, 'disponible'),
('LT-2026-008', 8, 35, 30, '2026-01-22', NULL, 3, 'disponible'),
('LT-2026-009', 9, 10, 5, '2026-01-22', NULL, 3, 'disponible'),
('LT-2026-010', 10, 8, 8, '2026-01-25', NULL, 4, 'disponible'),
('LT-2026-011', 11, 5, 5, '2026-01-25', NULL, 4, 'disponible'),
('LT-2026-012', 13, 20, 20, '2026-01-28', NULL, 5, 'disponible'),
('LT-2026-013', 14, 15, 15, '2026-01-28', NULL, 5, 'disponible'),
('LT-2026-014', 15, 2, 2, '2026-01-28', NULL, 5, 'disponible');

-- ACTAS DE RECEPCIÓN
INSERT INTO actas_recepcion (numero_acta, ingreso_id, fecha_recepcion, responsable_entrega, responsable_recepcion, estado_mercancia, observaciones, estado) VALUES
('ACT-2026-001', 1, '2026-01-15', 'José', 'Juan', 'conforme', 'OK', 'aprobado'),
('ACT-2026-002', 2, '2026-01-18', 'Miguel', 'Juan', 'conforme', 'OK', 'aprobado'),
('ACT-2026-003', 3, '2026-01-22', 'Carmen', 'María', 'conforme', 'OK', 'aprobado');

-- DETALLES DE ACTAS
INSERT INTO detalle_acta (acta_id, producto_id, cantidad_esperada, cantidad_recibida, estado_producto) VALUES
(1, 1, 100, 100, 'conforme'), (1, 2, 500, 500, 'conforme'), (1, 3, 15, 15, 'conforme'),
(2, 4, 30, 30, 'conforme'), (2, 5, 25, 25, 'conforme'), (2, 6, 4, 4, 'conforme'),
(3, 7, 80, 80, 'conforme'), (3, 8, 35, 35, 'conforme'), (3, 9, 10, 10, 'conforme');

-- SALIDAS
INSERT INTO salidas (numero_salida, fecha, cliente_id, responsable_id, tipo_salida, observaciones, estado) VALUES
('SAL-2026-001', '2026-01-16', 2, 2, 'venta', 'Material', 'procesado'),
('SAL-2026-002', '2026-01-19', 3, 3, 'venta', 'Equipo', 'procesado'),
('SAL-2026-003', '2026-01-23', NULL, 4, 'baja', 'Dañados', 'procesado'),
('SAL-2026-004', '2026-01-24', 5, 3, 'venta', 'Limpieza', 'procesado'),
('SAL-2026-005', '2026-01-29', 4, 2, 'venta', 'Herramientas', 'procesado');

-- DETALLES DE SALIDAS
INSERT INTO detalle_salida (salida_id, producto_id, lote_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 50, 12.50), (1, 2, 2, 100, 1.50), (1, 3, 3, 10, 8.90),
(2, 4, 4, 15, 35.00), (2, 5, 5, 10, 45.00), (2, 6, 6, 1, 650.00),
(3, 2, 2, 10, 1.50),
(4, 7, 7, 30, 8.50), (4, 8, 8, 5, 22.00), (4, 9, 9, 5, 12.00),
(5, 13, 12, 10, 15.00), (5, 14, 13, 5, 35.00);

-- AJUSTES
INSERT INTO ajustes (tipo_ajuste, producto_id, lote_id, cantidad, motivo, observaciones, fecha_ajuste, registrado_por) VALUES
('inventario', 1, 1, -2, 'Inventario', 'Diferencia', '2026-01-27', 4),
('dano', 2, 2, -5, 'Dañado', 'Defecto', '2026-01-27', 4),
('vencimiento', 7, 7, -3, 'Vencimiento', 'Retiro', '2026-01-28', 3);

-- RESUMEN
SELECT '✅ DATOS CARGADOS' as '';
