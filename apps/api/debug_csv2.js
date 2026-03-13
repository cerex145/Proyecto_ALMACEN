const fs = require('fs');

// Leer archivo ingreso.csv
const ingPath = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN\\ingreso.csv';
const content = fs.readFileSync(ingPath, 'utf-8');
const lineas = content.split('\n').filter(l => l.trim());

console.log('\n=== INGRESO.CSV ===');
console.log('Total de líneas:', lineas.length);
console.log('\nPRIMER DATO:');
const cols = lineas[1].split(';');
console.log('Total columnas:', cols.length);
cols.forEach((col, idx) => {
    if (idx < 15) {
        console.log(`  [${idx}]: "${col}"`);
    }
});

console.log('\n\nExtracción:');
console.log('Código Prod [1]:', cols[1]?.trim());
console.log('Lote [3]:', cols[3]?.trim());
console.log('Fecha [13]:', cols[13]?.trim());
console.log('Cantidad [12]:', cols[12]?.trim());

// Leer archivo salida.csv
const salPath = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN\\salida.csv';
const salContent = fs.readFileSync(salPath, 'utf-8');
const salLineas = salContent.split('\n').filter(l => l.trim());

console.log('\n\n=== SALIDA.CSV ===');
console.log('Total de líneas:', salLineas.length);
console.log('\nPRIMER DATO:');
const salCols = salLineas[1].split(';');
console.log('Total columnas:', salCols.length);
salCols.forEach((col, idx) => {
    if (idx < 18) {
        console.log(`  [${idx}]: "${col}"`);
    }
});

console.log('\n\nExtracción:');
console.log('Código Prod [1]:', salCols[1]?.trim());
console.log('Lote [3]:', salCols[3]?.trim());
console.log('Fecha [12]:', salCols[12]?.trim());
console.log('Fecha [16]:', salCols[16]?.trim());
console.log('Cantidad [10]:', salCols[10]?.trim());
