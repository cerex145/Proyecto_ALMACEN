-- Agregar campo persona_contacto a la tabla clientes
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS persona_contacto VARCHAR(200) NULL;
