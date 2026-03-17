-- Migración 018: Vincular notas_ingreso con clientes
-- Objetivo: asegurar trazabilidad de la nota al cliente real

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'notas_ingreso'
      AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE notas_ingreso
      ADD COLUMN cliente_id INT;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_notas_ingreso_cliente'
  ) THEN
    ALTER TABLE notas_ingreso
      ADD CONSTRAINT fk_notas_ingreso_cliente
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_notas_ingreso_cliente_id ON notas_ingreso(cliente_id);

-- Backfill opcional para históricos: si proveedor coincide con razón social
UPDATE notas_ingreso ni
SET cliente_id = c.id
FROM clientes c
WHERE ni.cliente_id IS NULL
  AND ni.proveedor IS NOT NULL
  AND LOWER(TRIM(ni.proveedor)) = LOWER(TRIM(c.razon_social));
