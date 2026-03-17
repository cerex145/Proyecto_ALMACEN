-- Migración 017: Eliminar fecha_vencimiento de la tabla productos
-- Motivo: La fecha de vencimiento pertenece a los lotes/nota de ingreso,
--         no al producto en sí. Esta información ya se gestiona en
--         nota_ingresos_detalles y en la tabla lotes.

ALTER TABLE productos DROP COLUMN IF EXISTS fecha_vencimiento;
