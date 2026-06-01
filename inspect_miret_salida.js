const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Normalization functions
function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeProductCode(code) {
  return String(code || '').trim().toUpperCase();
}

function normalizeLote(lote) {
  return String(lote || '').trim().toUpperCase();
}

function cleanRuc(ruc) {
  return String(ruc || '').replace(/\D/g, '');
}

async function main() {
  const outputLines = [];
  function log(msg) {
    console.log(msg);
    outputLines.push(msg);
  }

  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  log('Conectado a la base de datos.');

  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  log('Abriendo archivo Excel: ' + filePath);
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  let headers = [];
  const rows = [];

  sheet.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);

    if (rowNumber === 1) {
      headers = values.map(h => normalizeText(h));
      log('Cabeceras detectadas: ' + JSON.stringify(headers));
      return;
    }

    if (values.length === 0 || values.every(v => v === null || v === '')) return;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });

    rows.push({
      rowNumber,
      rucCliente: cleanRuc(rowObj['ruc_cliente'] || rowObj['ruc cliente']),
      fecha: rowObj['fecha'],
      motivo: rowObj['motivo_salida'] || rowObj['motivo'],
      codigo: normalizeProductCode(rowObj['codigo_producto'] || rowObj['codigo producto'] || rowObj['codigo']),
      nombre: String(rowObj['descripcion'] || rowObj['nombre'] || '').trim(),
      lote: normalizeLote(rowObj['lote']),
      cantidad: Number(rowObj['cantidad'] || 0)
    });
  });

  log(`\nFilas totales de datos en Excel: ${rows.length}`);

  // 1. Fetch all products into memory
  log('Cargando productos desde la base de datos...');
  const productsRes = await client.query('SELECT id, codigo, descripcion FROM productos');
  const productsMap = new Map(); // UPPER(codigo) => product object
  for (const p of productsRes.rows) {
    productsMap.set(normalizeProductCode(p.codigo), p);
  }
  log(`Cargados ${productsMap.size} productos en memoria.`);

  // 2. Fetch all lotes into memory
  log('Cargando lotes y RUCs desde la base de datos...');
  const dbLotesRes = await client.query(`
    SELECT 
      l.id as lote_id, 
      l.producto_id, 
      l.numero_lote, 
      l.cantidad_disponible, 
      p.codigo as prod_codigo, 
      p.descripcion as prod_desc,
      ni.cliente_ruc as ingreso_ruc
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
    LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
  `);

  const simulatedStockCache = new Map(); // lote_id => current stock
  const lotesByProductMap = new Map(); // product_id => array of lotes
  
  for (const l of dbLotesRes.rows) {
    simulatedStockCache.set(l.lote_id, Number(l.cantidad_disponible || 0));
    
    if (!lotesByProductMap.has(l.producto_id)) {
      lotesByProductMap.set(l.producto_id, []);
    }
    lotesByProductMap.get(l.producto_id).push(l);
  }
  log(`Cargados ${dbLotesRes.rows.length} lotes en memoria.`);

  const missingProducts = [];
  const noLotes = [];
  const loteNotFound = [];
  const insufficientStock = [];
  const successfulRows = [];

  // 3. Loop through each row in memory
  for (const r of rows) {
    if (!r.codigo) continue;

    // A. Find product in memory
    const product = productsMap.get(r.codigo);
    if (!product) {
      missingProducts.push({ ...r, reason: 'Producto no registrado en el sistema' });
      continue;
    }

    // B. Get lotes for this product and client's RUC from memory
    const allLotesForProduct = lotesByProductMap.get(product.id) || [];
    const clientLotes = allLotesForProduct.filter(l => 
      cleanRuc(l.ingreso_ruc) === cleanRuc(r.rucCliente)
    );

    if (clientLotes.length === 0) {
      noLotes.push({ 
        ...r, 
        product, 
        anyLotesCount: allLotesForProduct.length,
        availableRucs: [...new Set(allLotesForProduct.map(l => l.ingreso_ruc))],
        reason: allLotesForProduct.length === 0 
          ? 'El producto no tiene ningún lote en la base de datos' 
          : `El producto tiene lotes, pero ninguno pertenece al RUC del cliente (${r.rucCliente})` 
      });
      continue;
    }

    // C. Match the lote
    const matchedLote = clientLotes.find(l => normalizeLote(l.numero_lote) === r.lote);
    if (!matchedLote) {
      loteNotFound.push({ 
        ...r, 
        product, 
        availableLotes: clientLotes.map(l => l.numero_lote),
        reason: `El lote "${r.lote}" del Excel no existe en el sistema para este producto y RUC ${r.rucCliente}` 
      });
      continue;
    }

    // D. Check simulated stock
    const currentStock = simulatedStockCache.get(matchedLote.lote_id);
    if (currentStock <= 0) {
      insufficientStock.push({ 
        ...r, 
        product, 
        lote: matchedLote,
        requested: r.cantidad, 
        available: currentStock,
        reason: `Lote "${matchedLote.numero_lote}" sin stock disponible (saldo 0)` 
      });
      continue;
    }

    if (r.cantidad > currentStock) {
      insufficientStock.push({ 
        ...r, 
        product, 
        lote: matchedLote,
        requested: r.cantidad, 
        available: currentStock,
        reason: `Stock insuficiente en lote "${matchedLote.numero_lote}" (Pedido: ${r.cantidad}, Disponible: ${currentStock})` 
      });
      
      simulatedStockCache.set(matchedLote.lote_id, 0);
      successfulRows.push({ ...r, product, lote: matchedLote, quantityUsed: currentStock, adjusted: true });
    } else {
      simulatedStockCache.set(matchedLote.lote_id, currentStock - r.cantidad);
      successfulRows.push({ ...r, product, lote: matchedLote, quantityUsed: r.cantidad, adjusted: false });
    }
  }

  // Print results
  log('\n==================================================');
  log('DIAGNOSIS DETALLADA DE SALIDAS MIRET MEDICAL');
  log('==================================================');

  log(`\n❌ 1. PRODUCTOS QUE NO EXISTEN EN EL SISTEMA EN ABSOLUTO (${missingProducts.length}):`);
  if (missingProducts.length > 0) {
    const list = [...new Set(missingProducts.map(p => `${p.codigo} - ${p.nombre}`))];
    list.forEach(p => log(`  - ${p}`));
  } else {
    log('  ¡Ninguno! Todos los códigos del Excel existen en el sistema.');
  }

  log(`\n❌ 2. PRODUCTOS SIN LOTES PARA EL RUC ${rows[0]?.rucCliente || ''} (${noLotes.length}):`);
  if (noLotes.length > 0) {
    const uniqueNoLotes = [];
    const seen = new Set();
    for (const item of noLotes) {
      const key = `${item.codigo}|${item.reason}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNoLotes.push(item);
      }
    }
    uniqueNoLotes.forEach(item => {
      log(`  - Producto: "${item.codigo}" - "${item.nombre}"`);
      log(`    Motivo: ${item.reason}`);
      if (item.anyLotesCount > 0) {
        log(`    Lotes de otros RUCs en DB: [${item.availableRucs.join(', ')}]`);
      }
    });
  } else {
    log('  ¡Ninguno! Todos los productos tienen lotes asociados a este cliente.');
  }

  log(`\n❌ 3. FILAS CON LOTE NO ENCONTRADO PARA EL PRODUCTO Y CLIENTE (${loteNotFound.length}):`);
  if (loteNotFound.length > 0) {
    const list = [...new Set(loteNotFound.map(item => `Producto "${item.codigo}", Lote Excel: "${item.lote}". Lotes válidos en DB para este RUC: [${item.availableLotes.join(', ')}]`))];
    list.forEach(item => log(`  - ${item}`));
  } else {
    log('  ¡Ninguno!');
  }

  log(`\n❌ 4. FILAS CON STOCK INSUFICIENTE O AGOTADO EN EL SISTEMA (${insufficientStock.length}):`);
  if (insufficientStock.length > 0) {
    insufficientStock.forEach(item => {
      log(`  - Fila Excel ${item.rowNumber}: Código "${item.codigo}", Lote: "${item.lote.numero_lote}", Cantidad Pedida: ${item.requested}, Disponible DB: ${item.available} (${item.reason})`);
    });
  } else {
    log('  ¡Ninguno!');
  }

  log(`\n✅ 5. RESUMEN DE FILAS QUE PASARÍAN CON ÉXITO (${successfulRows.length}):`);
  log(`  Total filas exitosas: ${successfulRows.length}`);
  
  await client.end();

  fs.writeFileSync(path.join(__dirname, 'report_miret_utf8.txt'), outputLines.join('\n'), 'utf8');
  console.log('Reporte escrito en report_miret_utf8.txt');
}

main().catch(err => console.error(err));
