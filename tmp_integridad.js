const fs = require('fs');
const path = require('path');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseCSV(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    // Normalizar saltos de línea y eliminar líneas partidas (CSV con campos entre comillas con \n)
    const cleaned = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = [];
    let current = '';
    let inQuotes = false;
    for (const ch of cleaned) {
        if (ch === '"') { inQuotes = !inQuotes; current += ch; }
        else if (ch === '\n' && !inQuotes) { lines.push(current); current = ''; }
        else { current += ch; }
    }
    if (current.trim()) lines.push(current);

    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = lines[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = vals[idx] || ''; });
        rows.push(obj);
    }
    return rows;
}

function parseDate(str) {
    if (!str || str.trim() === '' || str === 'N/A' || str === 'N') return null;
    // Try D/M/YYYY or M/D/YYYY or YYYY-MM-DD
    const parts = str.split('/');
    if (parts.length === 3) {
        const [a, b, c] = parts.map(Number);
        if (c > 1000) { // D/M/YYYY
            return new Date(c, b - 1, a);
        } else { // M/D/YYYY (american format in some rows)
            return new Date(a, b - 1, c);
        }
    }
    const d = new Date(str);
    return isNaN(d) ? null : d;
}

// ─── Cargar CSVs ──────────────────────────────────────────────────────────────
const BASE = 'C:/Users/Carlos/Documents/Proyecto_ALMACEN';
console.log('Cargando CSVs...');
const ingresos = parseCSV(path.join(BASE, 'ingreso.csv'));
const salidas = parseCSV(path.join(BASE, 'salida.csv'));
const productos = parseCSV(path.join(BASE, 'Productos.csv'));

console.log(`Ingresos: ${ingresos.length} filas`);
console.log(`Salidas:  ${salidas.length} filas`);
console.log(`Productos: ${productos.length} filas`);

// ─── Mapas de stock por código ─────────────────────────────────────────────
const ingMap = {};   // codigo => { totalIngresado, filas[] }
const salMap = {};   // codigo => { totalSalido, filas[] }
const prodMap = {};  // codigo => { cantidadTotal }

for (const row of productos) {
    const cod = (row['Cod. Producto'] || '').trim();
    if (!cod) continue;
    const qty = parseFloat((row['Cantidad Total'] || '0').replace(',', '.')) || 0;
    if (!prodMap[cod]) prodMap[cod] = { total: 0, filas: [] };
    prodMap[cod].total += qty;
    prodMap[cod].filas.push(row);
}

for (const row of ingresos) {
    const cod = (row['Cod. Producto'] || '').trim();
    if (!cod) continue;
    const qty = parseFloat((row['Cant.Total_Ingreso'] || '0').replace(',', '.')) || 0;
    const fecha = row['Fecha de H_Ingreso'] || '';
    if (!ingMap[cod]) ingMap[cod] = { total: 0, filas: [] };
    ingMap[cod].total += qty;
    ingMap[cod].filas.push({ fecha, qty, lote: row['Lote'] });
}

for (const row of salidas) {
    const cod = (row['Cod. Producto'] || '').trim();
    if (!cod) continue;
    const qty = parseFloat((row['Cant.Total_Salida'] || '0').replace(',', '.')) || 0;
    const fecha = row['Fecha de H_Salida'] || '';
    if (!salMap[cod]) salMap[cod] = { total: 0, filas: [] };
    salMap[cod].total += qty;
    salMap[cod].filas.push({ fecha, qty, lote: row['Lote'] });
}

// ─── Análisis 1: Cronología inválida (salida ANTES de ingreso) ────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log('ANÁLISIS 1: Productos con SALIDA antes de INGRESO');
console.log('════════════════════════════════════════════════════════');

const cronologiaInvalida = [];

const allCodes = new Set([...Object.keys(ingMap), ...Object.keys(salMap)]);
for (const cod of allCodes) {
    const ing = ingMap[cod];
    const sal = salMap[cod];
    if (!ing || !sal) continue;

    // Fecha mínima de ingreso y mínima de salida
    const fechasIngreso = ing.filas.map(f => parseDate(f.fecha)).filter(Boolean);
    const fechasSalida = sal.filas.map(f => parseDate(f.fecha)).filter(Boolean);

    if (fechasIngreso.length === 0 || fechasSalida.length === 0) continue;

    const minIngreso = new Date(Math.min(...fechasIngreso));
    const minSalida = new Date(Math.min(...fechasSalida));

    if (minSalida < minIngreso) {
        cronologiaInvalida.push({
            codigo: cod,
            primera_salida: minSalida.toLocaleDateString('es-PE'),
            primer_ingreso: minIngreso.toLocaleDateString('es-PE'),
            dias_diferencia: Math.round((minIngreso - minSalida) / 86400000),
            total_ingresado: ing.total,
            total_salido: sal.total,
            balance: ing.total - sal.total
        });
    }
}

cronologiaInvalida.sort((a, b) => b.dias_diferencia - a.dias_diferencia);
console.log(`\nTotal con cronología inválida: ${cronologiaInvalida.length} productos`);
if (cronologiaInvalida.length > 0) {
    console.table(cronologiaInvalida.slice(0, 20));
}

// ─── Análisis 2: Salidas > Ingresos (stock negativo) ─────────────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log('ANÁLISIS 2: Productos donde SALIDAS > INGRESOS (stock negativo)');
console.log('════════════════════════════════════════════════════════');

const stockNegativo = [];
for (const cod of allCodes) {
    const ing = ingMap[cod] ? ingMap[cod].total : 0;
    const sal = salMap[cod] ? salMap[cod].total : 0;
    const balance = ing - sal;
    if (balance < 0) {
        stockNegativo.push({ codigo: cod, ingresado: ing, salido: sal, deficit: Math.abs(balance) });
    }
}
stockNegativo.sort((a, b) => b.deficit - a.deficit);
console.log(`Total con stock negativo: ${stockNegativo.length} productos`);
if (stockNegativo.length > 0) console.table(stockNegativo.slice(0, 15));

// ─── Análisis 3: En salidas pero NO en ingresos ni productos ─────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log('ANÁLISIS 3: Productos en SALIDAS que no están en INGRESOS');
console.log('════════════════════════════════════════════════════════');

const soloEnSalidas = [];
for (const cod of Object.keys(salMap)) {
    if (!ingMap[cod] && !prodMap[cod]) {
        soloEnSalidas.push({ codigo: cod, total_salido: salMap[cod].total });
    }
}
console.log(`Total solo en salidas (sin ingreso ni producto): ${soloEnSalidas.length}`);
if (soloEnSalidas.length > 0) console.table(soloEnSalidas.slice(0, 10));

// ─── Análisis 4: En productos pero NO en ingresos ────────────────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log('ANÁLISIS 4: Productos en CSV principal sin registro en INGRESOS');
console.log('════════════════════════════════════════════════════════');

const sinIngreso = [];
for (const cod of Object.keys(prodMap)) {
    if (!ingMap[cod]) {
        sinIngreso.push({ codigo: cod, cantidad_producto: prodMap[cod].total });
    }
}
console.log(`Total productos sin ingreso: ${sinIngreso.length}`);

// ─── Análisis 5: Discrepancia de cantidades ───────────────────────────────────
console.log('\n════════════════════════════════════════════════════════');
console.log('ANÁLISIS 5: Discrepancia entre Productos.csv e Ingreso.csv');
console.log('════════════════════════════════════════════════════════');

const discrepancias = [];
for (const cod of new Set([...Object.keys(prodMap), ...Object.keys(ingMap)])) {
    const prodQty = prodMap[cod] ? prodMap[cod].total : 0;
    const ingQty = ingMap[cod] ? ingMap[cod].total : 0;
    const diff = Math.abs(prodQty - ingQty);
    if (diff > 0.01) {
        discrepancias.push({ codigo: cod, en_productos: prodQty, en_ingresos: ingQty, diferencia: +(prodQty - ingQty).toFixed(2) });
    }
}
discrepancias.sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));
console.log(`Total con discrepancia de cantidad: ${discrepancias.length}`);
if (discrepancias.length > 0) console.table(discrepancias.slice(0, 15));

// ─── Resumen final ────────────────────────────────────────────────────────────
const resumen = {
    total_productos_csv: Object.keys(prodMap).length,
    total_codigos_ingresos: Object.keys(ingMap).length,
    total_codigos_salidas: Object.keys(salMap).length,
    cronologia_invalida: cronologiaInvalida.length,
    stock_negativo: stockNegativo.length,
    solo_en_salidas: soloEnSalidas.length,
    sin_ingreso: sinIngreso.length,
    con_discrepancia_cantidad: discrepancias.length,
};

console.log('\n════════════════════════════════════════════════════════');
console.log('RESUMEN FINAL');
console.log('════════════════════════════════════════════════════════');
console.table([resumen]);

// Guardar resultado
const OUTPUT = {
    resumen,
    cronologia_invalida: cronologiaInvalida,
    stock_negativo: stockNegativo,
    solo_en_salidas: soloEnSalidas,
    discrepancias_cantidad: discrepancias.slice(0, 50)
};
fs.writeFileSync(path.join(BASE, 'tmp_integridad_result.json'), JSON.stringify(OUTPUT, null, 2), 'utf8');
console.log('\n✅ Resultado guardado en tmp_integridad_result.json');
