const fs = require('fs');
const path = require('path');

const projectRoot = 'c:\\Users\\Carlos\\Documents\\Proyecto_ALMACEN';
const prodFile = path.join(projectRoot, 'Productos.csv');

console.log('Leyendo archivo...\n');
const prodContent = fs.readFileSync(prodFile, 'utf-8');
const prodLineas = prodContent.split('\n').filter(l => l.trim());

console.log(`Total de líneas: ${prodLineas.length}\n`);

console.log('=== PRIMERAS 3 LÍNEAS ===');
for (let i = 0; i < 3 && i < prodLineas.length; i++) {
    console.log(`\nLínea ${i}: ${prodLineas[i].substring(0, 100)}...`);
    const v = prodLineas[i].split(';');
    console.log(`  Columnas: ${v.length}`);
    console.log(`  [1] (código): "${v[1]}"`);
    console.log(`  [2] (nombre): "${v[2]}"`);
    console.log(`  [7] (proveedor): "${v[7]}"`);
    
    // Verificar trim
    const codProd = (v[1] || '').trim();
    const nombre = (v[2] || '').trim();
    console.log(`  Después trim - Código: "${codProd}" (length: ${codProd.length})`);
    console.log(`  Después trim - Nombre: "${nombre}" (length: ${nombre.length})`);
    
    if (i >= 1) {
        console.log(`  ✓ Debería insertarse: ${codProd && nombre ? 'SÍ' : 'NO'}`);
    }
}
