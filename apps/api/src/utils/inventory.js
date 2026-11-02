const { In } = require('typeorm');

const quantity = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0 || Math.abs(number * 100 - Math.round(number * 100)) > 0.000001) {
        throw Object.assign(new Error('La cantidad debe ser mayor a cero y tener como máximo dos decimales'), { statusCode: 400 });
    }
    return Math.round(number * 100) / 100;
};

const lockProducts = async (tx, ids) => {
    const ordered = [...new Set(ids.map(Number))].filter(Number.isInteger).sort((a, b) => a - b);
    if (ordered.length) {
        await tx.query('SELECT id FROM productos WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE', [ordered]);
    }
};

const lockDocumentNumbers = (tx) => tx.query('SELECT pg_advisory_xact_lock($1, $2)', [71421, 1]);

const stock = async (tx, productoId) => {
    const row = await tx.createQueryBuilder('Lote', 'lote')
        .select('COALESCE(SUM(lote.cantidad_disponible), 0)', 'stock')
        .where('lote.producto_id = :productoId', { productoId: Number(productoId) }).getRawOne();
    return Math.round(Number(row?.stock || 0) * 100) / 100;
};

const assertLote = (lote, productoId, cantidad) => {
    if (!lote || Number(lote.producto_id) !== Number(productoId)) {
        throw new Error('El lote seleccionado no pertenece al producto indicado');
    }
    if (Number(lote.cantidad_disponible) + 0.000001 < quantity(cantidad)) {
        throw new Error(`Stock insuficiente en lote ${lote.numero_lote}`);
    }
};

const assertClient = (producto, cliente) => {
    const normalize = value => String(value || '').replace(/\D/g, '');
    if (producto.cliente_id != null && Number(producto.cliente_id) !== Number(cliente.id)) {
        if (!normalize(producto.cliente_ruc) || normalize(producto.cliente_ruc) !== normalize(cliente.cuit)) {
            throw new Error(`El producto ${producto.codigo || producto.id} no pertenece al cliente seleccionado`);
        }
    } else if (producto.cliente_id == null && normalize(producto.cliente_ruc)
        && normalize(producto.cliente_ruc) !== normalize(cliente.cuit)) {
        throw new Error(`El producto ${producto.codigo || producto.id} no pertenece al cliente seleccionado`);
    }
};

const assertIngresoEditable = async (tx, notaId) => {
    const lotes = await tx.find('Lote', { where: { nota_ingreso_id: Number(notaId) } });
    await lockProducts(tx, lotes.map(lote => lote.producto_id));
    const actuales = await tx.find('Lote', { where: { nota_ingreso_id: Number(notaId) } });
    for (const lote of actuales) {
        const detalles = await tx.find('NotaIngresoDetalle', { where: {
            nota_ingreso_id: Number(notaId), producto_id: Number(lote.producto_id), lote_numero: lote.numero_lote
        } });
        const original = detalles.reduce((total, detalle) => total + Number(detalle.cantidad), 0);
        if (!detalles.length || Math.abs(original - Number(lote.cantidad_ingresada)) > 0.000001) {
            throw new Error('El lote del ingreso tiene cantidades ajustadas; requiere conciliación antes de modificarlo');
        }
    }
    if (actuales.some(lote => Math.abs(Number(lote.cantidad_disponible) - Number(lote.cantidad_ingresada)) > 0.000001)) {
        throw new Error('No se puede modificar o eliminar un ingreso con stock consumido o ajustado');
    }
    if (actuales.length) {
        const ids = actuales.map(lote => lote.id);
        const referenced = await tx.getRepository('NotaSalidaDetalle').findOne({ where: { lote_id: In(ids) } });
        const legacy = await tx.query(`SELECT nsd.id FROM nota_salida_detalles nsd
            JOIN lotes l ON nsd.producto_id = l.producto_id AND nsd.lote_numero = l.numero_lote
            WHERE l.nota_ingreso_id = $1 AND nsd.lote_id IS NULL LIMIT 1`, [Number(notaId)]);
        if (referenced || legacy.length) throw new Error('El ingreso tiene salidas asociadas; anúlelas antes de modificarlo');
    }
};

const resolvePreviousLot = async (tx, detalle) => {
    if (detalle.lote_id) {
        const lote = await tx.findOne('Lote', { where: { id: Number(detalle.lote_id) } });
        if (!lote || Number(lote.producto_id) !== Number(detalle.producto_id)) {
            throw new Error('La salida tiene una referencia de lote inválida; requiere revisión antes de revertirse');
        }
        return lote;
    }
    if (!detalle.lote_numero) throw new Error('La salida antigua no conserva sus lotes; requiere revisión antes de revertirse');
    const lotes = await tx.find('Lote', { where: { producto_id: Number(detalle.producto_id), numero_lote: detalle.lote_numero } });
    if (lotes.length !== 1) throw new Error('El lote de la salida antigua es ambiguo; requiere revisión antes de revertirse');
    return lotes[0];
};

const audit = async (tx, request, accion, tabla, id, before, after) => {
    await tx.save('Auditoria', {
        usuario_id: request.user?.id || null, accion, tabla_afectada: tabla,
        registro_id: id || null, valores_anteriores: before || null, valores_nuevos: after || null,
        ip_address: request.ip || null, user_agent: String(request.headers?.['user-agent'] || '').slice(0, 1000) || null
    });
};

module.exports = { quantity, lockProducts, lockDocumentNumbers, stock, assertLote, assertClient, assertIngresoEditable, resolvePreviousLot, audit };
