#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en apps/api/.env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      WITH ing AS (
        SELECT
          producto_id,
          lote_numero,
          SUM(COALESCE(NULLIF(cantidad_total, 0), cantidad, 0)) AS ingreso_total
        FROM nota_ingreso_detalles
        GROUP BY producto_id, lote_numero
      ),
      sal AS (
        SELECT
          producto_id,
          lote_numero,
          SUM(COALESCE(NULLIF(cantidad_total, 0), cantidad, 0)) AS salida_total
        FROM nota_salida_detalles
        GROUP BY producto_id, lote_numero
      ),
      calc AS (
        SELECT
          l.id,
          COALESCE(i.ingreso_total, 0) AS ingreso_total,
          COALESCE(s.salida_total, 0) AS salida_total,
          GREATEST(COALESCE(i.ingreso_total, 0) - COALESCE(s.salida_total, 0), 0) AS disponible
        FROM lotes l
        LEFT JOIN ing i ON i.producto_id = l.producto_id AND i.lote_numero = l.numero_lote
        LEFT JOIN sal s ON s.producto_id = l.producto_id AND s.lote_numero = l.numero_lote
      )
      UPDATE lotes l
      SET
        cantidad_ingresada = calc.ingreso_total,
        cantidad_inicial = calc.ingreso_total,
        cantidad_actual = calc.disponible,
        cantidad_disponible = calc.disponible,
        estado = CASE WHEN calc.disponible <= 0 THEN 'AGOTADO' ELSE 'ACTIVO' END,
        updated_at = NOW()
      FROM calc
      WHERE l.id = calc.id;
    `);

    await client.query(`
      UPDATE productos p
      SET stock_actual = sub.stock
      FROM (
        SELECT producto_id, COALESCE(SUM(COALESCE(cantidad_disponible, 0)), 0) AS stock
        FROM lotes
        GROUP BY producto_id
      ) sub
      WHERE p.id = sub.producto_id;
    `);

    const summaryResult = await client.query(`
      SELECT
        COUNT(*)::int AS total_lotes,
        SUM(COALESCE(cantidad_disponible, 0)) AS stock_total_lotes,
        COUNT(*) FILTER (WHERE COALESCE(cantidad_disponible, 0) > 0)::int AS lotes_con_stock
      FROM lotes;
    `);

    await client.query('COMMIT');

    console.log('✅ Stock reconstruido correctamente.');
    console.log(summaryResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error reconstruyendo stock:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
