const { MoreThan } = require('typeorm');
const { quantity, lockProducts, stock, assertLote, assertClient, resolvePreviousLot } = require('../utils/inventory');

async function applyDetails(tx, nota, detalles, cliente) {
    if (!Array.isArray(detalles) || !detalles.length) throw new Error('La salida debe tener al menos un detalle');
    await lockProducts(tx, detalles.map(detalle => detalle.producto_id));
    for (const detalle of detalles) {
        const productoId = Number(detalle.producto_id);
        const requested = quantity(detalle.cantidad);
        const price = detalle.precio_unitario == null ? null : Number(detalle.precio_unitario);
        if (price !== null && (!Number.isFinite(price) || price < 0)) throw new Error('Precio unitario inválido');
        const producto = await tx.findOne('Producto', { where: { id: productoId } });
        if (!producto) throw new Error('Producto no encontrado');
        assertClient(producto, cliente);
        let saldo = await stock(tx, productoId);
        if (saldo + 0.000001 < requested) throw new Error(`Stock insuficiente para ${producto.descripcion}`);
        let lotes;
        if (detalle.lote_id) {
            const lote = await tx.findOne('Lote', { where: { id: Number(detalle.lote_id) } });
            assertLote(lote, productoId, requested);
            lotes = [lote];
        } else {
            const where = { producto_id: productoId, cantidad_disponible: MoreThan(0) };
            if (detalle.lote_numero) where.numero_lote = String(detalle.lote_numero).trim();
            lotes = await tx.find('Lote', { where, order: { fecha_vencimiento: 'ASC', created_at: 'ASC', id: 'ASC' } });
        }
        let pendiente = requested;
        const allocations = [];
        for (const lote of lotes) {
            if (pendiente < 0.000001) break;
            const amount = Math.min(Number(lote.cantidad_disponible), pendiente);
            if (amount <= 0) continue;
            lote.cantidad_disponible = Math.round((Number(lote.cantidad_disponible) - amount) * 100) / 100;
            await tx.save('Lote', lote);
            allocations.push({ lote, amount });
            pendiente = Math.round((pendiente - amount) * 100) / 100;
        }
        if (pendiente > 0.000001) throw new Error(`Stock insuficiente en los lotes seleccionados para ${producto.descripcion}`);
        const assigned = {};
        for (let index = 0; index < allocations.length; index++) {
            const { lote, amount } = allocations[index];
            const packages = {};
            for (const field of ['cant_bulto', 'cant_caja', 'cant_x_caja', 'cant_fraccion']) {
                if (detalle[field] == null) { packages[field] = null; continue; }
                const total = Number(detalle[field]);
                if (!Number.isFinite(total) || total < 0) throw new Error('Las cantidades de empaque deben ser números no negativos');
                if (field === 'cant_x_caja') { packages[field] = total; continue; }
                const remaining = Math.max(0, Math.round((total - (assigned[field] || 0)) * 100) / 100);
                packages[field] = index === allocations.length - 1 ? remaining
                    : Math.min(remaining, Math.round(total * amount / requested * 100) / 100);
                assigned[field] = (assigned[field] || 0) + packages[field];
            }
            const detail = {
                nota_salida_id: nota.id, producto_id: productoId, lote_id: lote.id,
                lote_numero: lote.numero_lote, fecha_vencimiento: lote.fecha_vencimiento || null,
                um: detalle.um || producto.unidad_medida || null, fabricante: producto.fabricante || null,
                precio_unitario: price,
                cantidad: amount, cantidad_total: amount, ...packages
            };
            await tx.save('NotaSalidaDetalle', detail);
            saldo = Math.round((saldo - amount) * 100) / 100;
            await tx.save('Kardex', {
                producto_id: productoId, lote_numero: lote.numero_lote, tipo_movimiento: 'SALIDA',
                cantidad: amount, saldo, documento_tipo: 'NOTA_SALIDA',
                documento_numero: nota.numero_salida, referencia_id: nota.id
            });
        }
    }
}

async function restoreDetails(tx, nota) {
    const detalles = await tx.find('NotaSalidaDetalle', { where: { nota_salida_id: Number(nota.id) } });
    if (!detalles.length) throw new Error('La salida no conserva detalles para revertir su stock');
    await lockProducts(tx, detalles.map(detalle => detalle.producto_id));
    for (const detalle of detalles) {
        const lote = await resolvePreviousLot(tx, detalle);
        const restored = Math.round((Number(lote.cantidad_disponible) + quantity(detalle.cantidad)) * 100) / 100;
        if (restored > Number(lote.cantidad_ingresada) + 0.000001) {
            throw new Error(`La reversión superaría la cantidad ingresada en el lote ${lote.numero_lote}; revise su historial`);
        }
        lote.cantidad_disponible = restored;
        await tx.save('Lote', lote);
    }
    return detalles;
}

module.exports = { applyDetails, restoreDetails };
