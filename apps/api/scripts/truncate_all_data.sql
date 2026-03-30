-- ============================================================
-- Script para limpiar TODOS los datos de la base de datos
-- Preserva la estructura de tablas y columnas
-- ============================================================

BEGIN TRANSACTION;

-- Desactivar controles de foreign keys temporalmente
SET CONSTRAINTS ALL DEFERRED;

-- Truncate todas las tablas en orden (las que no tienen FK primero)
TRUNCATE TABLE roles RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;
TRUNCATE TABLE productos RESTART IDENTITY CASCADE;
TRUNCATE TABLE ajustes RESTART IDENTITY CASCADE;
TRUNCATE TABLE lotes RESTART IDENTITY CASCADE;
TRUNCATE TABLE notas_ingreso RESTART IDENTITY CASCADE;
TRUNCATE TABLE nota_ingreso_detalles RESTART IDENTITY CASCADE;
TRUNCATE TABLE notas_salida RESTART IDENTITY CASCADE;
TRUNCATE TABLE nota_salida_detalles RESTART IDENTITY CASCADE;
TRUNCATE TABLE actas_recepcion RESTART IDENTITY CASCADE;
TRUNCATE TABLE acta_recepcion_detalles RESTART IDENTITY CASCADE;
TRUNCATE TABLE alertas RESTART IDENTITY CASCADE;
TRUNCATE TABLE kardex RESTART IDENTITY CASCADE;
TRUNCATE TABLE logs RESTART IDENTITY CASCADE;

-- Reactivar controles de foreign keys
SET CONSTRAINTS ALL IMMEDIATE;

COMMIT;

-- Confirmación
SELECT 'Base de datos limpiada: todas las tablas vaciadas ✅' AS resultado;
