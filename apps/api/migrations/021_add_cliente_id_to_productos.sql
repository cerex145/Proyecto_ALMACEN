-- Migracion 021: relacionar productos con clientes
-- Agrega cliente_id (FK a clientes) y proveedor_ruc en productos.

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS cliente_id INT,
ADD COLUMN IF NOT EXISTS proveedor_ruc VARCHAR(20);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'productos'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'fk_productos_cliente'
  ) THEN
    ALTER TABLE productos
    ADD CONSTRAINT fk_productos_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_productos_cliente_id ON productos(cliente_id);
