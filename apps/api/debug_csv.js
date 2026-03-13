const fs = require('fs');
const path = require('path');

// Leer archivo Productos.csv
const prodPath = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN\\Productos.csv';
const content = fs.readFileSync(prodPath, 'utf-8');
const lineas = content.split('\n').filter(l => l.trim());

console.log('Total de líneas:', lineas.length);
console.log('\n=== PRIMERA LÍNEA (ENCABEZADO) ===');
console.log(lineas[0]);

console.log('\n=== SEGUNDA LÍNEA (PRIMER DATO) ===');
console.log(lineas[1]);

console.log('\n=== PARSING DE SEGUNDA LÍNEA ===');
const cols = lineas[1].split(';');
console.log('Total de columnas:', cols.length);
cols.forEach((col, idx) => {
    if (idx <= 10 || idx >= cols.length - 2) {
        console.log(`  [${idx}]: "${col}"`);
    }
});

console.log('\n=== EXTRAYENDO DATOS ===');
if (cols.length > 2) {
    console.log('Código (col[1]):', cols[1]);
    console.log('Producto (col[2]):', cols[2]);
    console.log('Proveedor (col[7]):', cols[7]);
}
