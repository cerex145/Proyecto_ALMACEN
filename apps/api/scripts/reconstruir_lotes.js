/**
 * RECONSTRUIR LOTES DESDE nota_ingreso_detalles
 * ==============================================
 * 
 * PROBLEMA IDENTIFICADO:
 *   - nota_ingreso_detalles tiene 41,911 unidades ingresadas (el CSV de ingreso fue importado)
 *   - lotes.cantidad_ingresada solo tiene 28,442 (incompleto)
 *   - kardex SALIDAS = 28,409 (correcto)
 *   - Diferencia = 13,469 unidades de ingreso que no se reflejaron en lotes
 *
 * SOLUCIÓN:
 *   1. Actualizar lotes.cantidad_ingresada desde la suma de nota_ingreso_detalles
 *   2. Recalcular lotes.cantidad_disponible = cantidad_ingresada - salidas del kardex
 *   3. Actualizar productos.stock_actual = SUM(lotes.cantidad_disponible)
 *   4. Registrar ingresos en kardex (opcional, solo si no existen)
 *
 * Uso: node reconstruir_lotes.js [--dry-run]
 */
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const AppDataSource = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function reconstruirLotes() {
    const dryRun = process.argv.includes('--dry-run');

    console.log('═'.repeat(70));
    console.log('🏗️   RECONSTRUCCIÓN DE LOTES DESDE NOTAS DE INGRESO');
    console.log('═'.repeat(70));
    console.log(dryRun ? '🔍  DRY-RUN: Sin cambios en BD\n' : '⚠️   MODO REAL: Modificando BD\n');

    await AppDataSource.initialize();
    console.log('✅  Conectado a MySQL\n');

    // ─── Estado inicial ───────────────────────────────────────────────────────
    const [antes] = await AppDataSource.query(`
        SELECT 
            (SELECT COUNT(*) FROM lotes) as lotes_total,
            (SELECT SUM(cantidad_ingresada) FROM lotes) as lotes_ingresada,
            (SELECT SUM(cantidad_disponible) FROM lotes) as lotes_disponible,
            (SELECT SUM(stock_actual) FROM productos) as productos_stock,
            (SELECT SUM(cantidad) FROM nota_ingreso_detalles) as detalles_total,
            (SELECT COUNT(*) FROM nota_ingreso_detalles) as detalles_count
    `);
    console.log('📊  ESTADO ACTUAL:');
    console.log(`   nota_ingreso_detalles : ${antes.detalles_count} filas, ${antes.detalles_total} unidades`);
    console.log(`   lotes.ingresada       : ${antes.lotes_ingresada}`);
    console.log(`   lotes.disponible      : ${antes.lotes_disponible}`);
    console.log(`   productos.stock_total : ${antes.productos_stock}\n`);

    // ─── PASO 1: Calcular lo ingresado por (producto_id + lote_numero) ────────
    console.log('─'.repeat(70));
    console.log('📦  PASO 1: Agrupando ingresos por producto+lote desde nota_ingreso_detalles...');

    const ingresadosPorLote = await AppDataSource.query(`
        SELECT 
            d.producto_id,
            d.lote_numero,
            d.fecha_vencimiento,
            SUM(d.cantidad) as total_ingresado
        FROM nota_ingreso_detalles d
        WHERE d.lote_numero IS NOT NULL AND d.lote_numero != '' AND d.lote_numero != 'S/L'
        GROUP BY d.producto_id, d.lote_numero, d.fecha_vencimiento
        ORDER BY d.producto_id, d.lote_numero
    `);
    console.log(`   Combinaciones producto+lote encontradas: ${ingresadosPorLote.length}\n`);

    // ─── PASO 2: Obtener salidas del kardex por lote_numero ───────────────────
    console.log('──  PASO 2: Obteniendo salidas del kardex por producto+lote...');
    const salidasPorLote = await AppDataSource.query(`
        SELECT producto_id, lote_numero, SUM(cantidad) as total_salida
        FROM kardex
        WHERE tipo_movimiento = 'SALIDA'
          AND lote_numero IS NOT NULL AND lote_numero != ''
        GROUP BY producto_id, lote_numero
    `);
    const mapaSalidas = new Map();
    salidasPorLote.forEach(row => {
        mapaSalidas.set(`${row.producto_id}|${row.lote_numero}`, Number(row.total_salida));
    });
    console.log(`   Combinaciones con salidas en kardex: ${salidasPorLote.length}\n`);

    // ─── PASO 3: Actualizar o crear lotes ─────────────────────────────────────
    console.log('─'.repeat(70));
    console.log('✏️   PASO 3: Actualizando lotes...');

    let lotesActualizados = 0;
    let lotesCreados = 0;
    let sinCambio = 0;
    const logCambios = [];

    for (const ingr of ingresadosPorLote) {
        const totalIngresado = Number(ingr.total_ingresado);
        const keySalida = `${ingr.producto_id}|${ingr.lote_numero}`;
        const totalSalida = mapaSalidas.get(keySalida) || 0;
        const nuevaDisponible = Math.max(0, totalIngresado - totalSalida);

        // ¿Existe ese lote?
        const [loteExistente] = await AppDataSource.query(`
            SELECT id, cantidad_ingresada, cantidad_disponible
            FROM lotes
            WHERE producto_id = ? AND numero_lote = ?
            LIMIT 1
        `, [ingr.producto_id, ingr.lote_numero]);

        if (loteExistente) {
            const viejaIngresada = Number(loteExistente.cantidad_ingresada);
            const viejaDisponible = Number(loteExistente.cantidad_disponible);

            if (Math.abs(viejaIngresada - totalIngresado) > 0.001 || Math.abs(viejaDisponible - nuevaDisponible) > 0.001) {
                logCambios.push(`Lote ID=${loteExistente.id} (prod=${ingr.producto_id} lote=${ingr.lote_numero}): ingr ${viejaIngresada}→${totalIngresado} | disp ${viejaDisponible}→${nuevaDisponible}`);
                if (!dryRun) {
                    await AppDataSource.query(
                        `UPDATE lotes SET cantidad_ingresada = ?, cantidad_disponible = ? WHERE id = ?`,
                        [totalIngresado, nuevaDisponible, loteExistente.id]
                    );
                }
                lotesActualizados++;
            } else {
                sinCambio++;
            }
        } else {
            // Crear lote (no existía)
            logCambios.push(`NUEVO lote: prod=${ingr.producto_id} lote=${ingr.lote_numero} ing=${totalIngresado} disp=${nuevaDisponible}`);
            if (!dryRun) {
                await AppDataSource.query(`
                    INSERT INTO lotes (producto_id, numero_lote, fecha_vencimiento, cantidad_ingresada, cantidad_disponible)
                    VALUES (?, ?, ?, ?, ?)
                `, [ingr.producto_id, ingr.lote_numero, ingr.fecha_vencimiento || null, totalIngresado, nuevaDisponible]);
            }
            lotesCreados++;
        }
    }

    console.log(`   ✅ Lotes actualizados: ${lotesActualizados}`);
    console.log(`   ✅ Lotes nuevos:       ${lotesCreados}`);
    console.log(`   ℹ️  Sin cambio:         ${sinCambio}\n`);

    // ─── PASO 4: Recalcular stock_actual de productos ─────────────────────────
    console.log('─'.repeat(70));
    console.log('📊  PASO 4: Recalculando stock_actual desde lotes...');
    if (!dryRun) {
        await AppDataSource.query(`
            UPDATE productos p
            LEFT JOIN (
                SELECT producto_id, SUM(cantidad_disponible) AS total
                FROM lotes
                GROUP BY producto_id
            ) l ON p.id = l.producto_id
            SET p.stock_actual = COALESCE(l.total, 0)
        `);
    }
    console.log('   ✅ stock_actual actualizado\n');

    // ─── PASO 5: Registrar ingresos en kardex (si no existen) ─────────────────
    console.log('─'.repeat(70));
    console.log('📋  PASO 5: Registrando ingresos en kardex...');
    const [kardexIngresos] = await AppDataSource.query("SELECT COUNT(*) as n FROM kardex WHERE tipo_movimiento='INGRESO'");

    if (Number(kardexIngresos.n) === 0) {
        console.log('   ℹ️  No hay ingresos en kardex. Creando desde nota_ingreso_detalles...');
        if (!dryRun) {
            // Insertar un registro de kardex por cada grupo producto+lote ingresado
            // El saldo del kardex INGRESO = cantidad_ingresada (punto de partida)
            for (const ingr of ingresadosPorLote) {
                const keySalida = `${ingr.producto_id}|${ingr.lote_numero}`;
                const totalSalida = mapaSalidas.get(keySalida) || 0;
                const saldo = Math.max(0, Number(ingr.total_ingresado) - totalSalida);
                await AppDataSource.query(`
                    INSERT INTO kardex (producto_id, lote_numero, tipo_movimiento, cantidad, saldo, documento_tipo, observaciones)
                    VALUES (?, ?, 'INGRESO', ?, ?, 'NOTA_INGRESO', 'Migrado desde nota_ingreso_detalles')
                `, [ingr.producto_id, ingr.lote_numero, ingr.total_ingresado, saldo]);
            }
            console.log(`   ✅ ${ingresadosPorLote.length} registros de ingreso creados en kardex`);
        } else {
            console.log(`   [DRY] Crearía ${ingresadosPorLote.length} registros de ingreso en kardex`);
        }
    } else {
        console.log(`   ℹ️  Ya hay ${kardexIngresos.n} ingresos en kardex. Omitiendo.\n`);
    }

    // ─── Guardar log ──────────────────────────────────────────────────────────
    if (logCambios.length > 0) {
        const logPath = path.join(__dirname, '../../../reconstruir_lotes_cambios.log');
        fs.writeFileSync(logPath, logCambios.join('\n'));
        console.log(`\n📋  Log de ${logCambios.length} cambios guardado en: ${logPath}`);
    }

    // ─── Estado final ─────────────────────────────────────────────────────────
    const [despues] = await AppDataSource.query(`
        SELECT 
            (SELECT COUNT(*) FROM lotes) as lotes_total,
            (SELECT SUM(cantidad_ingresada) FROM lotes) as lotes_ingresada,
            (SELECT SUM(cantidad_disponible) FROM lotes) as lotes_disponible,
            (SELECT SUM(stock_actual) FROM productos) as productos_stock,
            (SELECT SUM(CASE WHEN stock_actual > 0 THEN 1 ELSE 0 END) FROM productos) as productos_con_stock
    `);
    console.log('\n' + '═'.repeat(70));
    console.log('📊  ESTADO FINAL:');
    console.log(`   lotes total           : ${despues.lotes_total}`);
    console.log(`   lotes.ingresada       : ${Number(despues.lotes_ingresada).toFixed(2)}`);
    console.log(`   lotes.disponible      : ${Number(despues.lotes_disponible).toFixed(2)}`);
    console.log(`   productos.stock_total : ${Number(despues.productos_stock).toFixed(2)}`);
    console.log(`   productos con stock   : ${despues.productos_con_stock}`);

    if (dryRun) {
        console.log('\n⚠️   DRY-RUN: Sin cambios aplicados. Ejecuta sin --dry-run para aplicar.\n');
    } else {
        console.log('\n🎉  RECONSTRUCCIÓN COMPLETADA EXITOSAMENTE\n');
    }

    await AppDataSource.destroy();
    console.log('👋  Conexión cerrada.\n');
}

reconstruirLotes().catch(err => {
    console.error('\n💥  ERROR FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
});
