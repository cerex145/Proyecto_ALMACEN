/**
 * MIGRACIÓN COMPLETA DE NOTAS DE SALIDA DESDE salida.csv
 *
 * Estructura del CSV (separador ;):
 *  0  Ítem
 *  1  Cod. Producto
 *  2  Producto
 *  3  Lote
 *  4  Fecha Vcto
 *  5  UM
 *  6  Cant.Bulto
 *  7  Cant.Cajas
 *  8  Cant.x Caja
 *  9  Cant.Fracción
 * 10  Cant.Total_Salida
 * 11  Motivo de Salida
 * 12  Fecha de H_Salida  (vacío, usar columna 16)
 * 13  MES
 * 14  DIA
 * 15  RUC
 * 16  AÑO  (contiene la fecha completa D/MM/YYYY; si es "1900" es epoch cero de Excel → inválido)
 * 17  Columna1  (contiene la fecha real cuando AÑO = 1900, p.ej. "6/03/2026")
 *
 * Uso: node migrar_salidas_csv_completo.js [/ruta/salida.csv] [--limpiar]
 *   --limpiar  : borra notas/detalles/kardex-SALIDA existentes antes de importar
 */

'use strict';

const fs   = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const AppDataSource = require('../src/config/database');

// ─── helpers ────────────────────────────────────────────────────────────────

function parsearNumero(txt) {
    if (!txt) return 0;
    const s = String(txt).trim();
    if (s === '-' || s === '' || s.toLowerCase() === 'n/a') return 0;
    const n = parseFloat(s.replace(',', '.').replace(/[^0-9.-]/g, ''));
    return isFinite(n) ? n : 0;
}

function parsearFecha(txt) {
    if (!txt) return null;
    const s = String(txt).trim();
    if (!s) return null;

    // D/M/YYYY o D/MM/YYYY o DD/MM/YYYY
    const partes = s.split('/');
    if (partes.length === 3) {
        const p1 = Number(partes[0]);
        const p2 = Number(partes[1]);
        const p3 = Number(partes[2]);
        if (!isNaN(p1) && !isNaN(p2) && !isNaN(p3)) {
            // si p1 > 12 → es el día; sino primera parte es mes (raro en este CSV)
            const dia = p1 > 12 ? p1 : p2;
            const mes = p1 > 12 ? p2 : p1;
            const anio = p3;
            // año < 2000 → epoch cero de Excel (30/12/1899 o similares) → inválido
            if (anio < 2000 || anio > 2099) return null;
            const iso = `${anio}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
            const d = new Date(`${iso}T00:00:00`);
            return isNaN(d.getTime()) ? null : d;
        }
    }

    // intento ISO / cadena libre
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    // año epoch cero de Excel (ej. new Date("1900") → válido pero incorrecto)
    if (d.getFullYear() < 2000 || d.getFullYear() > 2099) return null;
    return d;
}

function fechaISO(d) {
    if (!(d instanceof Date)) return null;
    return d.toISOString().slice(0, 10);
}

// ─── main ────────────────────────────────────────────────────────────────────

async function migrar() {
    const csvPath  = process.argv[2] || '/home/ezku/tmp/salida.csv';
    const limpiar  = process.argv.includes('--limpiar');

    console.log('═'.repeat(60));
    console.log('🚀  MIGRACIÓN COMPLETA — NOTAS DE SALIDA');
    console.log('═'.repeat(60));
    console.log(`📁  Archivo CSV : ${csvPath}`);
    console.log(`🧹  Limpiar BD  : ${limpiar ? 'SÍ' : 'NO'}\n`);

    if (!fs.existsSync(csvPath)) {
        console.error(`❌  No se encontró el archivo: ${csvPath}`);
        process.exit(1);
    }

    // ── conexión ──────────────────────────────────────────────────────────
    console.log('📡  Conectando a la base de datos…');
    await AppDataSource.initialize();
    console.log('✅  Conectado a MySQL\n');

    const notaSalidaRepo   = AppDataSource.getRepository('NotaSalida');
    const detalleRepo      = AppDataSource.getRepository('NotaSalidaDetalle');
    const productoRepo     = AppDataSource.getRepository('Producto');
    const clienteRepo      = AppDataSource.getRepository('Cliente');
    const loteRepo         = AppDataSource.getRepository('Lote');
    const kardexRepo       = AppDataSource.getRepository('Kardex');

    // ── limpiar datos previos ──────────────────────────────────────────────
    if (limpiar) {
        console.log('🧹  Eliminando datos previos de salidas…');

        // 1. kardex SALIDA
        await kardexRepo
            .createQueryBuilder()
            .delete()
            .where("tipo_movimiento = 'SALIDA'")
            .execute();

        // 2. detalles
        await AppDataSource.query('DELETE FROM nota_salida_detalles');

        // 3. notas
        await AppDataSource.query('DELETE FROM notas_salida');

        // 4. restaurar cantidad_disponible de lotes = cantidad_ingresada
        //    (las salidas que acabamos de borrar eran lo único que la reducía)
        await AppDataSource.query(`
            UPDATE lotes SET cantidad_disponible = cantidad_ingresada
        `);

        // 5. restaurar stock_actual de productos = suma de lotes.cantidad_disponible
        await AppDataSource.query(`
            UPDATE productos p
            LEFT JOIN (
                SELECT producto_id, SUM(cantidad_disponible) AS total
                FROM lotes
                GROUP BY producto_id
            ) l ON p.id = l.producto_id
            SET p.stock_actual = COALESCE(l.total, 0)
        `);

        console.log('✅  Datos previos eliminados y stock restaurado\n');
    }

    // ── leer CSV ──────────────────────────────────────────────────────────
    const lineas = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(l => l.trim());
    console.log(`📊  Total líneas CSV  : ${lineas.length}`);
    console.log(`📊  Filas de datos    : ${lineas.length - 1}\n`);

    // ── mapear encabezados ────────────────────────────────────────────────
    const encabezados = lineas[0].split(';').map(h => h.trim());
    const idx = {};
    encabezados.forEach((h, i) => { idx[h] = i; });

    const COL = {
        item      : encabezados.findIndex(h => /^[ÍI]tem$/i.test(h)),
        codProd   : encabezados.findIndex(h => /cod.*producto/i.test(h)),
        producto  : encabezados.findIndex(h => /^producto$/i.test(h)),
        lote      : encabezados.findIndex(h => /^lote$/i.test(h)),
        fechaVcto : encabezados.findIndex(h => /fecha.*vcto/i.test(h)),
        um        : encabezados.findIndex(h => /^um$/i.test(h)),
        cantBulto : encabezados.findIndex(h => /cant.*bulto/i.test(h)),
        cantCajas : encabezados.findIndex(h => /cant.*cajas?$/i.test(h)),
        cantXCaja : encabezados.findIndex(h => /cant.*x.*caja/i.test(h)),
        cantFracc : encabezados.findIndex(h => /cant.*fracci/i.test(h)),
        cantTotal : encabezados.findIndex(h => /cant.*total/i.test(h)),
        motivo    : encabezados.findIndex(h => /motivo/i.test(h)),
        fechaH    : encabezados.findIndex(h => /fecha.*h.*salida/i.test(h)),
        mes       : encabezados.findIndex(h => /^mes$/i.test(h)),
        dia       : encabezados.findIndex(h => /^dia$/i.test(h)),
        ruc       : encabezados.findIndex(h => /^ruc$/i.test(h)),
        anio      : encabezados.findIndex(h => /^a[ñn]o$/i.test(h)),
        columna1  : encabezados.findIndex(h => /^columna\s?1$/i.test(h)),
    };

    console.log('📋  Columnas detectadas:');
    Object.entries(COL).forEach(([k,v]) => {
        console.log(`    ${k.padEnd(12)}: ${v >= 0 ? `col ${v} → "${encabezados[v]}"` : '⚠️  NO ENCONTRADA'}`);
    });
    console.log();

    const v = (cols, colIdx, fallback = '') => {
        if (colIdx < 0 || colIdx >= cols.length) return fallback;
        return (cols[colIdx] ?? '').trim();
    };

    // ── caché clientes por RUC ────────────────────────────────────────────
    const clienteCache = new Map();
    const obtenerCliente = async (ruc) => {
        if (!ruc) return null;
        if (clienteCache.has(ruc)) return clienteCache.get(ruc);
        const c = await clienteRepo.findOneBy({ cuit: ruc });
        clienteCache.set(ruc, c);
        return c;
    };

    // ── caché productos por código ────────────────────────────────────────
    const productoCache = new Map();
    const obtenerProducto = async (codigo) => {
        if (!codigo) return null;
        if (productoCache.has(codigo)) return productoCache.get(codigo);
        const p = await productoRepo.findOneBy({ codigo });
        productoCache.set(codigo, p);
        return p;
    };

    // ── correlativo de número de salida ──────────────────────────────────
    let correlativo = 0;
    const ultima = await notaSalidaRepo
        .createQueryBuilder('n')
        .orderBy('n.id','DESC')
        .limit(1)
        .getOne();
    if (ultima?.numero_salida) {
        const m = String(ultima.numero_salida).match(/(\d+)(?!.*\d)/);
        correlativo = m ? parseInt(m[1], 10) : 0;
    }
    const siguienteNumero = () => {
        correlativo += 1;
        return String(correlativo).padStart(8, '0');
    };

    // ── agrupar filas: igual RUC + igual fecha → misma nota ──────────────
    //   (cuando col "Ítem" == 1 y el RUC+fecha cambia, comienza nueva nota)
    const grupos = new Map(); // clave: "RUC|YYYY-MM-DD"  → array de filas

    for (let i = 1; i < lineas.length; i++) {
        const cols = lineas[i].split(';');
        if (cols.every(c => !c.trim())) continue;

        const ruc       = v(cols, COL.ruc);
        // col AÑO puede tener "1900" (epoch cero de Excel) → inválido → usar Columna1 o fechaH
        const fechaDeAnio = parsearFecha(v(cols, COL.anio));
        const fechaTxt  = fechaDeAnio
            ? v(cols, COL.anio)
            : (v(cols, COL.columna1) || v(cols, COL.fechaH));
        const fecha     = fechaDeAnio || parsearFecha(fechaTxt);
        const fechaStr  = fechaISO(fecha);

        if (!ruc || !fechaStr) continue;

        const clave = `${ruc}|${fechaStr}`;
        if (!grupos.has(clave)) grupos.set(clave, []);
        grupos.get(clave).push({ lineaNum: i + 1, cols, ruc, fecha, fechaStr });
    }

    console.log(`📦  Grupos (notas agrupadas) : ${grupos.size}`);
    console.log(`📄  Filas útiles            : ${[...grupos.values()].reduce((s,g) => s + g.length, 0)}\n`);

    // ── contadores ────────────────────────────────────────────────────────
    let notasCreadas    = 0;
    let detallesCreados = 0;
    let erroresNota     = 0;
    let productoNoEnc   = 0;
    let stockInsuf      = 0;
    let clienteNoEnc    = 0;
    let loteEncontrado  = 0;
    const logErrores    = [];

    // ── procesar grupos ───────────────────────────────────────────────────
    let grupoNum = 0;
    for (const [clave, filas] of grupos) {
        grupoNum++;
        const { ruc, fecha } = filas[0];

        // buscar cliente
        const cliente = await obtenerCliente(ruc);
        if (!cliente) {
            clienteNoEnc++;
            logErrores.push(`Grupo ${clave}: cliente con RUC ${ruc} no encontrado`);
            continue;
        }

        // motivo (tomar del primer detalle)
        const motivoPrimero = v(filas[0].cols, COL.motivo) || 'VENTA';

        // crear NotaSalida
        const nota = notaSalidaRepo.create({
            numero_salida: siguienteNumero(),
            cliente_id   : cliente.id,
            fecha,
            motivo_salida: motivoPrimero,
            observaciones: `Migrado desde salida.csv - RUC ${ruc}`,
            estado       : 'DESPACHADA',
        });

        let notaGuardada;
        try {
            notaGuardada = await notaSalidaRepo.save(nota);
            notasCreadas++;
        } catch (err) {
            erroresNota++;
            logErrores.push(`Grupo ${clave}: error al crear nota — ${err.message}`);
            continue;
        }

        // ── detalles del grupo ─────────────────────────────────────────
        for (const fila of filas) {
            const { cols, lineaNum } = fila;

            const codProd   = v(cols, COL.codProd);
            const loteNum   = v(cols, COL.lote);
            const fechaVcto = parsearFecha(v(cols, COL.fechaVcto));
            const cantidad  = parsearNumero(v(cols, COL.cantTotal));
            const cantBulto = parsearNumero(v(cols, COL.cantBulto));
            const cantCajas = parsearNumero(v(cols, COL.cantCajas));
            const cantXCaja = parsearNumero(v(cols, COL.cantXCaja));
            const cantFracc = parsearNumero(v(cols, COL.cantFracc));

            if (!codProd || cantidad <= 0) continue;

            const producto = await obtenerProducto(codProd);
            if (!producto) {
                productoNoEnc++;
                logErrores.push(`Línea ${lineaNum}: producto ${codProd} no encontrado`);
                continue;
            }

            // stock disponible
            const stockActual = Number(producto.stock_actual ?? 0);
            if (stockActual < cantidad) {
                stockInsuf++;
                logErrores.push(`Línea ${lineaNum}: stock insuficiente para ${codProd} (disponible ${stockActual}, pedido ${cantidad})`);
                continue;
            }

            // buscar lote
            let loteId = null;
            if (loteNum && loteNum !== 'N/A') {
                const whereLote = { producto_id: producto.id, numero_lote: loteNum };
                if (fechaVcto) whereLote.fecha_vencimiento = fechaISO(fechaVcto);

                let lote = await loteRepo.findOne({ where: whereLote });
                // buscar sin fecha si no encontró con fecha
                if (!lote) lote = await loteRepo.findOne({ where: { producto_id: producto.id, numero_lote: loteNum } });
                if (lote) {
                    loteId = lote.id;
                    loteEncontrado++;
                    // descontar cantidad_disponible del lote
                    lote.cantidad_disponible = Math.max(0, Number(lote.cantidad_disponible) - cantidad);
                    await loteRepo.save(lote);
                }
            }

            // crear detalle
            const detalle = detalleRepo.create({
                nota_salida_id: notaGuardada.id,
                producto_id   : producto.id,
                lote_id       : loteId,
                cantidad,
                cant_bulto    : cantBulto,
                cant_caja     : cantCajas,
                cant_x_caja   : cantXCaja,
                cant_fraccion : cantFracc,
                precio_unitario: null,
            });
            await detalleRepo.save(detalle);
            detallesCreados++;

            // actualizar stock del producto (caché en memoria)
            producto.stock_actual = stockActual - cantidad;
            await productoRepo.save(producto);
            productoCache.set(codProd, producto); // actualizar caché

            // kardex
            const kardex = kardexRepo.create({
                producto_id    : producto.id,
                lote_numero    : loteNum || null,
                tipo_movimiento: 'SALIDA',
                cantidad,
                saldo          : producto.stock_actual,
                documento_tipo : 'NOTA_SALIDA',
                documento_numero: notaGuardada.numero_salida,
                referencia_id  : notaGuardada.id,
                observaciones  : `Migrado desde salida.csv`,
            });
            await kardexRepo.save(kardex);
        }

        // progreso cada 50 grupos
        if (grupoNum % 50 === 0) {
            console.log(`   ⏳  ${grupoNum}/${grupos.size} grupos — notas: ${notasCreadas}, detalles: ${detallesCreados}`);
        }
    }

    // ── resumen ────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('🎉  MIGRACIÓN COMPLETADA');
    console.log('═'.repeat(60));
    console.log(`✅  Notas de salida creadas : ${notasCreadas}`);
    console.log(`✅  Detalles creados        : ${detallesCreados}`);
    console.log(`🔗  Lotes vinculados        : ${loteEncontrado}`);
    console.log(`⚠️   Clientes no encontrados : ${clienteNoEnc}`);
    console.log(`⚠️   Productos no encontrados: ${productoNoEnc}`);
    console.log(`⚠️   Stock insuficiente       : ${stockInsuf}`);
    console.log(`❌  Errores en nota          : ${erroresNota}`);

    if (logErrores.length > 0) {
        const logPath = path.join(__dirname, '../../../migrar_salidas_errores.log');
        fs.writeFileSync(logPath, logErrores.join('\n'));
        console.log(`\n📋  Log de errores guardado en: ${logPath}`);
    }

    // totales finales en BD
    const [tNotas]   = await AppDataSource.query('SELECT COUNT(*) AS n FROM notas_salida');
    const [tDetail]  = await AppDataSource.query('SELECT COUNT(*) AS n FROM nota_salida_detalles');
    console.log(`\n📊  TOTALES EN BD:`);
    console.log(`    notas_salida          : ${tNotas.n}`);
    console.log(`    nota_salida_detalles  : ${tDetail.n}`);
    console.log('═'.repeat(60) + '\n');

    await AppDataSource.destroy();
    console.log('👋  Conexión cerrada. Migración exitosa.\n');
}

migrar().catch(err => {
    console.error('\n💥  ERROR FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
});
