const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp, createDb } = require('./fake-db');

test('Kardex enlaza correctamente los parámetros de paginación con y sin filtro de cliente', async () => {
    const db = createDb();
    const queries = [];
    const previous = db.query;
    db.query = async (sql, params = []) => {
        if (!/FROM kardex k/.test(sql)) return previous(sql, params);
        const placeholders = [...sql.matchAll(/\$(\d+)/g)].map(match => Number(match[1]));
        assert.equal(Math.max(0, ...placeholders), params.length, 'Cada parámetro debe existir en el SQL enviado a PostgreSQL');
        queries.push({ sql, params: [...params] });
        if (/SELECT COUNT/.test(sql)) return [{ total: '1' }];
        return [{ id: 1, producto_id: 1, tipo_movimiento: 'INGRESO', cantidad: '100', saldo: '100', created_at: new Date(), cliente_nombre_ingreso: 'TRAUMA SPINE E.I.R.L.' }];
    };
    const ctx = await createApp(db);
    try {
        for (const query of ['', '&cliente_nombre=TRAUMA%20SPINE%20E.I.R.L.', '&producto_nombre=prueba&lote_numero=L1&fecha_desde=2026-01-01']) {
            const res = await ctx.app.inject({ url: '/api/kardex?limit=100000&page=2&order=ASC' + query, headers: ctx.headers(1) });
            assert.equal(res.statusCode, 200, res.body);
            assert.equal(res.json().pagination.total, 1);
            assert.equal(res.json().data[0].cantidad, 100);
            assert.deepEqual(queries.at(-1).params.slice(-2), [100000, 100000]);
        }
    } finally { await ctx.app.close(); }
});

test('Kardex acepta reversas y exporta todos los filtros con un total neto coherente', async () => {
    const db = createDb(); const previous = db.query; const queries = [];
    const rows = [
        { id: 1, producto_id: 1, tipo_movimiento: 'INGRESO', cantidad: 100, saldo: 100, created_at: new Date(), lote_numero: 'L1' },
        { id: 2, producto_id: 1, tipo_movimiento: 'SALIDA', cantidad: 30, saldo: 70, created_at: new Date(), lote_numero: 'L1' },
        { id: 3, producto_id: 1, tipo_movimiento: 'SALIDA_REVERSA', cantidad: -10, saldo: 10, created_at: new Date(), lote_numero: 'L1' }
    ];
    db.query = async (sql, params = []) => {
        if (!/FROM kardex k/.test(sql)) return previous(sql, params);
        const placeholders = [...sql.matchAll(/\$(\d+)/g)].map(match => Number(match[1]));
        assert.equal(Math.max(0, ...placeholders), params.length);
        queries.push({ sql, params: [...params] });
        return /SELECT COUNT/.test(sql) ? [{ total: '3' }] : rows;
    };
    const ctx = await createApp(db);
    try {
        const query = '?lote_numero=L1&documento_numero=123&tipo_movimiento=SALIDA_REVERSA';
        const list = await ctx.app.inject({ url: '/api/kardex' + query, headers: ctx.headers(1) });
        assert.equal(list.statusCode, 200, list.body);
        const res = await ctx.app.inject({ url: '/api/kardex/exportar' + query, headers: ctx.headers(1) });
        assert.equal(res.statusCode, 200);
        assert.ok(queries.at(-1).params.includes('%L1%'));
        assert.ok(queries.at(-1).params.includes('%123%'));
        assert.ok(queries.at(-1).params.includes('SALIDA_REVERSA'));
        const workbook = new (require('exceljs').Workbook)();
        await workbook.xlsx.load(res.rawPayload);
        const sheet = workbook.worksheets[0];
        const total = sheet.getRow(sheet.rowCount);
        const header = sheet.getRow(1).values;
        assert.equal(total.getCell(header.findIndex(v => v === 'Ingreso')).value, 100);
        assert.equal(total.getCell(header.findIndex(v => v === 'Salida')).value, 20);
        assert.equal(total.getCell(header.findIndex(v => v === 'Saldo')).value, 80);
    } finally { await ctx.app.close(); }
});

function loadKardexAction(context) {
    const fs = require('fs'), path = require('path');
    const source = fs.readFileSync(process.env.KARDEX_TEST_SOURCE || path.resolve(__dirname, '../../apps/electron/renderer/src/pages/inventory/KardexFuncional.jsx'), 'utf8');
    const ast = require('@babel/parser').parse(source, { sourceType: 'module', plugins: ['jsx'] });
    let action;
    const visit = node => {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'VariableDeclarator' && node.id?.name === 'cargarKardex') action = source.slice(node.init.start, node.init.end);
        for (const [key, value] of Object.entries(node)) {
            if (['loc', 'start', 'end'].includes(key)) continue;
            if (Array.isArray(value)) value.forEach(visit); else if (value && typeof value === 'object') visit(value);
        }
    };
    visit(ast); assert.ok(action);
    return Function('context', 'with(context) { return (' + action + '); }')(context);
}
function actionContext(fetch) {
    const state = {};
    return { state, API_ORIGIN: 'https://api.example.com', fetch, requestSequence: { current: 0 },
        filtroProducto: '', filtroLote: '', filtroDocumento: '', filtroTipo: '', filtroFechaDesde: '', filtroFechaHasta: '', filtroCliente: '',
        setLoading: value => { state.loading = value; }, setLoadError: value => { state.error = value; },
        setMovimientos: value => { state.rows = value; }, setStats: value => { state.stats = value; } };
}
test('la pantalla distingue errores de consulta de un historial vacío y no presenta totales falsos', async () => {
    for (const status of [401, 500]) {
        const context = actionContext(async () => ({ ok: false, status, json: async () => ({ success: false, error: 'fallo' }) }));
        await loadKardexAction(context)();
        assert.ok(context.state.error); assert.deepEqual(context.state.rows, []);
        assert.equal(context.state.loading, false); assert.equal(context.state.stats, undefined);
    }
});
test('la pantalla descarta respuestas antiguas cuando cambian los filtros', async () => {
    const releases = [];
    const context = actionContext(() => new Promise(resolve => releases.push(resolve)));
    const action = loadKardexAction(context);
    const first = action(); const second = action();
    releases[1]({ ok: true, json: async () => ({ success: true, pagination: { total: 1 }, data: [{ id: 2, tipo_movimiento: 'INGRESO', cantidad: 15 }] }) });
    await second;
    releases[0]({ ok: true, json: async () => ({ success: true, pagination: { total: 1 }, data: [{ id: 1, tipo_movimiento: 'INGRESO', cantidad: 99 }] }) });
    await first;
    assert.equal(context.state.rows[0].id, 2); assert.equal(context.state.stats.balance, 15);
});
