const bcrypt = require('bcryptjs');
const fp = require('fastify-plugin');
const path = require('path');

const clone = value => structuredClone(value);
const nameOf = name => name?.options?.name || name;
const compare = (value, expected) => {
    if (expected && typeof expected === 'object' && expected.type) {
        if (expected.type === 'in') return expected.value.includes(value);
        if (expected.type === 'moreThan') return Number(value) > Number(expected.value);
    }
    if (typeof value === 'boolean' && [0, 1].includes(expected)) return Number(value) === expected;
    return value === expected || (value != null && expected != null && String(value) === String(expected));
};

function createDb() {
    const password = bcrypt.hashSync('prueba-segura', 4);
    const db = { rows: {
        Rol: [{ id: 1, nombre: 'ADMIN', activo: true, permisos: {} }, { id: 2, nombre: 'CONSULTOR', activo: true, permisos: {} }, { id: 3, nombre: 'ALMACENERO', activo: true, permisos: {} }],
        Usuario: [1, 2, 3].map(id => ({ id, usuario: `usuario${id}`, nombre: `Usuario ${id}`, email: `usuario${id}@example.com`, password, rol_id: id, activo: true })),
        Cliente: [{ id: 1, codigo: 'C1', razon_social: 'Cliente 1', cuit: '20100000001', activo: 1 }, { id: 2, codigo: 'C2', razon_social: 'Cliente 2', cuit: '20100000002', activo: 1 }],
        Producto: [{ id: 1, codigo: 'P1', descripcion: 'Producto 1', cliente_id: 1, cliente_ruc: '20100000001', unidad_medida: 'UND', activo: 1 }, { id: 2, codigo: 'P2', descripcion: 'Producto 2', cliente_id: 2, unidad_medida: 'UND', activo: 1 }],
        Lote: [{ id: 11, producto_id: 1, numero_lote: 'L1', nota_ingreso_id: 1, cantidad_ingresada: 100, cantidad_disponible: 100, fecha_vencimiento: '2026-11-01', created_at: '2026-01-01' }, { id: 12, producto_id: 1, numero_lote: 'L2', nota_ingreso_id: 2, cantidad_ingresada: 50, cantidad_disponible: 50, fecha_vencimiento: '2026-11-20', created_at: '2026-01-02' }, { id: 21, producto_id: 2, numero_lote: 'L3', cantidad_ingresada: 200, cantidad_disponible: 200, fecha_vencimiento: '2027-01-01', created_at: '2026-01-01' }],
        NotaIngreso: [1, 2].map(id => ({ id, numero_ingreso: String(id).padStart(8, '0'), numero_guia: `guia-${String(id).padStart(7, '0')}`, cliente_id: 1, fecha: '2026-01-01', estado: 'REGISTRADA' })),
        NotaIngresoDetalle: [{ id: 1, nota_ingreso_id: 1, producto_id: 1, lote_numero: 'L1', cantidad: 100 }, { id: 2, nota_ingreso_id: 2, producto_id: 1, lote_numero: 'L2', cantidad: 50 }],
        Kardex: [{ id: 1, producto_id: 1, lote_numero: 'L1', tipo_movimiento: 'INGRESO', cantidad: 100, saldo: 100, documento_tipo: 'NOTA_INGRESO', referencia_id: 1 }, { id: 2, producto_id: 1, lote_numero: 'L2', tipo_movimiento: 'INGRESO', cantidad: 50, saldo: 150, documento_tipo: 'NOTA_INGRESO', referencia_id: 2 }],
        NotaSalida: [], NotaSalidaDetalle: [], AjusteStock: [], Auditoria: [], ActaRecepcion: [], ActaRecepcionDetalle: [], AlertaVencimiento: []
    }, locks: [], failSave: null };
    const matches = (row, where = {}) => Array.isArray(where) ? where.some(w => matches(row, w))
        : Object.entries(where).every(([key, expected]) => compare(row[key], expected));
    const related = (entity, row) => {
        const result = clone(row);
        if (entity === 'Usuario') result.rol = clone(db.rows.Rol.find(r => r.id === row.rol_id));
        if (entity === 'Lote') result.producto = clone(db.rows.Producto.find(p => p.id === row.producto_id));
        if (entity === 'ActaRecepcion') result.detalles = clone(db.rows.ActaRecepcionDetalle.filter(d => d.acta_id === row.id));
        return result;
    };
    db.find = async (name, opts = {}) => {
        name = nameOf(name);
        let rows = db.rows[name].filter(row => matches(row, opts.where));
        for (const [field, order] of Object.entries(opts.order || {}).reverse()) rows = rows.toSorted((a, b) => String(a[field] ?? '').localeCompare(String(b[field] ?? ''), undefined, { numeric: true }) * (order === 'DESC' ? -1 : 1));
        return rows.slice(opts.skip || 0, opts.take == null ? undefined : (opts.skip || 0) + opts.take).map(row => related(name, row));
    };
    db.findOne = async (name, opts) => (await db.find(name, { ...opts, take: 1 }))[0] || null;
    db.save = async (name, data) => {
        name = nameOf(name);
        if (Array.isArray(data)) return Promise.all(data.map(row => db.save(name, row)));
        if (db.failSave === name) throw new Error('Fallo de persistencia simulado');
        const row = clone(data); delete row.producto; delete row.rol;
        if (!row.id) row.id = Math.max(0, ...db.rows[name].map(r => r.id)) + 1;
        const index = db.rows[name].findIndex(r => r.id === row.id);
        if (index < 0) db.rows[name].push(row); else db.rows[name][index] = { ...db.rows[name][index], ...row };
        Object.assign(data, row);
        return clone(row);
    };
    db.delete = async (name, where) => { name = nameOf(name); const count = db.rows[name].length; db.rows[name] = db.rows[name].filter(row => !matches(row, where)); return { affected: count - db.rows[name].length }; };
    db.query = async (sql, args = []) => {
        if (/FOR UPDATE|pg_advisory/.test(sql)) { db.locks.push({ sql, args }); return []; }
        if (/information_schema.columns/i.test(sql)) return [{ data_type: 'character varying' }];
        if (/JOIN lotes l ON nsd/.test(sql)) return db.rows.NotaSalidaDetalle.filter(d => d.lote_id == null && db.rows.Lote.some(l => l.nota_ingreso_id === args[0] && l.producto_id === d.producto_id && l.numero_lote === d.lote_numero));
        if (/COUNT\(DISTINCT nsd.id\)/.test(sql)) return db.rows.NotaSalidaDetalle.filter(d => args[0].includes(d.lote_id));
        return [];
    };
    db.transaction = async callback => { const before = clone(db.rows); try { return await callback(db); } catch (error) { db.rows = before; throw error; } };
    db.createQueryBuilder = (name, alias) => builder(nameOf(name), alias);
    function builder(entity, alias) {
        let predicates = [], order = {}, skip = 0, take;
        const api = {
            select: () => api, addSelect: () => api, leftJoin: () => api, leftJoinAndSelect: () => api,
            innerJoin: () => api, groupBy: () => api, addGroupBy: () => api,
            where: (sql, params = {}) => { predicates = []; return api.andWhere(sql, params); },
            andWhere: (sql, params = {}) => {
                for (const match of sql.matchAll(/\w+\.(\w+)\s*=\s*:(\w+)/g)) if (params[match[2]] !== undefined) predicates.push(row => compare(row[match[1]], params[match[2]]));
                return api;
            },
            orderBy: (field, direction) => { order = { [field.split('.').at(-1)]: direction }; return api; },
            addOrderBy: (field, direction) => { order[field.split('.').at(-1)] = direction; return api; },
            skip: n => { skip = n; return api; }, take: n => { take = n; return api; }, limit: n => { take = n; return api; },
            getMany: async () => (await db.find(entity, { order })).filter(row => predicates.every(p => p(row))).slice(skip, take == null ? undefined : skip + take),
            getOne: async () => (await api.getMany())[0] || null,
            getManyAndCount: async () => { const rows = (await db.find(entity, { order })).filter(row => predicates.every(p => p(row))); return [rows.slice(skip, take == null ? undefined : skip + take), rows.length]; },
            getRawOne: async () => {
                const rows = await api.getMany();
                const field = entity === 'NotaSalida' ? 'numero_salida' : 'numero_ingreso';
                return { stock: rows.reduce((n, r) => n + Number(r.cantidad_disponible || 0), 0), max: Math.max(0, ...rows.map(r => Number(String(r[field] || '0').match(/\d+$/)?.[0] || 0))) };
            },
            getRawMany: () => api.getMany()
        };
        return api;
    }
    db.getRepository = name => ({
        metadata: { columns: [{ propertyName: 'cuit' }] },
        create: data => clone(data), find: opts => db.find(name, opts), findOne: opts => db.findOne(name, opts),
        findOneBy: where => db.findOne(name, { where }), findBy: where => db.find(name, { where }),
        save: data => db.save(name, data), delete: where => db.delete(name, where),
        countBy: async where => (await db.find(name, { where })).length,
        createQueryBuilder: alias => builder(nameOf(name), alias), manager: { connection: db }
    });
    db.createQueryRunner = () => ({ connect: async () => {}, hasColumn: async () => true, query: async () => [], release: async () => {} });
    return db;
}

let currentDb;
const plugin = path.resolve(__dirname, '../../apps/api/src/plugins/database.plugin.js');
require.cache[require.resolve(plugin)] = { id: plugin, filename: plugin, loaded: true,
    exports: fp(async function testDatabase(app) { app.decorate('db', currentDb); }, { name: 'test-database' }) };
const buildApp = require('../../apps/api/src/app');

async function createApp(db = createDb()) {
    currentDb = db;
    process.env.JWT_SECRET = 'secret-for-isolated-regressions';
    process.env.NODE_ENV = 'test';
    const app = require('fastify')({ logger: false, ajv: { customOptions: { strictTypes: false } } });
    await buildApp(app); await app.ready();
    const token = id => app.jwt.sign({ id });
    return { app, db, headers: id => ({ authorization: `Bearer ${token(id)}` }) };
}

module.exports = { createDb, createApp };
