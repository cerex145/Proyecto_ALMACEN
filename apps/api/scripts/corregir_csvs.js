const fs = require('fs');
const path = require('path');

/**
 * CORRECTOR DE CSVs - Mueve fechas a la columna correcta
 * 
 * Problema:
 * - salida.csv: fechas en columna [16] "AÑO", deben ir en [12] "Fecha de H_Salida"
 * - ingreso.csv: fechas parcialmente en [13], parcialmente en [17] "AÑO"
 * 
 * Solución: 
 * - Detectar fechas en columna [16/17] y moverlas a [12/13]
 */

console.log('\n🔧 INICIANDO CORRECCIÓN DE CSVs...\n');

// ============= FUNCIÓN: CORREGIR SALIDAS =============
function corregirSalidas() {
    console.log('📤 CORRIGIENDO SALIDAS...\n');
    
    const filePath = path.join(__dirname, '../../../salida.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lineas = content.split('\n');
    
    // Línea de headers
    const headers = lineas[0].split(';');
    console.log(`Headers encontrados: ${headers.length}`);
    
    let lineasCorregidas = 0;
    let lineasConFechaMovida = 0;
    
    // Procesar cada línea
    const lineasProcesadas = lineas.map((linea, idx) => {
        if (idx === 0) return linea; // Headers sin cambios
        if (linea.trim() === '') return linea; // Líneas vacías
        
        const valores = linea.split(';');
        
        // Si la columna [12] está vacía pero [16] tiene una fecha
        if ((valores[12]?.trim() === '' || !valores[12]) && valores[16]?.trim()) {
            // Validar que [16] sea una fecha DD/MM/YYYY
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(valores[16].trim())) {
                // Mover fecha de [16] a [12]
                valores[12] = valores[16];
                valores[16] = ''; // Limpiar columna [16]
                lineasConFechaMovida++;
            }
        }
        
        lineasCorregidas++;
        return valores.join(';');
    });
    
    // Guardar archivo corregido
    const outputPath = path.join(__dirname, '../../../salida_CORREGIDA.csv');
    fs.writeFileSync(outputPath, lineasProcesadas.join('\n'));
    
    console.log(`✅ Salidas corregidas:`);
    console.log(`   - Total líneas procesadas: ${lineasCorregidas}`);
    console.log(`   - Fechas movidas: ${lineasConFechaMovida}`);
    console.log(`   - Archivo guardado: salida_CORREGIDA.csv\n`);
    
    return lineasConFechaMovida;
}

// ============= FUNCIÓN: CORREGIR INGRESOS =============
function corregirIngresos() {
    console.log('📥 CORRIGIENDO INGRESOS...\n');
    
    const filePath = path.join(__dirname, '../../../ingreso.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lineas = content.split('\n');
    
    // Línea de headers
    const headers = lineas[0].split(';');
    console.log(`Headers encontrados: ${headers.length}`);
    
    let lineasCorregidas = 0;
    let lineasConFechaMovida = 0;
    let lineasConFechaExistente = 0;
    
    // Procesar cada línea
    const lineasProcesadas = lineas.map((linea, idx) => {
        if (idx === 0) return linea; // Headers sin cambios
        if (linea.trim() === '') return linea; // Líneas vacías
        
        const valores = linea.split(';');
        
        // Si la columna [13] está vacía pero [17] tiene una fecha
        if ((valores[13]?.trim() === '' || !valores[13]) && valores[17]?.trim()) {
            // Validar que [17] sea una fecha DD/MM/YYYY
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(valores[17].trim())) {
                // Mover fecha de [17] a [13]
                valores[13] = valores[17];
                valores[17] = ''; // Limpiar columna [17]
                lineasConFechaMovida++;
            }
        } else if (valores[13]?.trim() && /^\d{2}\/\d{2}\/\d{4}$/.test(valores[13].trim())) {
            // Ya tiene fecha en el lugar correcto
            lineasConFechaExistente++;
        }
        
        lineasCorregidas++;
        return valores.join(';');
    });
    
    // Guardar archivo corregido
    const outputPath = path.join(__dirname, '../../../ingreso_CORREGIDA.csv');
    fs.writeFileSync(outputPath, lineasProcesadas.join('\n'));
    
    console.log(`✅ Ingresos corregidos:`);
    console.log(`   - Total líneas procesadas: ${lineasCorregidas}`);
    console.log(`   - Fechas ya existentes en [13]: ${lineasConFechaExistente}`);
    console.log(`   - Fechas movidas de [17] a [13]: ${lineasConFechaMovida}`);
    console.log(`   - Total con fecha: ${lineasConFechaExistente + lineasConFechaMovida}`);
    console.log(`   - Archivo guardado: ingreso_CORREGIDA.csv\n`);
    
    return lineasConFechaMovida;
}

// ============= EJECUTAR =============
try {
    const salidasMovidas = corregirSalidas();
    const ingresosMovidas = corregirIngresos();
    
    console.log('='.repeat(70));
    console.log('🎉 CORRECCIÓN COMPLETADA');
    console.log('='.repeat(70));
    console.log(`\n📌 Resumen:`);
    console.log(`   - Fechas movidas en SALIDAS: ${salidasMovidas}`);
    console.log(`   - Fechas movidas en INGRESOS: ${ingresosMovidas}`);
    console.log(`\n📂 Archivos generados:`);
    console.log(`   - salida_CORREGIDA.csv`);
    console.log(`   - ingreso_CORREGIDA.csv`);
    console.log(`\n✅ Próximo paso: Reemplazar los archivos originales y re-migrar.\n`);
    
} catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
}
