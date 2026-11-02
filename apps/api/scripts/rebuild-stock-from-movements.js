const path = require('path');

function planRebuild({ lotes, ingresos, salidas, ajustes = [], kardex = [] }) {
    const key = (producto, numero) => `${producto}|${numero || ''}`;
    const count = new Map();
    for (const lote of lotes) count.set(key(lote.producto_id, lote.numero_lote), (count.get(key(lote.producto_id, lote.numero_lote)) || 0) + 1);
    return lotes.map(lote => {
        if (!lote.nota_ingreso_id) throw new Error(`Lote ${lote.id}: no conserva su ingreso; requiere conciliación manual`);
        if (ajustes.some(a => Number(a.producto_id) === Number(lote.producto_id))
            || kardex.some(k => Number(k.producto_id) === Number(lote.producto_id) && String(k.tipo_movimiento).startsWith('AJUSTE'))) {
            throw new Error(`Producto ${lote.producto_id}: tiene ajustes; no se puede reconstruir únicamente con notas`);
        }
        const entries = ingresos.filter(d => Number(d.nota_ingreso_id) === Number(lote.nota_ingreso_id)
            && Number(d.producto_id) === Number(lote.producto_id) && d.lote_numero === lote.numero_lote);
        if (!entries.length) throw new Error(`Lote ${lote.id}: no tiene detalles de ingreso comprobables`);
        const duplicates = lotes.filter(l => Number(l.nota_ingreso_id) === Number(lote.nota_ingreso_id)
            && Number(l.producto_id) === Number(lote.producto_id) && l.numero_lote === lote.numero_lote);
        if (duplicates.length !== 1) throw new Error(`Lote ${lote.id}: registros duplicados dentro del mismo ingreso`);
        const outgoing = salidas.filter(d => {
            if (d.estado === 'CANCELADA') return false;
            if (d.lote_id != null) return Number(d.lote_id) === Number(lote.id);
            if (Number(d.producto_id) !== Number(lote.producto_id)) return false;
            if (!d.lote_numero || (d.lote_numero === lote.numero_lote && count.get(key(lote.producto_id, lote.numero_lote)) !== 1)) {
                throw new Error(`Producto ${lote.producto_id}: salida antigua sin lote exacto; requiere conciliación manual`);
            }
            return d.lote_numero === lote.numero_lote;
        });
        const entered = entries.reduce((n, d) => n + Number(d.cantidad_total ?? d.cantidad), 0);
        const left = entered - outgoing.reduce((n, d) => n + Number(d.cantidad_total ?? d.cantidad), 0);
        if (!Number.isFinite(entered) || !Number.isFinite(left) || entered < 0 || left < -0.000001) throw new Error(`Lote ${lote.id}: cantidades inconsistentes`);
        return { id: Number(lote.id), cantidad_ingresada: Math.round(entered * 100) / 100,
            cantidad_disponible: Math.round(left * 100) / 100 };
    });
}

async function main() {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
    const { Client } = require('pg');
    const { backupDatabase } = require('../../../scripts/lib/postgres-backup');
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('Falta DATABASE_URL en apps/api/.env');
    const apply = process.argv.includes('--apply');
    if (apply) console.log(`Respaldo previo: ${await backupDatabase()}`);
    const client = new Client({ connectionString, ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false } });
    await client.connect();
    try {
        await client.query(apply ? 'BEGIN' : 'BEGIN READ ONLY');
        if (apply) await client.query('SELECT id FROM productos ORDER BY id FOR UPDATE');
        const lotes = (await client.query('SELECT * FROM lotes')).rows;
        const ingresos = (await client.query('SELECT * FROM nota_ingreso_detalles')).rows;
        const salidas = (await client.query('SELECT d.*, n.estado FROM nota_salida_detalles d JOIN notas_salida n ON n.id = d.nota_salida_id')).rows;
        const ajustes = (await client.query('SELECT * FROM ajustes_stock')).rows;
        const kardex = (await client.query('SELECT producto_id, tipo_movimiento FROM kardex')).rows;
        const plan = planRebuild({ lotes, ingresos, salidas, ajustes, kardex });
        if (apply) for (const row of plan) await client.query(
            'UPDATE lotes SET cantidad_ingresada = $1, cantidad_disponible = $2, updated_at = NOW() WHERE id = $3',
            [row.cantidad_ingresada, row.cantidad_disponible, row.id]);
        await client.query('COMMIT');
        console.log(JSON.stringify({ aplicado: apply, lotes: plan.length, plan }, null, 2));
        if (!apply) console.log('Solo diagnóstico. Para aplicar el plan explícitamente utilice --apply.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { await client.end(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { planRebuild };
