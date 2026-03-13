const fs = require('fs');
const path = require('path');

/**
 * SCRIPT DE DIAGNÓSTICO - Análisis de migración CSV
 * 
 * Verifica:
 * 1. Estructura de ambos CSVs (ingresos y salidas)
 * 2. Fechas en cada CSV
 * 3. Productos que salen sin entrar
 * 4. Inconsistencias de datos
 * 
 * Uso: node diagnostico_csv.js
 */

console.log('\n🔍 INICIANDO DIAGNÓSTICO DE MIGRACIÓN...\n');

// ============= FUNCIÓN 1: ANALIZAR CSV =============
function analizarCSV(filePath, nombre) {
    console.log(`\n📄 Analizando ${nombre}...`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ Archivo no encontrado: ${filePath}`);
        return null;
    }
    
    const contenido = fs.readFileSync(filePath, 'utf-8');
    const lineas = contenido.split('\n').filter(l => l.trim());
    
    console.log(`✅ Archivo encontrado: ${lineas.length} líneas`);
    
    // Parsear headers
    const headers = lineas[0].split(';').map(h => h.trim());
    console.log(`📋 Columnas: ${headers.length}`);
    console.log(`   ${headers.join(' | ')}`);
    
    return { lineas, headers };
}

// ============= FUNCIÓN 2: ANALIZAR INGRESOS =============
function analizarIngresos() {
    console.log('\n' + '='.repeat(80));
    console.log('📥 ANÁLISIS DE INGRESOS');
    console.log('='.repeat(80));
    
    const csvPath = path.join(__dirname, '../../../ingreso.csv');
    const data = analizarCSV(csvPath, 'INGRESOS');
    
    if (!data) return null;
    
    const { lineas, headers } = data;
    
    // Encontrar índices importantes
    const idxFecha = headers.findIndex(h => h.includes('Fecha de H_Ingreso') || h.includes('Fecha Ingreso'));
    const idxProducto = headers.findIndex(h => h.includes('Cod. Producto') || h.includes('Cod.Producto'));
    const idxLote = headers.findIndex(h => h.includes('Lote'));
    const idxCantidad = headers.findIndex(h => h.includes('Cant.Total_Ingreso'));
    
    console.log(`\n🔑 Índices detectados:`);
    console.log(`   - Fecha: [${idxFecha}] ${headers[idxFecha] || 'NO ENCONTRADA'}`);
    console.log(`   - Producto: [${idxProducto}] ${headers[idxProducto] || 'NO ENCONTRADA'}`);
    console.log(`   - Lote: [${idxLote}] ${headers[idxLote] || 'NO ENCONTRADA'}`);
    console.log(`   - Cantidad: [${idxCantidad}] ${headers[idxCantidad] || 'NO ENCONTRADA'}`);
    
    // Analizar primeros registros
    console.log(`\n📊 Primeros 10 registros de INGRESOS:`);
    console.log('-'.repeat(120));
    
    const productos = {};
    const fechas = [];
    
    for (let i = 1; i < Math.min(11, lineas.length); i++) {
        const valores = lineas[i].split(';').map(v => v.trim());
        const fecha = valores[idxFecha] || '(vacío)';
        const producto = valores[idxProducto] || '(vacío)';
        const lote = valores[idxLote] || '(vacío)';
        const cantidad = valores[idxCantidad] || '0';
        
        console.log(`${i}. ${producto} | Lote: ${lote} | Fecha: ${fecha} | Cant: ${cantidad}`);
        
        if (producto !== '(vacío)') {
            productos[producto] = (productos[producto] || 0) + parseFloat(cantidad);
        }
        if (fecha !== '(vacío)') {
            fechas.push(fecha);
        }
    }
    
    // Analizar últimos registros
    console.log(`\n📊 Últimos 10 registros de INGRESOS:`);
    console.log('-'.repeat(120));
    
    const inicio = Math.max(1, lineas.length - 10);
    for (let i = inicio; i < lineas.length; i++) {
        const valores = lineas[i].split(';').map(v => v.trim());
        const fecha = valores[idxFecha] || '(vacío)';
        const producto = valores[idxProducto] || '(vacío)';
        const lote = valores[idxLote] || '(vacío)';
        const cantidad = valores[idxCantidad] || '0';
        
        console.log(`${i}. ${producto} | Lote: ${lote} | Fecha: ${fecha} | Cant: ${cantidad}`);
    }
    
    // Estadísticas
    console.log(`\n📈 ESTADÍSTICAS INGRESOS:`);
    console.log(`   - Total registros: ${lineas.length - 1}`);
    console.log(`   - Productos únicos: ${Object.keys(productos).length}`);
    console.log(`   - Fechas encontradas: ${fechas.length}`);
    console.log(`   - Rango fechas: ${Math.min(...fechas)} a ${Math.max(...fechas)}`);
    
    return { productos, fechas, idxFecha, idxProducto };
}

// ============= FUNCIÓN 3: ANALIZAR SALIDAS =============
function analizarSalidas() {
    console.log('\n' + '='.repeat(80));
    console.log('📤 ANÁLISIS DE SALIDAS');
    console.log('='.repeat(80));
    
    const csvPath = path.join(__dirname, '../../../salida.csv');
    const data = analizarCSV(csvPath, 'SALIDAS');
    
    if (!data) return null;
    
    const { lineas, headers } = data;
    
    // Encontrar índices importantes
    const idxFecha = headers.findIndex(h => h.includes('Fecha de H_Salida') || h.includes('Fecha Salida'));
    const idxProducto = headers.findIndex(h => h.includes('Cod. Producto') || h.includes('Cod.Producto'));
    const idxLote = headers.findIndex(h => h.includes('Lote'));
    const idxCantidad = headers.findIndex(h => h.includes('Cant.Total_Salida') || h.includes('Cant.Total'));
    
    console.log(`\n🔑 Índices detectados:`);
    console.log(`   - Fecha: [${idxFecha}] ${headers[idxFecha] || 'NO ENCONTRADA'}`);
    console.log(`   - Producto: [${idxProducto}] ${headers[idxProducto] || 'NO ENCONTRADA'}`);
    console.log(`   - Lote: [${idxLote}] ${headers[idxLote] || 'NO ENCONTRADA'}`);
    console.log(`   - Cantidad: [${idxCantidad}] ${headers[idxCantidad] || 'NO ENCONTRADA'}`);
    
    // Analizar primeros registros
    console.log(`\n📊 Primeros 10 registros de SALIDAS:`);
    console.log('-'.repeat(120));
    
    const productos = {};
    const fechas = [];
    let registrosSinFecha = 0;
    
    for (let i = 1; i < Math.min(11, lineas.length); i++) {
        const valores = lineas[i].split(';').map(v => v.trim());
        const fecha = valores[idxFecha] || '(vacío)';
        const producto = valores[idxProducto] || '(vacío)';
        const lote = valores[idxLote] || '(vacío)';
        const cantidad = valores[idxCantidad] || '0';
        
        const estado = fecha === '(vacío)' ? '❌ SIN FECHA' : '✅';
        console.log(`${i}. ${estado} | ${producto} | Lote: ${lote} | Fecha: ${fecha} | Cant: ${cantidad}`);
        
        if (producto !== '(vacío)') {
            productos[producto] = (productos[producto] || 0) + parseFloat(cantidad);
        }
        if (fecha !== '(vacío)') {
            fechas.push(fecha);
        } else {
            registrosSinFecha++;
        }
    }
    
    // Analizar últimos registros
    console.log(`\n📊 Últimos 10 registros de SALIDAS:`);
    console.log('-'.repeat(120));
    
    const inicio = Math.max(1, lineas.length - 10);
    for (let i = inicio; i < lineas.length; i++) {
        const valores = lineas[i].split(';').map(v => v.trim());
        const fecha = valores[idxFecha] || '(vacío)';
        const producto = valores[idxProducto] || '(vacío)';
        const lote = valores[idxLote] || '(vacío)';
        const cantidad = valores[idxCantidad] || '0';
        
        const estado = fecha === '(vacío)' ? '❌ SIN FECHA' : '✅';
        console.log(`${i}. ${estado} | ${producto} | Lote: ${lote} | Fecha: ${fecha} | Cant: ${cantidad}`);
    }
    
    // Contar registros sin fecha en todo el archivo
    let totalSinFecha = 0;
    for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i].split(';').map(v => v.trim());
        if (valores[idxFecha] === '' || !valores[idxFecha]) {
            totalSinFecha++;
        }
    }
    
    // Estadísticas
    console.log(`\n📈 ESTADÍSTICAS SALIDAS:`);
    console.log(`   - Total registros: ${lineas.length - 1}`);
    console.log(`   - Registros SIN fecha: ${totalSinFecha} (${((totalSinFecha / (lineas.length - 1)) * 100).toFixed(1)}%)`);
    console.log(`   - Productos únicos: ${Object.keys(productos).length}`);
    console.log(`   - Fechas encontradas: ${fechas.length}`);
    if (fechas.length > 0) {
        console.log(`   - Rango fechas: ${Math.min(...fechas)} a ${Math.max(...fechas)}`);
    }
    
    return { productos, fechas, registrosSinFecha: totalSinFecha };
}

// ============= FUNCIÓN 4: COMPARAR =============
function compararDatos(ingresos, salidas) {
    console.log('\n' + '='.repeat(80));
    console.log('⚖️  COMPARATIVA INGRESOS vs SALIDAS');
    console.log('='.repeat(80));
    
    const productosIngreso = Object.keys(ingresos.productos);
    const productosSalida = Object.keys(salidas.productos);
    
    console.log(`\n📊 Productos que SALEN pero NO ENTRAN:`);
    const salePeronNoEntran = productosSalida.filter(p => !productosIngreso.includes(p));
    
    if (salePeronNoEntran.length > 0) {
        console.log(`❌ ENCONTRADO PROBLEMA: ${salePeronNoEntran.length} productos`);
        salePeronNoEntran.slice(0, 10).forEach(p => {
            console.log(`   - ${p} | Cantidad: ${salidas.productos[p]}`);
        });
    } else {
        console.log(`✅ Todos los productos que salen, tienen entrada`);
    }
    
    console.log(`\n⏰ PROBLEMAS DE FECHAS:`);
    console.log(`   📥 INGRESOS: ${ingresos.fechas.length} registros con fecha válida`);
    console.log(`   📤 SALIDAS: ${salidas.fechas.length} registros con fecha válida`);
    console.log(`   ❌ SALIDAS SIN FECHA: ${salidas.registrosSinFecha} (CRÍTICO!)`);
    
    if (salidas.registrosSinFecha > 100) {
        console.log(`\n🚨 ALERTA: Hay ${salidas.registrosSinFecha} salidas sin fecha.`);
        console.log(`   Esto explica por qué el kardex está desordenado!`);
    }
}

// ============= EJECUTAR =============
try {
    const ingresos = analizarIngresos();
    const salidas = analizarSalidas();
    
    if (ingresos && salidas) {
        compararDatos(ingresos, salidas);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('='.repeat(80) + '\n');
    
} catch (error) {
    console.error('\n❌ ERROR EN DIAGNÓSTICO:', error.message);
    console.error(error.stack);
}
