const fs = require('fs');
const path = require('path');

/**
 * Script de verificación rápida del CSV antes de migrar
 */

console.log('🔍 VERIFICACIÓN RÁPIDA DEL CSV\n');

const csvPath = path.join(__dirname, '../../../DATAA/DB_almacen.csv');

if (!fs.existsSync(csvPath)) {
    console.error('❌ Archivo CSV no encontrado:', csvPath);
    process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lineas = csvContent.split('\n').filter(l => l.trim());

console.log('📊 Estadísticas del CSV:');
console.log('   Total líneas:', lineas.length);
console.log('   Registros (sin header):', lineas.length - 1);

const headers = lineas[0].split(';');
console.log('\n📋 Columnas detectadas:', headers.length);
headers.forEach((h, i) => {
    console.log(`   ${i}: ${h.trim()}`);
});

// Analizar primeros 5 registros
console.log('\n📝 Muestra de primeros 3 registros:\n');
for (let i = 1; i <= Math.min(3, lineas.length - 1); i++) {
    const valores = lineas[i].split(';');
    console.log(`Registro ${i}:`);
    console.log(`   Lote: ${valores[0]}`);
    console.log(`   Código Cliente: ${valores[3]}`);
    console.log(`   Proveedor: ${valores[4]}`);
    console.log(`   Razón Social: ${valores[5]}`);
    console.log(`   Cantidad Total: ${valores[18]}`);
    console.log(`   Fabricante: ${valores[19]}`);
    console.log('');
}

// Contar clientes únicos
const clientes = new Set();
const productos = new Set();

for (let i = 1; i < lineas.length; i++) {
    const valores = lineas[i].split(';');
    const ruc = valores[2]?.trim();
    const codigoCliente = valores[3]?.trim();
    const lote = valores[0]?.trim();

    if (ruc || codigoCliente) {
        clientes.add(ruc || codigoCliente);
    }
    if (lote && codigoCliente) {
        productos.add(`${codigoCliente}-${lote}`);
    }
}

console.log('📊 Resumen:');
console.log(`   Clientes únicos: ${clientes.size}`);
console.log(`   Productos únicos: ${productos.size}`);
console.log(`   Total registros: ${lineas.length - 1}`);

console.log('\n✅ Verificación completada!');
console.log('\n💡 Para migrar, ejecuta:');
console.log('   node migrar_csv_urgente.js\n');
