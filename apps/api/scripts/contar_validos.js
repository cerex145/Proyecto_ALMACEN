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

console.log('Total líneas:', ingLineas.length);

let validas = 0;
for (let i = 1; i < ingLineas.length; i++) {
    const v = ingLineas[i].split(';');
    const codProd = (v[1] || '').trim();
    const cantidad = parseFloat((v[12] || '0').trim().replace(',', '.')) || 0;
    let fechaStr = (v[13] || '').trim();
    if (!fechaStr) fechaStr = (v[17] || '').trim();
    
    if (!codProd || !fechaStr || cantidad === 0) continue;
    
    const fecha = parseFecha(fechaStr);
    if (!fecha) continue;
    
    validas++;
    if (validas <= 5 || validas % 200 === 0) {
        console.log(`[${i}] ${codProd} - ${fecha} - ${cantidad}`);
    }
}

console.log('\nTotal registros válidos:', validas);
