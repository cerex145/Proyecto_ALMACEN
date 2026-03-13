const fs = require('fs');
const path = require('path');

/**
 * SCRIPT DE REEMPLAZO Y RE-MIGRACIÓN
 * 
 * 1. Backup de archivos originales
 * 2. Reemplazar con archivos corregidos
 * 3. Verificar corrección
 */

console.log('\n🔄 INICIANDO PROCESO DE REEMPLAZO...\n');

const salidasOriginal = path.join(__dirname, '../../../salida.csv');
const salidasCorregida = path.join(__dirname, '../../../salida_CORREGIDA.csv');
const ingresosOriginal = path.join(__dirname, '../../../ingreso.csv');
const ingresosCorregida = path.join(__dirname, '../../../ingreso_CORREGIDA.csv');

// 1. Crear backups
console.log('📦 CREANDO BACKUPS...\n');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, '../../../backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

try {
    const salidasBackup = path.join(backupDir, `salida_ORIGINAL_${timestamp}.csv`);
    const ingresosBackup = path.join(backupDir, `ingreso_ORIGINAL_${timestamp}.csv`);
    
    fs.copyFileSync(salidasOriginal, salidasBackup);
    fs.copyFileSync(ingresosOriginal, ingresosBackup);
    
    console.log(`✅ Backup de salida.csv: backups/salida_ORIGINAL_${timestamp}.csv`);
    console.log(`✅ Backup de ingreso.csv: backups/ingreso_ORIGINAL_${timestamp}.csv`);
} catch (error) {
    console.error('❌ Error creando backups:', error.message);
    process.exit(1);
}

// 2. Reemplazar archivos
console.log('\n📝 REEMPLAZANDO ARCHIVOS...\n');

try {
    fs.copyFileSync(salidasCorregida, salidasOriginal);
    fs.copyFileSync(ingresosCorregida, ingresosOriginal);
    
    console.log('✅ salida.csv reemplazado');
    console.log('✅ ingreso.csv reemplazado');
    
    // Eliminar archivos corregidos (ya no los necesitamos)
    fs.unlinkSync(salidasCorregida);
    fs.unlinkSync(ingresosCorregida);
    
    console.log('\n✅ Archivos corregidos eliminados');
} catch (error) {
    console.error('❌ Error reemplazando archivos:', error.message);
    process.exit(1);
}

// 3. Verificación rápida
console.log('\n🔍 VERIFICACIÓN RÁPIDA...\n');

const salidasContent = fs.readFileSync(salidasOriginal, 'utf-8');
const salidasLineas = salidasContent.split('\n').filter(l => l.trim());

let salidasConFecha = 0;
for (let i = 1; i < salidasLineas.length; i++) {
    const valores = salidasLineas[i].split(';');
    if (valores[12]?.trim() && /^\d{2}\/\d{2}\/\d{4}$/.test(valores[12].trim())) {
        salidasConFecha++;
    }
}

const ingresosContent = fs.readFileSync(ingresosOriginal, 'utf-8');
const ingresosLineas = ingresosContent.split('\n').filter(l => l.trim());

let ingresosConFecha = 0;
for (let i = 1; i < ingresosLineas.length; i++) {
    const valores = ingresosLineas[i].split(';');
    if (valores[13]?.trim() && /^\d{2}\/\d{2}\/\d{4}$/.test(valores[13].trim())) {
        ingresosConFecha++;
    }
}

console.log(`📊 Registros con fecha después de corrección:`);
console.log(`   - SALIDAS: ${salidasConFecha} / ${salidasLineas.length - 1} (${((salidasConFecha / (salidasLineas.length - 1)) * 100).toFixed(1)}%)`);
console.log(`   - INGRESOS: ${ingresosConFecha} / ${ingresosLineas.length - 1} (${((ingresosConFecha / (ingresosLineas.length - 1)) * 100).toFixed(1)}%)`);

if (salidasConFecha > 1000 && ingresosConFecha > 1000) {
    console.log('\n✅ CORRECCIÓN VERIFICADA EXITOSAMENTE\n');
} else {
    console.log('\n⚠️  ADVERTENCIA: Verificar que los números sean correctos\n');
}

console.log('='.repeat(70));
console.log('📌 PRÓXIMOS PASOS:');
console.log('='.repeat(70));
console.log(`
1. Limpiar base de datos (eliminar registros migrados):
   Ejecuta: npm run clean:db (si existe)
   O en MySQL:
   DELETE FROM nota_salida_detalles;
   DELETE FROM nota_salida;
   DELETE FROM nota_ingreso_detalles;
   DELETE FROM nota_ingreso;
   DELETE FROM kardex;
   COMMIT;

2. Re-migrar datos corregidos:
   cd apps/api
   node scripts/migrar_csv_urgente.js

3. Verificar que el Kardex está ordenado correctamente:
   - Acceder a la aplicación
   - Filtrar un producto
   - Verificar que las fechas estén en orden cronológico

`);
