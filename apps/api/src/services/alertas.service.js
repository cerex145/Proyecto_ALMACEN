const { In, MoreThan } = require('typeorm');
const { audit } = require('../utils/inventory');

const TABLE = 'alertas_vencimiento';
const dateKey = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10);
const today = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

async function getDays(db) {
    const setting = await db.getRepository('Auditoria').findOne({
        where: { accion: 'CONFIGURAR_ALERTAS', tabla_afectada: TABLE }, order: { id: 'DESC' }
    });
    const days = Number(setting?.valores_nuevos?.dias ?? process.env.ALERT_DAYS ?? 30);
    return Number.isInteger(days) && days > 0 && days <= 3650 ? days : 30;
}

async function setDays(db, request, days) {
    // Audited settings use the existing table without adding schema or migrating data.
    await db.transaction(tx => audit(tx, request, 'CONFIGURAR_ALERTAS', TABLE, null, null, { dias: days }));
}

async function getAlerts(db, userId, currentDay = today()) {
    const days = await getDays(db);
    const lotes = await db.getRepository('Lote').find({
        where: { cantidad_disponible: MoreThan(0) }, relations: ['producto'],
        order: { fecha_vencimiento: 'ASC', id: 'ASC' }
    });
    const base = Date.parse(`${currentDay}T00:00:00Z`);
    const alerts = lotes.flatMap(lote => {
        const expiration = dateKey(lote.fecha_vencimiento);
        const ms = Date.parse(`${expiration}T00:00:00Z`);
        if (!Number.isFinite(ms)) return [];
        const remaining = Math.round((ms - base) / 86400000);
        const state = remaining < 0 ? 'VENCIDO' : remaining <= days ? 'PROXIMO_A_VENCER' : 'VIGENTE';
        const amount = Number(lote.cantidad_disponible);
        return [{ id: Number(lote.id), lote_id: Number(lote.id), producto_id: Number(lote.producto_id),
            lote_numero: lote.numero_lote, fecha_vencimiento: expiration, estado: state,
            dias_faltantes: remaining, dias_para_vencer: remaining, cantidad: amount,
            producto: lote.producto || null, producto_nombre: lote.producto?.descripcion || null,
            producto_codigo: lote.producto?.codigo || null, lote,
            firma: `${expiration}|${state}|${amount}`, leida: false }];
    });
    if (!alerts.length || userId == null) return alerts;
    const records = await db.getRepository('Auditoria').find({ where: {
        usuario_id: userId, tabla_afectada: TABLE, registro_id: In(alerts.map(a => a.id)),
        accion: In(['LEER_ALERTA', 'DESCARTAR_ALERTA'])
    }, order: { id: 'DESC' } });
    const latest = new Map();
    for (const record of records) if (!latest.has(Number(record.registro_id))) latest.set(Number(record.registro_id), record);
    return alerts.filter(alerta => {
        const record = latest.get(alerta.id);
        if (record?.valores_nuevos?.firma !== alerta.firma) return true;
        alerta.leida = record.accion === 'LEER_ALERTA';
        return record.accion !== 'DESCARTAR_ALERTA';
    });
}

async function saveState(db, request, alerts, action) {
    await db.transaction(async tx => {
        for (const alerta of alerts) await audit(tx, request, action, TABLE, alerta.id, null, { firma: alerta.firma });
    });
}

module.exports = { getDays, setDays, getAlerts, saveState, dateKey };
