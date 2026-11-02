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
