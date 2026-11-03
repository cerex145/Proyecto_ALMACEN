const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDb, createApp } = require('./fake-db');

const payload = (lot, values = {}) => ({ numero_lote: 'CORREGIDO', fecha_vencimiento: '2029-01-06',
    motivo: 'Corrección de digitación', anterior: { numero_lote: lot.numero_lote, fecha_vencimiento: lot.fecha_vencimiento || null }, ...values });
const quantities = db => Object.fromEntries(['Lote', 'Kardex', 'NotaIngresoDetalle', 'NotaSalidaDetalle', 'ActaRecepcionDetalle'].map(name => [name,
    db.rows[name].map(({ id, cantidad, cantidad_ingresada, cantidad_disponible, saldo, cantidad_total, cantidad_cajas, cantidad_fraccion }) =>
        ({ id, cantidad, cantidad_ingresada, cantidad_disponible, saldo, cantidad_total, cantidad_cajas, cantidad_fraccion }))]));

async function call(ctx, body, user = 1, lot = 11) {
    return ctx.app.inject({ method: 'PATCH', url: `/api/lotes/${lot}/datos`, headers: ctx.headers(user), payload: body });
}

test('corrección de lote sincroniza documentos, Kardex y alertas con auditoría y sin cambiar cantidades', async () => {
    const ctx = await createApp(); const { db } = ctx;
    try {
        db.rows.Producto[0].lote = 'L1';
        db.rows.NotaIngresoDetalle[0].fecha_vencimiento = '2026-11-01';
        db.rows.Lote[0].cantidad_disponible = 40;
        db.rows.NotaSalidaDetalle.push({ id: 1, nota_salida_id: 9, producto_id: 1, lote_id: 11, lote_numero: 'L1', fecha_vencimiento: '2026-11-01', cantidad: 60 });
        db.rows.Kardex.push({ id: 3, producto_id: 1, lote_numero: 'L1', documento_tipo: 'NOTA_SALIDA', referencia_id: 9, tipo_movimiento: 'SALIDA', cantidad: 60, saldo: 90 });
        db.rows.ActaRecepcionDetalle.push({ id: 7, acta_id: 1, producto_id: 1, lote_numero: 'L1', fecha_vencimiento: '2026-11-01', cantidad_cajas: 100 });
        db.rows.AlertaVencimiento.push({ id: 8, producto_id: 1, lote_numero: 'L1', fecha_vencimiento: '2026-11-01', cantidad: 40 });
        const before = quantities(db);
        const res = await call(ctx, payload(db.rows.Lote[0]));
        assert.equal(res.statusCode, 200, res.body);
        assert.equal(res.json().data.numero_lote, 'CORREGIDO');
        for (const entity of ['NotaIngresoDetalle', 'NotaSalidaDetalle', 'ActaRecepcionDetalle', 'AlertaVencimiento']) {
            assert.equal(db.rows[entity][0].lote_numero, 'CORREGIDO', entity);
            assert.equal(db.rows[entity][0].fecha_vencimiento, '2029-01-06', entity);
        }
        assert.deepEqual(db.rows.Kardex.map(k => k.lote_numero), ['CORREGIDO', 'L2', 'CORREGIDO']);
        assert.equal(db.rows.Producto[0].lote, 'CORREGIDO');
        assert.deepEqual(quantities(db), before);
        assert.ok(db.locks.some(lock => /FOR UPDATE/.test(lock.sql)));
        const audit = db.rows.Auditoria.at(-1);
        assert.equal(audit.accion, 'CORREGIR_DATOS_LOTE'); assert.equal(audit.usuario_id, 1);
        assert.equal(audit.valores_anteriores.numero_lote, 'L1');
        assert.equal(audit.valores_nuevos.motivo, 'Corrección de digitación');
    } finally { await ctx.app.close(); }
});

test('lotes repetidos: corregir fecha afecta solo el ingreso exacto y conserva los otros vencimientos', async () => {
    const ctx = await createApp(); const { db } = ctx;
    try {
        db.rows.Lote[1].numero_lote = 'L1'; db.rows.NotaIngresoDetalle[1].lote_numero = 'L1'; db.rows.Kardex[1].lote_numero = 'L1';
        db.rows.NotaIngresoDetalle[0].fecha_vencimiento = '2026-11-01';
        db.rows.NotaIngresoDetalle[1].fecha_vencimiento = '2026-11-20';
        db.rows.ActaRecepcionDetalle.push(...db.rows.Lote.filter(l => l.producto_id === 1).map((l, i) => ({ id: i + 1, producto_id: 1, lote_numero: 'L1', fecha_vencimiento: l.fecha_vencimiento })));
        db.rows.NotaSalidaDetalle.push({ id: 1, producto_id: 1, lote_id: 11, lote_numero: 'L1', fecha_vencimiento: '2026-11-01' },
            { id: 2, producto_id: 1, lote_id: 12, lote_numero: 'L1', fecha_vencimiento: '2026-11-20' });
        const peer = structuredClone(db.rows.Lote[1]); const movements = structuredClone(db.rows.Kardex);
        const res = await call(ctx, payload(db.rows.Lote[0], { numero_lote: 'L1', fecha_vencimiento: '2027-01-31' }));
        assert.equal(res.statusCode, 200, res.body);
        assert.deepEqual(db.rows.Lote[1], peer); assert.deepEqual(db.rows.Kardex, movements);
        for (const entity of ['NotaIngresoDetalle', 'NotaSalidaDetalle', 'ActaRecepcionDetalle']) {
            assert.equal(db.rows[entity][0].fecha_vencimiento, '2027-01-31', entity);
            assert.equal(db.rows[entity][1].fecha_vencimiento, '2026-11-20', entity);
        }
    } finally { await ctx.app.close(); }
});

test('renombrar un lote tras cancelar una salida conserva los movimientos y el stock', async () => {
    const ctx = await createApp();
    try {
        const created = await ctx.app.inject({ method: 'POST', url: '/api/salidas', headers: ctx.headers(1),
            payload: { cliente_id: 1, fecha: '2026-11-02', detalles: [{ producto_id: 1, lote_id: 11, cantidad: 10 }] } });
        assert.equal(created.statusCode, 201, created.body);
        const id = created.json().data.id;
        const cancelled = await ctx.app.inject({ method: 'DELETE', url: '/api/salidas/' + id, headers: ctx.headers(1) });
        assert.equal(cancelled.statusCode, 200, cancelled.body);
        assert.equal(ctx.db.rows.NotaSalidaDetalle.length, 0);
        const before = quantities(ctx.db);
        for (const numero_lote of ['CORREGIDO', 'CORREGIDO-2']) {
            const res = await call(ctx, payload(ctx.db.rows.Lote[0], { numero_lote }));
            assert.equal(res.statusCode, 200, res.body);
            assert.deepEqual(ctx.db.rows.Kardex.filter(row => ['SALIDA', 'SALIDA_REVERSA'].includes(row.tipo_movimiento))
                .map(row => row.lote_numero), [numero_lote, numero_lote]);
        }
        assert.deepEqual(quantities(ctx.db), before);
    } finally { await ctx.app.close(); }
});

test('se permite renombrar un lote repetido si los documentos identifican el ingreso exacto', async () => {
    const ctx = await createApp(); const { db } = ctx;
    try {
        db.rows.Lote[1].numero_lote = 'L1'; db.rows.NotaIngresoDetalle[1].lote_numero = 'L1'; db.rows.Kardex[1].lote_numero = 'L1';
        db.rows.NotaIngresoDetalle[0].fecha_vencimiento = '2026-11-01';
        const res = await call(ctx, payload(db.rows.Lote[0]));
        assert.equal(res.statusCode, 200, res.body);
        assert.equal(db.rows.Lote[1].numero_lote, 'L1'); assert.equal(db.rows.Kardex[1].lote_numero, 'L1');
        assert.equal(db.rows.Kardex[0].lote_numero, 'CORREGIDO');
    } finally { await ctx.app.close(); }
});

test('historial ambiguo o Kardex compartido entre ingresos bloquea toda la transacción', async () => {
    for (const ambiguous of ['acta', 'salida', 'kardex']) {
        const ctx = await createApp(); const { db } = ctx;
        try {
            db.rows.Lote[1].numero_lote = 'L1'; db.rows.Lote[1].fecha_vencimiento = '2026-11-01';
            db.rows.NotaIngresoDetalle[1].lote_numero = 'L1';
            if (ambiguous === 'acta') db.rows.ActaRecepcionDetalle.push({ id: 1, producto_id: 1, lote_numero: 'L1', fecha_vencimiento: '2026-11-01' });
            if (ambiguous === 'salida') db.rows.NotaSalidaDetalle.push({ id: 1, producto_id: 1, lote_numero: 'L1', fecha_vencimiento: '2026-11-01' });
            if (ambiguous === 'kardex') {
                db.rows.NotaSalidaDetalle.push(...[11, 12].map((id, i) => ({ id: i + 1, producto_id: 1, lote_id: id, nota_salida_id: 5, lote_numero: 'L1', fecha_vencimiento: '2026-11-01' })));
                db.rows.Kardex.push({ id: 3, producto_id: 1, lote_numero: 'L1', documento_tipo: 'NOTA_SALIDA', referencia_id: 5, cantidad: 10 });
            }
            const before = structuredClone(db.rows);
            const res = await call(ctx, payload(db.rows.Lote[0]));
            assert.equal(res.statusCode, 409, ambiguous + ': ' + res.body); assert.deepEqual(db.rows, before);
        } finally { await ctx.app.close(); }
    }
});

test('autorización: sin sesión o consultor no corrige; almacenero con permisos sí', async () => {
    const ctx = await createApp();
    try {
        const body = payload(ctx.db.rows.Lote[0]);
        assert.equal((await ctx.app.inject({ method: 'PATCH', url: '/api/lotes/11/datos', payload: body })).statusCode, 401);
        assert.equal((await call(ctx, body, 2)).statusCode, 403);
        ctx.db.rows.Rol[2].permisos = { productos: { read: true, update: false } };
        assert.equal((await call(ctx, body, 3)).statusCode, 403);
        ctx.db.rows.Rol[2].permisos.productos.update = true;
        assert.equal((await call(ctx, body, 3)).statusCode, 200);
        assert.equal(ctx.db.rows.Auditoria.at(-1).usuario_id, 3);
    } finally { await ctx.app.close(); }
});

test('rechaza datos desactualizados, fechas inválidas y correcciones vacías sin guardar nada', async () => {
    const ctx = await createApp();
    try {
        const original = ctx.db.rows.Lote[0];
        const cases = [
            [payload(original, { anterior: { numero_lote: 'ANTERIOR', fecha_vencimiento: original.fecha_vencimiento } }), 409],
            [payload(original, { fecha_vencimiento: '2027-02-30' }), 400],
            [payload(original, { numero_lote: '  ' }), 400],
            [payload(original, { motivo: '  ' }), 400],
            [payload(original, { numero_lote: original.numero_lote, fecha_vencimiento: original.fecha_vencimiento }), 400]
        ];
        const before = structuredClone(ctx.db.rows);
        for (const [body, status] of cases) {
            const res = await call(ctx, body); assert.equal(res.statusCode, status, res.body); assert.deepEqual(ctx.db.rows, before);
        }
        assert.equal((await call(ctx, payload(original), 1, 999)).statusCode, 404);
    } finally { await ctx.app.close(); }
});

test('fallo de auditoría revierte lote y todos los documentos', async () => {
    const ctx = await createApp();
    try {
        const before = structuredClone(ctx.db.rows); ctx.db.failSave = 'Auditoria';
        const res = await call(ctx, payload(ctx.db.rows.Lote[0]));
        assert.equal(res.statusCode, 500, res.body); assert.deepEqual(ctx.db.rows, before);
        assert.ok(!res.body.includes('simulado'));
    } finally { await ctx.app.close(); }
});

test('acepta producto sin vencimiento y no admite alterar cantidades por la corrección', async () => {
    const ctx = await createApp();
    try {
        const before = quantities(ctx.db);
        const res = await call(ctx, payload(ctx.db.rows.Lote[0], { fecha_vencimiento: null, cantidad_disponible: 999 }));
        assert.equal(res.statusCode, 200, res.body); assert.equal(ctx.db.rows.Lote[0].fecha_vencimiento, null);
        assert.deepEqual(quantities(ctx.db), before);
        const again = await call(ctx, payload({ numero_lote: 'CORREGIDO', fecha_vencimiento: null }));
        assert.equal(again.statusCode, 200, again.body);
    } finally { await ctx.app.close(); }
});

test('inventario publica identificador exacto del lote y permiso de edición según el usuario', async () => {
    const db = createDb();
    const query = db.query;
    db.query = async (sql, args) => /FROM productos p/.test(sql) ? [{ id: 1, codigo: 'P1', descripcion: 'Producto 1', activo: 1,
        lotes_json: [{ id: 11, nota_ingreso_id: 1, numero_lote: 'L1', fecha_vencimiento: '2026-11-01', cantidad_disponible: 100 }] }] : query(sql, args);
    const ctx = await createApp(db);
    try {
        for (const [id, allowed] of [[1, true], [2, false], [3, true]]) {
            const res = await ctx.app.inject({ url: '/api/productos/inventario', headers: ctx.headers(id) });
            assert.equal(res.statusCode, 200, res.body);
            assert.equal(res.json().data[0].puede_editar_lotes, allowed);
            assert.equal(res.json().data[0].lotes[0].id, 11);
            assert.equal(res.json().data[0].lotes[0].nota_ingreso_id, 1);
        }
    } finally { await ctx.app.close(); }
});
