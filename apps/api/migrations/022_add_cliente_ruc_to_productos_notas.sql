-- Migracion 022: agregar cliente_ruc para trazabilidad por RUC en productos y notas.

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS cliente_ruc VARCHAR(20);

ALTER TABLE notas_ingreso
ADD COLUMN IF NOT EXISTS cliente_ruc VARCHAR(20);

ALTER TABLE notas_salida
ADD COLUMN IF NOT EXISTS cliente_ruc VARCHAR(20);

-- Backfill desde cliente_id cuando exista relación.
UPDATE productos p
SET cliente_ruc = c.cuit
FROM clientes c
WHERE p.cliente_id = c.id
  AND (p.cliente_ruc IS NULL OR p.cliente_ruc = '');

UPDATE notas_ingreso ni
SET cliente_ruc = c.cuit
FROM clientes c
WHERE ni.cliente_id = c.id
  AND (ni.cliente_ruc IS NULL OR ni.cliente_ruc = '');

UPDATE notas_salida ns
SET cliente_ruc = c.cuit
FROM clientes c
WHERE ns.cliente_id = c.id
  AND (ns.cliente_ruc IS NULL OR ns.cliente_ruc = '');

-- Backfill adicional en productos desde proveedor_ruc legado.
UPDATE productos
SET cliente_ruc = proveedor_ruc
WHERE (cliente_ruc IS NULL OR cliente_ruc = '')
  AND proveedor_ruc IS NOT NULL
  AND proveedor_ruc <> '';

CREATE INDEX IF NOT EXISTS idx_productos_cliente_ruc ON productos(cliente_ruc);
CREATE INDEX IF NOT EXISTS idx_notas_ingreso_cliente_ruc ON notas_ingreso(cliente_ruc);
CREATE INDEX IF NOT EXISTS idx_notas_salida_cliente_ruc ON notas_salida(cliente_ruc);
