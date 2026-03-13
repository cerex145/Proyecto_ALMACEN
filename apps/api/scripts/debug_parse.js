/**
 * DEBUG DETALLADO DE MIGRACIÓN
 */

const fs = require('fs');
const path = require('path');

function parseFecha(str) {
    if (!str || str.trim() === '') return null;
    const match = str.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return null;
    const [, d, m, y] = match.map(Number);
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > 2099) return null;
    const fecha = new Date(y, m - 1, d);
    return fecha.toISOString().split('T')[0];
}

const ingContent = fs.readFileSync(path.join(__dirname, '../../../ingreso.csv'), 'utf-8');
const ingLineas = ingContent.split('\n').filter(l => l.trim());

console.log(`\nTotal líneas ingreso: ${ingLineas.length}\n`);

let procesados = 0;
let saltados = 0;
let porFalta = {
    codProd: 0,
    fechaStr: 0,
    cantidad: 0,
    fechaInvalida: 0
};

for (let i = 1; i < Math.min(100, ingLineas.length); i++) {
    const v = ingLineas[i].split(';');
    const codProd = (v[1] || '').trim();
    const producto = (v[2] || '').trim();
    const lote = (v[3] || '').trim();
    const fechaStr = (v[13] || '').trim();
    const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
    
    let saltado = false;
    if (!codProd) { porFalta.codProd++; saltado = true; }
    if (!fechaStr) { porFalta.fechaStr++; saltado = true; }
    if (cantidad === 0) { porFalta.cantidad++; saltado = true; }
    
    if (!saltado) {
        const fecha = parseFecha(fechaStr);
        if (!fecha) {
            porFalta.fechaInvalida++;
            saltado = true;
            console.log(`Línea ${i+1}: Fecha inválida "${fechaStr}"`);
        } else {
            procesados++;
            if (i <= 5 || i % 50 === 0) {
                console.log(`✅ ${i}. ${codProd} - ${producto} - ${fecha} - ${cantidad}`);
            }
        }
    } else {
        saltados++;
    }
}

console.log(`\n📊 Resumen primeras 100 líneas:`);
console.log(`   Procesados: ${procesados}`);
console.log(`   Saltados: ${saltados}`);
console.log(`     - Sin codProd: ${porFalta.codProd}`);
console.log(`     - Sin fechaStr: ${porFalta.fechaStr}`);
console.log(`     - Sin cantidad: ${porFalta.cantidad}`);
console.log(`     - Fecha inválida: ${porFalta.fechaInvalida}\n`);

// Ahora las salidas
console.log('\n'.repeat(2) + '═'.repeat(70) + '\n');

const salContent = fs.readFileSync(path.join(__dirname, '../../../salida.csv'), 'utf-8');
const salLineas = salContent.split('\n').filter(l => l.trim());

console.log(`Total líneas salida: ${salLineas.length}\n`);

procesados = 0;
saltados = 0;
porFalta = { codProd: 0, fechaStr: 0, cantidad: 0, fechaInvalida: 0 };

for (let i = 1; i < Math.min(100, salLineas.length); i++) {
    const v = salLineas[i].split(';');
    const codProd = (v[1] || '').trim();
    const producto = (v[2] || '').trim();
    const lote = (v[3] || '').trim();
    const fechaStr = (v[12] || '').trim();
    const cantidad = parseFloat((v[10] || '0').trim().replace(',', '.')) || 0;
    
    let saltado = false;
    if (!codProd) { porFalta.codProd++; saltado = true; }
    if (!fechaStr) { porFalta.fechaStr++; saltado = true; }
    if (cantidad === 0) { porFalta.cantidad++; saltado = true; }
    
    if (!saltado) {
        const fecha = parseFecha(fechaStr);
        if (!fecha) {
            porFalta.fechaInvalida++;
            saltado = true;
            console.log(`Línea ${i+1}: Fecha inválida "${fechaStr}"`);
        } else {
            procesados++;
            if (i <= 5 || i % 50 === 0) {
                console.log(`✅ ${i}. ${codProd} - ${producto} - ${fecha} - ${cantidad}`);
            }
        }
    } else {
        saltados++;
    }
}

console.log(`\n📊 Resumen primeras 100 líneas SALIDAS:`);
console.log(`   Procesados: ${procesados}`);
console.log(`   Saltados: ${saltados}`);
console.log(`     - Sin codProd: ${porFalta.codProd}`);
console.log(`     - Sin fechaStr: ${porFalta.fechaStr}`);
console.log(`     - Sin cantidad: ${porFalta.cantidad}`);
console.log(`     - Fecha inválida: ${porFalta.fechaInvalida}\n`);
