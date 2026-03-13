const fs = require('fs');
const path = require('path');

/**
 * ANÁLISIS DETALLADO - Busca dónde están las fechas faltantes
 */

console.log('\n🔬 ANÁLISIS DETALLADO DE FECHAS...\n');

// ============= SALIDAS =============
console.log('📤 ANALIZANDO SALIDAS...');
const salidasPath = path.join(__dirname, '../../../salida.csv');
const salidasContent = fs.readFileSync(salidasPath, 'utf-8');
const salidasLineas = salidasContent.split('\n').filter(l => l.trim());

console.log(`Total líneas: ${salidasLineas.length}`);

// Mostrar headers
const headers = salidasLineas[0].split(';');
console.log(`\n📋 TODAS LAS COLUMNAS (${headers.length} columnas):`);
headers.forEach((h, i) => {
    console.log(`   [${i}] ${h.trim()}`);
});

// Mostrar primeras 3 líneas CON TODOS sus valores
console.log(`\n📝 PRIMEROS 3 REGISTROS (TODAS LAS COLUMNAS):`);
console.log('─'.repeat(150));

for (let i = 1; i <= 3 && i < salidasLineas.length; i++) {
    console.log(`\n📌 REGISTRO ${i}:`);
    const valores = salidasLineas[i].split(';');
    valores.forEach((v, j) => {
        const encabezado = headers[j] ? headers[j].trim() : `Columna${j}`;
        const valor = v.trim() === '' ? '(vacío)' : v.trim();
        console.log(`   [${j}] ${encabezado}: ${valor}`);
    });
}

// Analizar si hay un patrón con fechas válidas
console.log(`\n🔍 BUSCANDO REGISTROS CON FECHAS VÁLIDAS...\n`);
let registrosConFecha = 0;
let ejemplosFechas = [];

for (let i = 1; i < salidasLineas.length; i++) {
    const valores = salidasLineas[i].split(';');
    
    // Buscar en todas las columnas si hay algo que parezca fecha DD/MM/YYYY
    for (let j = 0; j < valores.length; j++) {
        const valor = valores[j].trim();
        // Patrón de fecha DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
            registrosConFecha++;
            if (ejemplosFechas.length < 5) {
                ejemplosFechas.push({
                    registro: i,
                    columna: j,
                    encabezado: headers[j]?.trim(),
                    valor: valor
                });
            }
        }
    }
}

console.log(`✅ Registros CON fecha encontrados: ${registrosConFecha}`);
if (ejemplosFechas.length > 0) {
    console.log(`\n🎯 Ejemplos de fechas encontradas:`);
    ejemplosFechas.forEach(ej => {
        console.log(`   Registro ${ej.registro}, Columna [${ej.columna}] "${ej.encabezado}": ${ej.valor}`);
    });
}

// ============= INGRESOS =============
console.log(`\n\n📥 ANALIZANDO INGRESOS...\n`);
const ingresosPath = path.join(__dirname, '../../../ingreso.csv');
const ingresosContent = fs.readFileSync(ingresosPath, 'utf-8');
const ingresosLineas = ingresosContent.split('\n').filter(l => l.trim());

console.log(`Total líneas: ${ingresosLineas.length}`);

// Mostrar headers
const headersIng = ingresosLineas[0].split(';');
console.log(`\n📋 TODAS LAS COLUMNAS (${headersIng.length} columnas):`);
headersIng.forEach((h, i) => {
    console.log(`   [${i}] ${h.trim()}`);
});

// Ver qué pasa en la transición donde desaparecen las fechas
console.log(`\n🔄 REGISTROS EN LA TRANSICIÓN (dónde desaparecen fechas):`);

// Encontrar primer registro sin fecha
let primerSinFecha = -1;
for (let i = 1; i < ingresosLineas.length; i++) {
    const valores = ingresosLineas[i].split(';');
    if (valores[13]?.trim() === '') { // Columna Fecha es índice 13
        primerSinFecha = i;
        break;
    }
}

console.log(`\nPrimer registro SIN fecha: ${primerSinFecha}`);
if (primerSinFecha > -1) {
    console.log(`\nÚltimo registro CON fecha:`);
    const valoresConFecha = ingresosLineas[primerSinFecha - 1].split(';');
    valoresConFecha.forEach((v, j) => {
        const enc = headersIng[j]?.trim();
        console.log(`   [${j}] ${enc}: ${v.trim()}`);
    });
    
    console.log(`\nPrimer registro SIN fecha:`);
    const valuesSinFecha = ingresosLineas[primerSinFecha].split(';');
    valuesSinFecha.forEach((v, j) => {
        const enc = headersIng[j]?.trim();
        const valor = v.trim() === '' ? '(vacío)' : v.trim();
        console.log(`   [${j}] ${enc}: ${valor}`);
    });
}

console.log('\n✅ ANÁLISIS COMPLETADO\n');
