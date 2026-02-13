-- Migration: Add responsable fields to actas_recepcion table
-- Date: 2026-02-13

ALTER TABLE actas_recepcion
ADD COLUMN responsable_recepcion VARCHAR(255),
ADD COLUMN responsable_entrega VARCHAR(255),
ADD COLUMN jefe_almacen VARCHAR(255);
