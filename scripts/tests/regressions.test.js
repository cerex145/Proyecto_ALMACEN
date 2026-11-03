const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
const { createDb, createApp } = require('./fake-db');
const { applyDetails, restoreDetails } = require('../../apps/api/src/services/salidas-stock.service');
const { quantity } = require('../../apps/api/src/utils/inventory');
const { parseNumber, parseCSV } = require('../../apps/api/src/utils/import');
const { getAlerts, setDays, saveState } = require('../../apps/api/src/services/alertas.service');
const { backupDatabase, restoreDatabase, connectionEnv } = require('../lib/postgres-backup');
const { planRebuild } = require('../../apps/api/scripts/rebuild-stock-from-movements');

const request = { user: { id: 1 }, ip: '127.0.0.1', headers: {} };
const total = (db, product = 1) => db.rows.Lote.filter(l => l.producto_id === product).reduce((n, l) => n + Number(l.cantidad_disponible), 0);
const kardexTotal = db => db.rows.Kardex.filter(k => k.producto_id === 1).reduce((n, k) => n + (['SALIDA', 'AJUSTE_NEGATIVO', 'SALIDA_REVERSA'].includes(k.tipo_movimiento) ? -k.cantidad : k.cantidad), 0);

test('API exige autenticación y bloquea registro público y creación de roles por consultores', async () => {
    const { app, headers } = await createApp();
    try {
        assert.equal((await app.inject('/api/roles')).statusCode, 401);
        const payload = { nombre: 'Nuevo', usuario: 'nuevo', email: 'nuevo@example.com', password: 'segura-123', rol_id: 1 };
        assert.equal((await app.inject({ method: 'POST', url: '/api/usuarios/registro', payload })).statusCode, 401);
        assert.equal((await app.inject({ method: 'POST', url: '/api/roles', headers: headers(2), payload: { nombre: 'Otro', permisos: {} } })).statusCode, 403);
        assert.equal((await app.inject({ method: 'POST', url: '/api/usuarios/registro', headers: headers(1), payload })).statusCode, 201);
        const login = await app.inject({ method: 'POST', url: '/api/usuarios/login', payload: { usuario: 'usuario1', password: 'prueba-segura' } });
        assert.equal(login.statusCode, 200);
        assert.ok(app.jwt.decode(login.json().token).exp > Date.now() / 1000);
        assert.equal((await app.inject({ url: '/api/usuarios/me', headers: headers(2) })).json().usuario.id, 2);
    } finally { await app.close(); }
});

test('usuario desactivado pierde acceso aunque conserve un token válido', async () => {
    const { app, db, headers } = await createApp();
    try { const auth = headers(1); db.rows.Usuario[0].activo = false; assert.equal((await app.inject({ url: '/api/roles', headers: auth })).statusCode, 401); }
    finally { await app.close(); }
});

test('consulta de usuarios activo=true no invierte el filtro', async () => {
    const { app, db, headers } = await createApp();
    try { db.rows.Usuario[1].activo = false; const res = await app.inject({ url: '/api/usuarios?activo=true', headers: headers(1) }); assert.equal(res.statusCode, 200); assert.deepEqual(res.json().data.map(u => u.id), [1, 3]); }
    finally { await app.close(); }
});

test('una salida rechaza el lote de otro producto sin modificar stock', async () => {
    const { app, db, headers } = await createApp();
    try {
        const before = structuredClone(db.rows);
        const res = await app.inject({ method: 'POST', url: '/api/salidas', headers: headers(1), payload: { cliente_id: 1, fecha: '2026-11-02', detalles: [{ producto_id: 1, lote_id: 21, cantidad: 5 }] } });
        assert.equal(res.statusCode, 400, res.body); assert.deepEqual(db.rows, before);
    } finally { await app.close(); }
});

test('salida distribuida entre lotes registra cada lote, precio y saldo; cancelar restituye exactamente una vez', async () => {
    const { app, db, headers } = await createApp();
    try {
        const response = await app.inject({ method: 'POST', url: '/api/salidas', headers: headers(1), payload: { cliente_id: 1, fecha: '2026-11-02', detalles: [{ producto_id: 1, cantidad: 120, precio_unitario: 2.5, cant_caja: 12, cant_x_caja: 10 }] } });
        assert.equal(response.statusCode, 201, response.body);
        assert.deepEqual(db.rows.NotaSalidaDetalle.map(d => [d.lote_id, d.cantidad]), [[11, 100], [12, 20]]);
        assert.ok(db.rows.NotaSalidaDetalle.every(d => d.precio_unitario === 2.5 && d.cant_x_caja === 10));
        assert.equal(db.rows.NotaSalidaDetalle.reduce((n, d) => n + d.cant_caja, 0), 12);
        assert.equal(total(db), 30); assert.equal(kardexTotal(db), 30);
        const id = response.json().data.id;
        assert.equal((await app.inject({ method: 'DELETE', url: `/api/salidas/${id}`, headers: headers(1) })).statusCode, 200);
        assert.equal(total(db), 150); assert.equal(kardexTotal(db), 150);
        assert.equal((await app.inject({ method: 'DELETE', url: `/api/salidas/${id}`, headers: headers(1) })).statusCode, 409);
        assert.equal(total(db), 150);
    } finally { await app.close(); }
});

test('editar una salida revierte lo anterior y aplica lo nuevo en una transacción', async () => {
    const { app, db, headers } = await createApp();
    try {
        const initial = await app.inject({ method: 'POST', url: '/api/salidas', headers: headers(1), payload: { cliente_id: 1, fecha: '2026-11-02', detalles: [{ producto_id: 1, lote_id: 11, cantidad: 10 }] } });
        const id = initial.json().data.id;
        const updated = await app.inject({ method: 'PUT', url: `/api/salidas/${id}`, headers: headers(1), payload: { detalles: [{ producto_id: 1, lote_id: 12, cantidad: 20 }] } });
        assert.equal(updated.statusCode, 200, updated.body); assert.equal(total(db), 130); assert.equal(kardexTotal(db), 130);
        const before = structuredClone(db.rows);
        const bad = await app.inject({ method: 'PUT', url: `/api/salidas/${id}`, headers: headers(1), payload: { detalles: [{ producto_id: 1, lote_id: 21, cantidad: 1 }] } });
        assert.equal(bad.statusCode, 400); assert.deepEqual(db.rows, before);
    } finally { await app.close(); }
});

test('ajustes positivos y negativos mantienen lotes y Kardex de acuerdo', async () => {
    const { app, db, headers } = await createApp();
    try {
        for (const [tipo, cantidad] of [['AJUSTE_POSITIVO', 10], ['AJUSTE_NEGATIVO', 130]]) {
            const res = await app.inject({ method: 'POST', url: '/api/ajustes', headers: headers(1), payload: { producto_id: 1, tipo, cantidad, motivo: 'Recuento de prueba' } });
            assert.equal(res.statusCode, 201, res.body); assert.equal(total(db), kardexTotal(db));
        }
        assert.equal(total(db), 30);
    } finally { await app.close(); }
});

test('no permite eliminar un ingreso cuyo lote tiene stock consumido', async () => {
    const { app, db, headers } = await createApp();
    try { db.rows.Lote[0].cantidad_disponible = 90; const before = structuredClone(db.rows);
        assert.equal((await app.inject({ method: 'DELETE', url: '/api/ingresos/1', headers: headers(1) })).statusCode, 400);
        assert.deepEqual(db.rows, before);
    } finally { await app.close(); }
});

test('salidas antiguas con lotes ambiguos no restituyen la cantidad a varios lotes', async () => {
    const db = createDb(); db.rows.Lote.push({ ...db.rows.Lote[0], id: 13 });
    db.rows.NotaSalidaDetalle.push({ id: 1, nota_salida_id: 1, producto_id: 1, lote_numero: 'L1', cantidad: 5 });
    const before = structuredClone(db.rows);
    await assert.rejects(db.transaction(tx => restoreDetails(tx, { id: 1 })), /ambiguo/);
    assert.deepEqual(db.rows, before);
});

test('el motor común a salidas manuales e importadas conserva la distribución FIFO', async () => {
    const db = createDb();
    await db.transaction(tx => applyDetails(tx, { id: 8, numero_salida: '00000008' }, [{ producto_id: 1, cantidad: 125 }], db.rows.Cliente[0]));
    assert.deepEqual(db.rows.NotaSalidaDetalle.map(d => [d.lote_id, d.cantidad]), [[11, 100], [12, 25]]);
    assert.equal(total(db), 25);
    await db.transaction(tx => restoreDetails(tx, { id: 8 })); assert.equal(total(db), 150);
});

test('un fallo en un detalle de acta revierte la cabecera', async () => {
    const { app, db, headers } = await createApp(); db.failSave = 'ActaRecepcionDetalle';
    try {
        const res = await app.inject({ method: 'POST', url: '/api/actas', headers: headers(1), payload: { cliente_id: 1, fecha: '2026-11-02', detalles: [{ producto_id: 1, lote_numero: 'L1', cantidad_solicitada: 10, cantidad_recibida: 10 }] } });
        assert.equal(res.statusCode, 500); assert.equal(db.rows.ActaRecepcion.length, 0);
    } finally { await app.close(); }
});

test('alertas cambian con el día y el stock; lecturas son individuales y la configuración persiste', async () => {
    const db = createDb();
    let alerts = await getAlerts(db, 1, '2026-11-02');
    assert.equal(alerts.find(a => a.id === 11).estado, 'VENCIDO');
    assert.equal(alerts.find(a => a.id === 12).estado, 'PROXIMO_A_VENCER');
    await saveState(db, request, [alerts.find(a => a.id === 12)], 'LEER_ALERTA');
    assert.equal((await getAlerts(db, 1, '2026-11-02')).find(a => a.id === 12).leida, true);
    assert.equal((await getAlerts(db, 2, '2026-11-02')).find(a => a.id === 12).leida, false);
    await setDays(db, request, 5);
    assert.equal((await getAlerts(db, 1, '2026-11-02')).find(a => a.id === 12).estado, 'VIGENTE');
    assert.equal((await getAlerts(db, 1, '2026-11-21')).find(a => a.id === 12).estado, 'VENCIDO');
    db.rows.Lote[0].cantidad_disponible = 0;
    assert.equal((await getAlerts(db, 1, '2026-11-02')).some(a => a.id === 11), false);
});

test('CSV y números respetan comillas, saltos internos, miles y formatos decimales', () => {
    assert.equal(parseNumber('1.234,56'), 1234.56); assert.equal(parseNumber('1,234.56'), 1234.56);
    assert.equal(parseNumber('12,5'), 12.5); assert.equal(parseNumber('texto', null), null);
    assert.deepEqual(parseCSV('codigo,nombre\nP1,"Nombre, con\nsalto"'), [['codigo', 'nombre'], ['P1', 'Nombre, con\nsalto']]);
    assert.throws(() => parseCSV('a,b\n1,"sin cierre'), /comillas/);
    for (const invalid of [-1, 0, NaN, Infinity, 0.001]) assert.throws(() => quantity(invalid));
});

test('respaldo conserva formato nativo, usa credenciales fuera de argumentos y falla sin publicar archivos parciales', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'almacen-backup-test-'));
    const uri = 'postgresql://demo:password-de-prueba@localhost:5432/test';
    const commands = [];
    const runner = async (binary, args, env) => { commands.push({ binary, args }); assert.equal(env.PGPASSWORD, 'password-de-prueba');
        if (binary === 'pg_dump') fs.writeFileSync(args[args.indexOf('--file') + 1], 'PGDMPfixture'); };
    try {
        const file = await backupDatabase({ databaseUrl: uri, outputDir: dir, env: {}, runner });
        assert.ok(fs.existsSync(file)); assert.ok(commands[0].args.includes('--schema=public'));
        assert.ok(!commands.some(c => c.args.some(arg => arg.includes('password-de-prueba'))));
        await assert.rejects(restoreDatabase({ file, databaseUrl: uri }), /confirm-restore/);
        const restored = await restoreDatabase({ file, confirmed: true, databaseUrl: uri, outputDir: dir, env: {}, runner });
        assert.ok(fs.existsSync(restored.safetyBackup)); assert.ok(commands.at(-1).args.includes('--single-transaction'));
        assert.equal(connectionEnv(uri, {}).PGDATABASE, 'test');
        await assert.rejects(backupDatabase({ databaseUrl: uri, outputDir: dir, env: {}, runner: async (_, args) => {
            fs.writeFileSync(args[args.indexOf('--file') + 1], 'incompleto'); throw new Error('Fallo de respaldo simulado');
        } }), /Fallo de respaldo/);
        assert.equal(fs.readdirSync(dir).some(name => name.endsWith('.partial')), false);
    } finally {
        const target = fs.realpathSync(dir);
        assert.equal(path.dirname(target), fs.realpathSync(os.tmpdir()));
        assert.ok(path.basename(target).startsWith('almacen-backup-test-'));
        fs.rmSync(target, { recursive: true, force: true });
    }
});

test('lotes manuales registran sus aumentos y reducciones en Kardex', async () => {
    const { app, db, headers } = await createApp();
    try {
        const created = await app.inject({ method: 'POST', url: '/api/lotes', headers: headers(1), payload: { producto_id: 1, numero_lote: 'MANUAL', cantidad_ingresada: 10 } });
        assert.equal(created.statusCode, 201, created.body); assert.equal(total(db), kardexTotal(db));
        const id = created.json().data.id;
        const edited = await app.inject({ method: 'PUT', url: `/api/lotes/${id}`, headers: headers(1), payload: { cantidad_disponible: 15 } });
        assert.equal(edited.statusCode, 200, edited.body); assert.equal(total(db), kardexTotal(db));
        assert.equal((await app.inject({ method: 'DELETE', url: `/api/lotes/${id}`, headers: headers(1) })).statusCode, 200);
        assert.equal(total(db), kardexTotal(db));
    } finally { await app.close(); }
});

test('un nuevo ingreso y su eliminación mantienen stock, lotes y saldo global', async () => {
    const { app, db, headers } = await createApp();
    try {
        const created = await app.inject({ method: 'POST', url: '/api/ingresos', headers: headers(1), payload: {
            cliente_id: 1, fecha: '2026-11-02', detalles: [{ producto_id: 1, lote_numero: 'INGRESO-NUEVO', cantidad: 10 }]
        } });
        assert.equal(created.statusCode, 201, created.body); assert.equal(total(db), 160); assert.equal(kardexTotal(db), 160);
        assert.equal(db.rows.Kardex.at(-1).saldo, 160);
        const id = created.json().data.id;
        assert.equal((await app.inject({ method: 'DELETE', url: `/api/ingresos/${id}`, headers: headers(1) })).statusCode, 200);
        assert.equal(total(db), 150); assert.equal(kardexTotal(db), 150);
    } finally { await app.close(); }
});

test('importador CSV de salidas conserva comillas y registra todos los lotes consumidos', async () => {
    const { app, db, headers } = await createApp();
    try {
        const boundary = 'almacen-regression-boundary';
        const csv = 'fecha,codigo_cliente,codigo_producto,cantidad,precio,motivo_salida\n2026-11-02,C1,P1,120,2.5,"Entrega, con coma"';
        const payload = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="salidas.csv"\r\nContent-Type: text/csv\r\n\r\n${csv}\r\n--${boundary}--\r\n`);
        const res = await app.inject({ method: 'POST', url: '/api/salidas/importar', headers: { ...headers(1), 'content-type': `multipart/form-data; boundary=${boundary}` }, payload });
        assert.equal(res.statusCode, 200, res.body); assert.equal(res.json().success, true, res.body);
        assert.deepEqual(db.rows.NotaSalidaDetalle.map(d => [d.lote_id, d.cantidad]), [[11, 100], [12, 20]]);
        assert.equal(db.rows.NotaSalida[0].motivo_salida, 'Entrega, con coma');
        assert.equal(total(db), kardexTotal(db));
    } finally { await app.close(); }
});

test('clientes se desactivan conservando su registro', async () => {
    const { app, db, headers } = await createApp();
    try { assert.equal((await app.inject({ method: 'DELETE', url: '/api/clientes/1', headers: headers(1) })).statusCode, 200); assert.equal(db.rows.Cliente.length, 2); assert.equal(db.rows.Cliente[0].activo, 0); }
    finally { await app.close(); }
});

test('reconstrucción distingue ingresos que comparten número de lote y rechaza salidas antiguas ambiguas', () => {
    const data = { lotes: [
        { id: 1, producto_id: 1, numero_lote: 'MISMO', nota_ingreso_id: 1 },
        { id: 2, producto_id: 1, numero_lote: 'MISMO', nota_ingreso_id: 2 }
    ], ingresos: [
        { producto_id: 1, lote_numero: 'MISMO', nota_ingreso_id: 1, cantidad: 100 },
        { producto_id: 1, lote_numero: 'MISMO', nota_ingreso_id: 2, cantidad: 20 }
    ], salidas: [{ producto_id: 1, lote_numero: 'MISMO', lote_id: 1, cantidad: 10 }] };
    assert.deepEqual(planRebuild(data).map(row => row.cantidad_disponible), [90, 20]);
    data.salidas[0].lote_id = null;
    assert.throws(() => planRebuild(data), /antigua sin lote exacto/);
    data.salidas = []; data.ajustes = [{ producto_id: 1 }];
    assert.throws(() => planRebuild(data), /tiene ajustes/);
});

const sourceRoot = process.env.ALMACEN_TEST_SOURCE_ROOT || path.resolve(__dirname, '../..');
const importSource = async (relative, transform = s => s) => import('data:text/javascript;base64,'
    + Buffer.from(transform(fs.readFileSync(path.join(sourceRoot, relative), 'utf8'))).toString('base64'));

test('fechas de calendario conservan el día y validan fechas imposibles', async () => {
    const { parseCalendarDate, formatCalendarDate } = await importSource('apps/electron/renderer/src/utils/calendar.js');
    const date = parseCalendarDate('2026-07-01');
    assert.equal(date.getDate(), 1); assert.equal(date.getMonth(), 6);
    assert.equal(formatCalendarDate('2026-07-01'), '1/7/2026');
    assert.ok(Number.isNaN(parseCalendarDate('2026-02-31').getTime()));
});

test('parsers de interfaz y servidor usan las mismas reglas numéricas', async () => {
    const frontend = await importSource('apps/electron/renderer/src/utils/numbers.js');
    for (const value of ['1.234,56', '1,234.56', '0', '12,5', '', 'inválido']) assert.equal(frontend.parseNumber(value, null), parseNumber(value, null));
});

test('sesión de interfaz rechaza tokens vencidos y almacenamiento corrupto', async () => {
    const previous = global.localStorage;
    const store = new Map();
    global.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
    try {
        const { authService } = await importSource('apps/electron/renderer/src/services/auth.service.js', s => s.replace("import api from './api';", 'const api = {};'));
        const token = expiry => `a.${Buffer.from(JSON.stringify({ exp: expiry })).toString('base64url')}.z`;
        store.set('token', token(Math.floor(Date.now() / 1000) - 1)); store.set('user', '{"id":1}');
        assert.equal(authService.getCurrentUser(), null); assert.equal(store.size, 0);
        store.set('token', token(Math.floor(Date.now() / 1000) + 3600)); store.set('user', 'json roto');
        assert.equal(authService.getCurrentUser(), null); assert.equal(store.size, 0);
        store.set('token', token(Math.floor(Date.now() / 1000) + 3600)); store.set('user', '{"id":1}');
        assert.equal(authService.getCurrentUser().id, 1);
    } finally { global.localStorage = previous; }
});

test('descargas de documentos usan autenticación y una URL temporal sin incluir el token en la dirección', async () => {
    const previous = { window: global.window, document: global.document, storage: global.localStorage, axios: global.__documentAxios };
    const calls = []; let requestInterceptor, release;
    const link = { click() { calls.push({ download: this.download, href: this.href }); }, remove() {} };
    global.window = { open: () => assert.fail('Un PDF no debe depender de una ventana emergente'), setTimeout: fn => { release = fn; } };
    global.document = { createElement: () => link, body: { appendChild() {} } };
    global.localStorage = { getItem: key => key === 'token' ? 'token-solo-cabecera' : null };
    global.__documentAxios = { create: () => ({ interceptors: {
        request: { use: fn => { requestInterceptor = fn; } }, response: { use() {} }
    }, get: async (url, opts) => { const config = requestInterceptor({ ...opts, headers: {} }); calls.push({ url, config });
        const data = url.endsWith('/2/pdf') ? '<html>Error</html>' : '%PDF-test';
        return { data: new Blob([data]), headers: {} }; } }) };
    try {
        const module = await importSource('apps/electron/renderer/src/services/api.js', s => s
            .replace("import axios from 'axios';", 'const axios = globalThis.__documentAxios;').replaceAll('import.meta.env', '({})'));
        await module.openApiDocument(module.API_ORIGIN + '/api/ingresos/1/pdf');
        assert.equal(calls[0].config.headers.Authorization, 'Bearer token-solo-cabecera');
        assert.ok(!calls[0].url.includes('token-solo-cabecera'));
        assert.ok(calls[1].href.startsWith('blob:'));
        assert.equal(calls[1].download, 'ingresos-1.pdf');
        await assert.rejects(module.openApiDocument(module.API_ORIGIN + '/api/ingresos/2/pdf'), /PDF válido/);
        await assert.rejects(module.openApiDocument('https://otro.example/api/documento'), /no permitida/);
    } finally { release?.(); global.window = previous.window; global.document = previous.document;
        global.localStorage = previous.storage; global.__documentAxios = previous.axios; }
});

test('un ajuste positivo también bloquea la eliminación del ingreso original', async () => {
    const { app, db, headers } = await createApp();
    try {
        const adjustment = await app.inject({ method: 'POST', url: '/api/ajustes', headers: headers(1), payload: {
            producto_id: 1, tipo: 'AJUSTE_POSITIVO', cantidad: 5, motivo: 'Recuento'
        } });
        assert.equal(adjustment.statusCode, 201);
        const lote = db.rows.Lote.find(l => l.id === 12);
        const before = structuredClone(db.rows);
        const res = await app.inject({ method: 'DELETE', url: `/api/ingresos/${lote.nota_ingreso_id}`, headers: headers(1) });
        assert.equal(res.statusCode, 400, res.body); assert.deepEqual(db.rows, before);
    } finally { await app.close(); }
});
