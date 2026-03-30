-- Deduplicación de productos para proveedor AFECORP.
-- Mantiene el registro con menor id por grupo y remapea FKs antes de borrar duplicados.
-- Ejecutar con:
--   set -a && source apps/api/.env && set +a
--   psql -w "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/deduplicar_productos_afecorp.sql

BEGIN;

-- 1) Detectar duplicados de AFECORP por identidad funcional del producto
CREATE TEMP TABLE tmp_afecorp_dupes AS
WITH ranked AS (
    SELECT
        p.id,
        MIN(p.id) OVER (
            PARTITION BY
                UPPER(TRIM(COALESCE(p.proveedor, ''))),
                UPPER(TRIM(COALESCE(p.codigo, ''))),
                UPPER(TRIM(COALESCE(p.descripcion, ''))),
                UPPER(TRIM(COALESCE(p.numero_documento, ''))),
                UPPER(TRIM(COALESCE(p.registro_sanitario, ''))),
                UPPER(TRIM(COALESCE(p.lote, '')))
        ) AS keep_id,
        ROW_NUMBER() OVER (
            PARTITION BY
                UPPER(TRIM(COALESCE(p.proveedor, ''))),
                UPPER(TRIM(COALESCE(p.codigo, ''))),
                UPPER(TRIM(COALESCE(p.descripcion, ''))),
                UPPER(TRIM(COALESCE(p.numero_documento, ''))),
                UPPER(TRIM(COALESCE(p.registro_sanitario, ''))),
                UPPER(TRIM(COALESCE(p.lote, '')))
            ORDER BY p.id
        ) AS rn
    FROM productos p
    WHERE UPPER(COALESCE(p.proveedor, '')) LIKE '%AFECORP%'
)
SELECT id AS duplicate_id, keep_id
FROM ranked
WHERE rn > 1;

DO $$
DECLARE
    v_dupes INT;
BEGIN
    SELECT COUNT(*) INTO v_dupes FROM tmp_afecorp_dupes;
    RAISE NOTICE 'Duplicados AFECORP detectados: %', v_dupes;
END $$;

-- 2) Remapear llaves foráneas que apuntan a producto_id
UPDATE lotes l
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE l.producto_id = d.duplicate_id;

UPDATE kardex k
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE k.producto_id = d.duplicate_id;

UPDATE ajustes_stock a
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE a.producto_id = d.duplicate_id;

UPDATE alertas_vencimiento av
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE av.producto_id = d.duplicate_id;

UPDATE nota_ingreso_detalles nid
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE nid.producto_id = d.duplicate_id;

UPDATE nota_salida_detalles nsd
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE nsd.producto_id = d.duplicate_id;

UPDATE actas_recepcion_detalles ard
SET producto_id = d.keep_id
FROM tmp_afecorp_dupes d
WHERE ard.producto_id = d.duplicate_id;

-- 3) Eliminar productos duplicados ya remapeados
DELETE FROM productos p
USING tmp_afecorp_dupes d
WHERE p.id = d.duplicate_id;

-- 4) Resumen
DO $$
DECLARE
    v_remaining INT;
BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM productos p
    WHERE UPPER(COALESCE(p.proveedor, '')) LIKE '%AFECORP%';

    RAISE NOTICE 'Productos AFECORP restantes (post-dedup): %', v_remaining;
END $$;

COMMIT;
