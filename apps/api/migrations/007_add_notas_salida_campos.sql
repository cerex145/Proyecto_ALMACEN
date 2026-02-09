ALTER TABLE notas_salida
    ADD COLUMN tipo_documento VARCHAR(50) NULL,
    ADD COLUMN numero_documento VARCHAR(100) NULL,
    ADD COLUMN fecha_ingreso DATE NULL,
    ADD COLUMN motivo_salida TEXT NULL;
