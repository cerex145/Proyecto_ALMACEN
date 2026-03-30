DO $$
BEGIN
    -- Si la columna existe como numérica, convertirla a texto con formato guia-000000x
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notas_ingreso'
          AND column_name = 'numero_guia'
          AND data_type IN ('smallint', 'integer', 'bigint')
    ) THEN
        ALTER TABLE notas_ingreso
        ALTER COLUMN numero_guia TYPE VARCHAR(20)
        USING ('guia-' || LPAD(numero_guia::text, 7, '0'));
    END IF;
END $$;

-- Normalizar datos existentes que no cumplan el patrón final
UPDATE notas_ingreso
SET numero_guia = 'guia-' || LPAD(REGEXP_REPLACE(numero_guia, '\\D', '', 'g'), 7, '0')
WHERE numero_guia IS NOT NULL
  AND numero_guia !~ '^guia-[0-9]{7}$'
  AND REGEXP_REPLACE(numero_guia, '\\D', '', 'g') <> '';
