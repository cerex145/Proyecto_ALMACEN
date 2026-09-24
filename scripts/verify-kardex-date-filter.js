const fs = require('fs');
const path = require('path');

const routePath = path.join(
    __dirname,
    '..',
    'apps',
    'api',
    'src',
    'routes',
    'kardex.routes.js'
);

const source = fs.readFileSync(routePath, 'utf8');
const effectiveDateExpression = 'DATE(COALESCE(ni.fecha, ns.fecha, k.created_at))';
const expressionUses = source.split(effectiveDateExpression).length - 1;

if (expressionUses < 2) {
    throw new Error('El Kardex y su exportacion deben filtrar por la fecha efectiva del movimiento.');
}

if (/AND DATE\(k\.created_at\) [<>]=/.test(source)) {
    throw new Error('El filtro de Kardex no debe usar created_at como fecha principal.');
}

console.log('OK: Kardex y exportacion filtran por la fecha real de la nota.');
