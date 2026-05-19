/**
 * SCRIPT DE LIMPIEZA TOTAL - Supabase/PostgreSQL
 * Elimina: kardex, lotes, notas_ingreso, notas_salida, detalles, actas, ajustes, alertas
 * Conserva: clientes, usuarios, roles, productos
 */

const { Client } = require('pg');

const DB_URL = 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

async function borrarTabla(client, tabla) {
  try {
    const res = await client.query(`DELETE FROM ${tabla}`);
    console.log(`  ✓ ${tabla}: ${res.rowCount} registros eliminados`);
  } catch (e) {
    console.log(`  ⚠ ${tabla}: ${e.message}`);
  }
}

async function limpiarBD() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a Supabase\n');

    // Conteo ANTES
    console.log('📊 CONTEO ANTES DE LIMPIAR:');
    const tablasCheck = ['kardex', 'lotes', 'notas_ingreso', 'notas_salida', 
                         'nota_ingreso_detalles', 'nota_salida_detalles',
                         'actas_recepcion', 'actas_recepcion_detalles',
                         'ajustes_stock', 'alertas_vencimiento', 'auditorias'];
    for (const t of tablasCheck) {
      const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  - ${t}: ${r.rows[0].count} registros`);
    }

    console.log('\n🗑️  INICIANDO LIMPIEZA (cada tabla en su propia transacción)...\n');

    // Orden correcto FK: primero hijos, luego padres
    // Nivel 3 - hojas
    await borrarTabla(client, 'alertas_vencimiento');
    await borrarTabla(client, 'auditorias');
    await borrarTabla(client, 'ajustes_stock');
    await borrarTabla(client, 'kardex');
    await borrarTabla(client, 'actas_recepcion_detalles');
    await borrarTabla(client, 'nota_ingreso_detalles');
    await borrarTabla(client, 'nota_salida_detalles');
    await borrarTabla(client, 'lotes');

    // Nivel 2 - padres intermedios
    await borrarTabla(client, 'actas_recepcion');
    await borrarTabla(client, 'notas_salida');
    await borrarTabla(client, 'notas_ingreso');

    // Resetear stock en productos
    try {
      const res = await client.query(`UPDATE productos SET stock_actual = 0`);
      console.log(`  ✓ productos.stock_actual: reseteado a 0 en ${res.rowCount} productos`);
    } catch (e) {
      console.log(`  ⚠ reset stock: ${e.message}`);
    }

    // Conteo FINAL
    console.log('\n📊 CONTEO DESPUÉS DE LIMPIAR:');
    for (const t of tablasCheck) {
      const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  - ${t}: ${r.rows[0].count} registros`);
    }

    // Verificar lo que se conservó
    console.log('\n✅ CONSERVADO:');
    const conservadas = ['clientes', 'usuarios', 'roles', 'productos'];
    for (const t of conservadas) {
      const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  👥 ${t}: ${r.rows[0].count} registros`);
    }

    console.log('\n🎉 ¡LIMPIEZA COMPLETADA CON ÉXITO!');

  } catch (err) {
    console.error('\n❌ ERROR CRÍTICO:', err.message);
  } finally {
    await client.end();
  }
}

limpiarBD();
