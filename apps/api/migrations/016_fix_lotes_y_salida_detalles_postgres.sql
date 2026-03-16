-- ============================================================
-- MIGRACIÓN 016 (PostgreSQL / Supabase): Columnas faltantes
-- Fecha: 2026-03-15
-- Descripción: Agrega columnas que la entidad TypeORM necesita
--   pero que podían no existir en la BD. Idempotente.
-- ============================================================

-- lotes: cantidad_ingresada, cantidad_disponible, nota_ingreso_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='lotes' AND column_name='cantidad_ingresada'
  ) THEN
    ALTER TABLE lotes ADD COLUMN cantidad_ingresada DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='lotes' AND column_name='cantidad_disponible'
  ) THEN
    ALTER TABLE lotes ADD COLUMN cantidad_disponible DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='lotes' AND column_name='nota_ingreso_id'
  ) THEN
    ALTER TABLE lotes ADD COLUMN nota_ingreso_id INT;
  END IF;
END $$;

-- nota_salida_detalles: lote_id, precio_unitario, lote_numero, etc.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='lote_id') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN lote_id INT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='precio_unitario') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN precio_unitario DECIMAL(10,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='lote_numero') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN lote_numero VARCHAR(100);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='fecha_vencimiento') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN fecha_vencimiento DATE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='um') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN um VARCHAR(50);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='fabricante') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN fabricante VARCHAR(200);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='cant_bulto') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN cant_bulto DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='cant_caja') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN cant_caja DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='cant_x_caja') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN cant_x_caja DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='cant_fraccion') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN cant_fraccion DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='nota_salida_detalles' AND column_name='cantidad_total') THEN
    ALTER TABLE nota_salida_detalles ADD COLUMN cantidad_total DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

-- nota_ingreso_detalles: Repair cantidad_total = cantidad para registros sin ella
UPDATE nota_ingreso_detalles
SET cantidad_total = cantidad
WHERE (cantidad_total IS NULL OR cantidad_total = 0) AND cantidad > 0;
