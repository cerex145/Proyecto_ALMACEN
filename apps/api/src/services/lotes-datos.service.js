const { lockProducts, audit } = require('../utils/inventory');
const { getDays } = require('./alertas.service');

const dateKey = value => value == null || value === '' ? null
    : value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
const conflict = message => Object.assign(new Error(message), { statusCode: 409 });
const invalid = message => Object.assign(new Error(message), { statusCode: 400 });

function validateDate(value) {
    if (value === null) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || value < '1900-01-01'
        || !Number.isFinite(Date.parse(value + 'T00:00:00Z'))
        || new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) !== value) {
        throw invalid('Ingrese una fecha de vencimiento válida.');
    }
}

async function correctLotData(db, request, id, body) {
    const number = String(body.numero_lote || '').trim();
    const reason = String(body.motivo || '').trim();
    if (!number || number.length > 100) throw invalid('El número de lote debe tener entre 1 y 100 caracteres.');
    if (reason.length < 3 || reason.length > 500) throw invalid('Indique el motivo de la corrección (3 a 500 caracteres).');
    validateDate(body.fecha_vencimiento);
    return db.transaction(async tx => {
        let lot = await tx.findOne('Lote', { where: { id: Number(id) } });
        if (!lot) throw Object.assign(new Error('Lote no encontrado.'), { statusCode: 404 });
        await lockProducts(tx, [lot.producto_id]);
        lot = await tx.findOne('Lote', { where: { id: Number(id) } });
        if (!lot) throw conflict('El lote ya no existe. Actualice el inventario.');
        const before = { numero_lote: lot.numero_lote, fecha_vencimiento: dateKey(lot.fecha_vencimiento) };
        if (body.anterior?.numero_lote !== before.numero_lote
            || body.anterior?.fecha_vencimiento !== before.fecha_vencimiento) {
            throw conflict('Otro usuario modificó este lote. Actualice el inventario y vuelva a abrir la corrección.');
        }
        const after = { numero_lote: number, fecha_vencimiento: body.fecha_vencimiento };
        if (before.numero_lote === number && before.fecha_vencimiento === after.fecha_vencimiento) {
            throw invalid('No hay cambios para guardar.');
        }
        const rename = before.numero_lote !== number;
        const productId = Number(lot.producto_id);
        if (rename) {
            const duplicates = await tx.find('Lote', { where: { producto_id: productId, numero_lote: number } });
            if (duplicates.some(peer => peer.nota_ingreso_id === lot.nota_ingreso_id)) {
                throw conflict('Este ingreso ya contiene otro lote con ese número. Revise el número antes de guardar.');
            }
        }
        const peers = await tx.find('Lote', { where: { producto_id: productId, numero_lote: before.numero_lote } });
        const incoming = await tx.find('NotaIngresoDetalle', { where: { producto_id: productId, lote_numero: before.numero_lote } });
        const outgoing = await tx.find('NotaSalidaDetalle', { where: { producto_id: productId } });
        const changes = [];
        const ambiguous = () => conflict('Hay documentos antiguos que no permiten identificar este ingreso con certeza. La corrección requiere revisión; no se guardó ningún cambio.');
        // Old documents may lack lote_id. Never choose one of several receipts by batch number alone.
        const belongs = (row, candidates = peers) => {
            const candidatesByDate = dateKey(row.fecha_vencimiento) == null ? candidates
                : candidates.filter(peer => dateKey(peer.fecha_vencimiento) === dateKey(row.fecha_vencimiento));
            if (!candidatesByDate.some(peer => Number(peer.id) === Number(lot.id))) {
                if (candidatesByDate.length) return false;
                throw ambiguous();
            }
            if (candidatesByDate.length !== 1) throw ambiguous();
            return true;
        };
        const plan = (entity, row) => changes.push({ entity, id: row.id, values: {
            ...(rename ? { lote_numero: number } : {}),
            ...(entity === 'Kardex' ? {} : { fecha_vencimiento: after.fecha_vencimiento })
        } });
        for (const row of incoming) {
            if (lot.nota_ingreso_id == null || Number(row.nota_ingreso_id) !== Number(lot.nota_ingreso_id)) continue;
            const candidates = peers.filter(peer => Number(peer.nota_ingreso_id) === Number(row.nota_ingreso_id));
            if (belongs(row, candidates)) plan('NotaIngresoDetalle', row);
        }
        if (lot.nota_ingreso_id != null && !changes.some(change => change.entity === 'NotaIngresoDetalle')) throw ambiguous();
        const selectedOutgoing = new Set();
        for (const row of outgoing) {
            const selected = row.lote_id != null ? Number(row.lote_id) === Number(lot.id)
                : row.lote_numero === before.numero_lote && belongs(row);
            if (selected) { plan('NotaSalidaDetalle', row); selectedOutgoing.add(row.id); }
        }
        const actas = await tx.find('ActaRecepcionDetalle', { where: { producto_id: productId, lote_numero: before.numero_lote } });
        for (const row of actas) {
            if (belongs(row)) plan('ActaRecepcionDetalle', row);
        }
        if (rename) {
            const movements = await tx.find('Kardex', { where: { producto_id: productId, lote_numero: before.numero_lote } });
            const peerIds = new Set(peers.map(peer => Number(peer.id)));
            const cancelledDetails = new Map();
            for (const row of movements) {
                let selected;
                if (row.documento_tipo === 'NOTA_INGRESO') {
                    const owners = peers.filter(peer => peer.nota_ingreso_id != null && Number(peer.nota_ingreso_id) === Number(row.referencia_id));
                    if (!owners.some(peer => Number(peer.id) === Number(lot.id))) continue;
                    if (owners.length !== 1) throw ambiguous();
                    selected = true;
                } else if (['NOTA_SALIDA', 'NOTA_SALIDA_CANCELADA'].includes(row.documento_tipo)) {
                    const salidaId = Number(row.referencia_id);
                    const details = outgoing.filter(detail => Number(detail.nota_salida_id) === Number(row.referencia_id)
                        && detail.lote_numero === before.numero_lote);
                    let matches = details.map(detail => selectedOutgoing.has(detail.id));
                    if (!matches.length) {
                        // La cancelación retira los detalles activos y guarda su último estado en auditoría.
                        if (!cancelledDetails.has(salidaId)) {
                            const entry = await tx.findOne('Auditoria', {
                                where: { accion: 'CANCELAR', tabla_afectada: 'notas_salida', registro_id: salidaId },
                                order: { id: 'DESC' }
                            });
                            const snapshots = entry?.valores_anteriores?.detalles;
                            cancelledDetails.set(salidaId, Array.isArray(snapshots) ? snapshots : []);
                        }
                        const snapshots = cancelledDetails.get(salidaId).filter(detail => Number(detail.producto_id) === productId
                            && (detail.lote_numero === before.numero_lote || peerIds.has(Number(detail.lote_id))));
                        if (snapshots.some(detail => !peerIds.has(Number(detail.lote_id)))) throw ambiguous();
                        matches = snapshots.map(detail => Number(detail.lote_id) === Number(lot.id));
                    }
                    if (!matches.length && row.documento_tipo === 'NOTA_SALIDA_CANCELADA' && peers.length === 1) matches = [true];
                    if (!matches.length) throw ambiguous();
                    selected = matches.includes(true);
                    if (selected && matches.includes(false)) throw ambiguous();
                } else if (row.documento_tipo === 'LOTE_MANUAL') {
                    selected = Number(row.referencia_id) === Number(lot.id);
                } else {
                    if (peers.length !== 1) throw ambiguous();
                    selected = true;
                }
                if (selected) plan('Kardex', row);
            }
        }
        // Keep old cached alerts consistent too; live alerts are derived from Lote.
        const alerts = await tx.find('AlertaVencimiento', { where: { producto_id: productId, lote_numero: before.numero_lote } });
        if (alerts.length) {
            const days = await getDays(tx);
            const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
            const remaining = after.fecha_vencimiento == null ? null
                : Math.round((Date.parse(after.fecha_vencimiento + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
            for (const row of alerts) if (belongs(row)) {
                plan('AlertaVencimiento', row);
                Object.assign(changes.at(-1).values, { dias_para_vencer: remaining,
                    estado: remaining == null ? 'NORMAL' : remaining < 0 ? 'VENCIDO' : remaining <= days ? 'PROXIMO_A_VENCER' : 'NORMAL' });
            }
        }
        for (const change of changes) await tx.save(change.entity, { id: change.id, ...change.values });
        await tx.save('Lote', { id: lot.id, ...after });
        if (rename && peers.length === 1) {
            const product = await tx.findOne('Producto', { where: { id: productId } });
            if (product?.lote === before.numero_lote) await tx.save('Producto', { id: productId, lote: number });
        }
        await audit(tx, request, 'CORREGIR_DATOS_LOTE', 'lotes', lot.id, before,
            { ...after, motivo: reason, documentos: changes.map(({ entity, id }) => ({ tabla: entity, id })) });
        return { ...lot, ...after };
    });
}

module.exports = { correctLotData };
