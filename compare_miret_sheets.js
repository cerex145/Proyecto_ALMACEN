const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

function getCellValueString(cellVal) {
  if (cellVal === null || cellVal === undefined) return '';
  if (typeof cellVal === 'object') {
    if (cellVal.richText) {
      return cellVal.richText.map(rt => rt.text).join('').trim();
    }
    if (cellVal.formula) {
      return String(cellVal.result !== undefined ? cellVal.result : '').trim();
    }
    if (Array.isArray(cellVal)) {
      return cellVal.map(v => getCellValueString(v)).join('').trim();
    }
  }
  return String(cellVal).trim();
}

function normalizeText(value) {
  return getCellValueString(value).toLowerCase();
}

function normalizeProductCode(code) {
  return getCellValueString(code).toUpperCase();
}

function normalizeLote(lote) {
  return getCellValueString(lote).toUpperCase();
}

async function main() {
  const outputLines = [];
  function log(msg) {
    console.log(msg);
    outputLines.push(msg);
  }

  const pathIngreso = path.join(__dirname, 'docs', 'INGRESO MIRET MEDICAL.xlsx');
  const pathSalida = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');

  log('=== COMPARACIÓN CORREGIDA DE INGRESOS VS SALIDAS (MIRET MEDICAL) ===');
  log(`Archivo Ingreso: ${pathIngreso}`);
  log(`Archivo Salida: ${pathSalida}`);

  // 1. Read Ingresos
  const wbIngreso = new ExcelJS.Workbook();
  await wbIngreso.xlsx.readFile(pathIngreso);
  const sheetIngreso = wbIngreso.worksheets[0];

  const ingresosDict = {}; // key: code|lote => { code, lote, description, qty: 0, rows: [] }
  let headersIngreso = [];

  sheetIngreso.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);

    if (rowNumber === 1) {
      headersIngreso = values.map(h => normalizeText(h));
      return;
    }

    if (values.length === 0 || values.every(v => v === null || v === '')) return;

    const rowObj = {};
    headersIngreso.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });

    const codigo = normalizeProductCode(rowObj['codigo_producto'] || rowObj['codigo producto'] || rowObj['codigo']);
    const lote = normalizeLote(rowObj['lote']);
    const qty = Number(getCellValueString(rowObj['cantidad_total'] || rowObj['cantidad total'] || rowObj['cantidad'] || 0));
    const desc = getCellValueString(rowObj['nombre'] || rowObj['descripcion'] || '');

    if (!codigo || !lote) return;

    const key = `${codigo}|${lote}`;
    if (!ingresosDict[key]) {
      ingresosDict[key] = {
        codigo,
        lote,
        descripcion: desc,
        qty: 0,
        rows: []
      };
    }
    ingresosDict[key].qty += qty;
    ingresosDict[key].rows.push({ rowNumber, qty, hidden: row.hidden === true });
  });

  log(`\nFilas totales leídas en Ingreso: ${sheetIngreso.rowCount - 1}`);
  log(`Productos + Lotes únicos en Ingreso: ${Object.keys(ingresosDict).length}`);

  // 2. Read Salidas
  const wbSalida = new ExcelJS.Workbook();
  await wbSalida.xlsx.readFile(pathSalida);
  const sheetSalida = wbSalida.worksheets[0];

  const salidasDict = {}; // key: code|lote => { code, lote, description, qty: 0, rows: [] }
  let headersSalida = [];

  sheetSalida.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);

    if (rowNumber === 1) {
      headersSalida = values.map(h => normalizeText(h));
      return;
    }

    if (values.length === 0 || values.every(v => v === null || v === '')) return;

    const rowObj = {};
    headersSalida.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });

    const codigo = normalizeProductCode(rowObj['codigo_producto'] || rowObj['codigo producto'] || rowObj['codigo']);
    const lote = normalizeLote(rowObj['lote']);
    const qty = Number(getCellValueString(rowObj['cantidad'] || rowObj['cantidad_total'] || 0));
    const desc = getCellValueString(rowObj['nombre'] || rowObj['descripcion'] || '');

    if (!codigo || !lote) return;

    const key = `${codigo}|${lote}`;
    if (!salidasDict[key]) {
      salidasDict[key] = {
        codigo,
        lote,
        descripcion: desc,
        qty: 0,
        rows: []
      };
    }
    salidasDict[key].qty += qty;
    salidasDict[key].rows.push({ rowNumber, qty, hidden: row.hidden === true });
  });

  log(`Filas totales leídas en Salida: ${sheetSalida.rowCount - 1}`);
  log(`Productos + Lotes únicos en Salida: ${Object.keys(salidasDict).length}`);

  // 3. Compare Ingresos vs Salidas
  const incongruencies = [];
  const noIngresoForSalida = [];

  for (const key of Object.keys(salidasDict)) {
    const s = salidasDict[key];
    const i = ingresosDict[key];

    if (!i) {
      noIngresoForSalida.push({
        codigo: s.codigo,
        lote: s.lote,
        descripcion: s.descripcion,
        qtySalida: s.qty,
        salidaRows: s.rows
      });
    } else if (s.qty > i.qty) {
      incongruencies.push({
        codigo: s.codigo,
        lote: s.lote,
        descripcion: s.descripcion,
        qtyIngreso: i.qty,
        qtySalida: s.qty,
        diferencia: s.qty - i.qty,
        ingresoRows: i.rows,
        salidaRows: s.rows
      });
    }
  }

  log('\n==================================================');
  log('INCONGRUENCIAS DETECTADAS (SALIDAS > INGRESOS) - CORREGIDO');
  log('==================================================');

  log(`\n⚠️ CASO A: PRODUCTOS QUE TIENEN SALIDAS MAYORES A SUS INGRESOS (${incongruencies.length}):`);
  if (incongruencies.length > 0) {
    incongruencies.forEach(item => {
      log(`\n📌 Producto: "${item.codigo}" - "${item.descripcion}"`);
      log(`   Lote: "${item.lote}"`);
      log(`   Cantidad TOTAL que Ingresó en Excel: ${item.qtyIngreso}`);
      log(`   Cantidad TOTAL que se pide Salir en Excel: ${item.qtySalida}`);
      log(`   ❌ DESCUADRE: Faltan ${item.diferencia} unidades (Salida supera al Ingreso).`);
      
      log(`   Detalle de filas de Ingreso:`);
      item.ingresoRows.forEach(ir => {
        log(`     - Fila ${ir.rowNumber}: cantidad = ${ir.qty}${ir.hidden ? ' (OCULTA)' : ' (VISIBLE)'}`);
      });
      
      log(`   Detalle de filas de Salida:`);
      item.salidaRows.forEach(sr => {
        log(`     - Fila ${sr.rowNumber}: cantidad = ${sr.qty}${sr.hidden ? ' (OCULTA)' : ' (VISIBLE)'}`);
      });
    });
  } else {
    log('  ¡Ninguno! Para todos los lotes con ingresos, las cantidades de salida están cubiertas.');
  }

  log(`\n⚠️ CASO B: LOTES QUE TIENEN SALIDAS PERO NO SE REGISTRA NINGÚN INGRESO EN EL EXCEL (${noIngresoForSalida.length}):`);
  if (noIngresoForSalida.length > 0) {
    noIngresoForSalida.forEach(item => {
      log(`\n📌 Producto: "${item.codigo}" - "${item.descripcion}"`);
      log(`   Lote: "${item.lote}"`);
      log(`   Cantidad TOTAL de Salida solicitada: ${item.qtySalida}`);
      log(`   ❌ DESCUADRE: 0 unidades ingresaron en este Excel (No existe el lote en el archivo de Ingreso).`);
      
      log(`   Detalle de filas de Salida:`);
      item.salidaRows.forEach(sr => {
        log(`     - Fila ${sr.rowNumber}: cantidad = ${sr.qty}${sr.hidden ? ' (OCULTA)' : ' (VISIBLE)'}`);
      });
    });
  } else {
    log('  ¡Ninguno! Todos los lotes solicitados en las salidas registran al menos un ingreso en el Excel.');
  }

  fs.writeFileSync(path.join(__dirname, 'miret_incongruencias_report.txt'), outputLines.join('\n'), 'utf8');
  console.log('Reporte completo guardado en miret_incongruencias_report.txt');
}

main().catch(console.error);
