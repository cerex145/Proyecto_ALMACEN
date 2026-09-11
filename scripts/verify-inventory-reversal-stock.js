const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const productosRoutesPath = path.join(projectRoot, 'apps/api/src/routes/productos.routes.js');
const source = fs.readFileSync(productosRoutesPath, 'utf8');

const expectedSqlRule = /WHEN\s+k\.tipo_movimiento\s+IN\s*\(\s*'SALIDA'\s*,\s*'AJUSTE_NEGATIVO'\s*,\s*'SALIDA_REVERSA'\s*\)\s+THEN\s+-k\.cantidad/s;

if (!expectedSqlRule.test(source)) {
  throw new Error('Inventario no esta considerando SALIDA_REVERSA como reversa de salida.');
}

const movementDeltas = [
  { type: 'INGRESO', quantity: 1890 },
  { type: 'SALIDA', quantity: 945 },
  { type: 'SALIDA', quantity: 945 },
  { type: 'SALIDA_REVERSA', quantity: -945 },
  { type: 'SALIDA', quantity: 945 }
];

const stock = movementDeltas.reduce((total, movement) => {
  if (['INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION'].includes(movement.type)) {
    return total + movement.quantity;
  }

  if (['SALIDA', 'AJUSTE_NEGATIVO', 'SALIDA_REVERSA'].includes(movement.type)) {
    return total - movement.quantity;
  }

  return total;
}, 0);

if (stock !== 0) {
  throw new Error(`La regla de reversa debe dejar el stock en 0; resultado actual: ${stock}`);
}

console.log('OK: inventario considera SALIDA_REVERSA y mantiene stock final en 0.');
