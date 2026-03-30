#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

set -a
source apps/api/.env
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL no está definido en apps/api/.env"
  exit 1
fi

ts="$(date +%Y%m%d_%H%M%S)"
backup_file="backups/afecorp_dedup_pre_${ts}.sql"

mkdir -p backups

echo "[1/3] Generando backup de tablas críticas..."
pg_dump "$DATABASE_URL" -Fc -f "$backup_file" -t productos -t lotes -t kardex -t ajustes_stock -t alertas_vencimiento -t nota_ingreso_detalles -t nota_salida_detalles -t actas_recepcion_detalles

echo "[2/3] Ejecutando deduplicación AFECORP..."
psql -w "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/deduplicar_productos_afecorp.sql

echo "[3/3] Verificando posibles duplicados remanentes de AFECORP..."
psql -w "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
WITH g AS (
  SELECT
    UPPER(TRIM(COALESCE(proveedor, ''))) AS proveedor_k,
    UPPER(TRIM(COALESCE(codigo, ''))) AS codigo_k,
    UPPER(TRIM(COALESCE(descripcion, ''))) AS descripcion_k,
    UPPER(TRIM(COALESCE(numero_documento, ''))) AS nro_doc_k,
    UPPER(TRIM(COALESCE(registro_sanitario, ''))) AS rs_k,
    UPPER(TRIM(COALESCE(lote, ''))) AS lote_k,
    COUNT(*) AS c
  FROM productos
  WHERE UPPER(COALESCE(proveedor, '')) LIKE '%AFECORP%'
  GROUP BY 1,2,3,4,5,6
)
SELECT COALESCE(SUM(CASE WHEN c > 1 THEN 1 ELSE 0 END), 0) AS grupos_duplicados_restantes
FROM g;
"

echo "OK. Backup generado en: $backup_file"
