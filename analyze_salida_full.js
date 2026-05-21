const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeProductCode(code) {
  return String(code || '').trim().toUpperCase();
}

function normalizeLote(lote) {
  return String(lote || '').trim().toUpperCase();
}

function normalizeLoteCanonico(lote) {
  return String(lote || '').trim().replace(/[^A-Z0-9]/ig, '').toUpperCase();
}

const loteCoincideCSV = (numeroLote, loteCsv) => {
  const loteCsvNormalizado = normalizeLote(loteCsv);
  const loteCsvCanonico = normalizeLoteCanonico(loteCsv);
  const loteNormalizado = normalizeLote(numeroLote);
  const loteCanonico = normalizeLoteCanonico(numeroLote);

  return loteNormalizado === loteCsvNormalizado
      || loteCanonico === loteCsvCanonico
      || loteNormalizado.includes(loteCsvNormalizado)
      || loteCsvNormalizado.includes(loteNormalizado)
      || (loteCanonico && loteCsvCanonico && (
          loteCanonico.includes(loteCsvCanonico)
          || loteCsvCanonico.includes(loteCanonico)
      ));
};

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Conectado a la base de datos.');

  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
  console.log('Ruta del Excel:', filePath);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    rows.push({
      rowNumber,
      codigo: normalizeProductCode(values[2]),
      codigoRaw: values[2],
      nombre: String(values[3] || '').trim(),
      lote: String(values[4] || '').trim(),
      cantidad: Number(values[10] || 0)
    });
  });

  console.log(`\nFilas totales de datos en Excel: ${rows.length}`);

  const missingProducts = [];
  const noLotes = [];
  const loteNotFound = [];
  const insufficientStock = [];
  const successfulRows = [];
  
  const simulatedStockCache = new Map(); // key: lote_id, value: stock_disponible
  const dbLotesRes = await client.query(`
    SELECT l.id, l.producto_id, l.numero_lote, l.cantidad_disponible, p.codigo as prod_codigo, p.descripcion as prod_desc
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
  `);
  
  for (const l of dbLotesRes.rows) {
    simulatedStockCache.set(l.id, Number(l.cantidad_disponible));
  }

  for (const r of rows) {
    // A. Find product using case-insensitive search
    const prodRes = await client.query('SELECT * FROM productos WHERE LOWER(codigo) = LOWER($1)', [r.codigo]);
    if (prodRes.rows.length === 0) {
      missingProducts.push({ ...r, reason: 'Producto no registrado en el sistema' });
      continue;
    }
    const product = prodRes.rows[0];

    // B. Get lotes for this product in DB
    const lotesRes = await client.query('SELECT * FROM lotes WHERE producto_id = $1', [product.id]);
    if (lotesRes.rows.length === 0) {
      noLotes.push({ ...r, product, reason: 'El producto existe pero no tiene ningún lote ingresado en la base de datos' });
      continue;
    }

    // C. Try to match the lote from Excel
    const matchedLote = lotesRes.rows.find(l => loteCoincideCSV(l.numero_lote, r.lote));
    if (!matchedLote) {
      loteNotFound.push({ 
        ...r, 
        product, 
        availableLotes: lotesRes.rows.map(l => l.numero_lote),
        reason: 'El lote del Excel no existe en el sistema para este producto' 
      });
      continue;
    }

    // D. Check simulated available stock
    const currentStock = simulatedStockCache.get(matchedLote.id);
    if (currentStock <= 0) {
      insufficientStock.push({ 
        ...r, 
        product, 
        lote: matchedLote,
        requested: r.cantidad, 
        available: currentStock,
        reason: 'Lote sin stock disponible (saldo 0)' 
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
        reason: `Stock insuficiente en lote (Pedido: ${r.cantidad}, Disponible: ${currentStock}). Se ajustaría a ${currentStock}` 
      });
      
      simulatedStockCache.set(matchedLote.id, 0);
      successfulRows.push({ ...r, product, lote: matchedLote, quantityUsed: currentStock, adjusted: true });
    } else {
      simulatedStockCache.set(matchedLote.id, currentStock - r.cantidad);
      successfulRows.push({ ...r, product, lote: matchedLote, quantityUsed: r.cantidad, adjusted: false });
    }
  }

  // Print results
  console.log('\n==================================================');
  console.log('RESULTADOS DE LA DIAGNOSIS DE IMPORTACIÓN DE SALIDAS');
  console.log('==================================================');

  console.log(`\n❌ 1. PRODUCTOS QUE NO EXISTEN EN EL SISTEMA EN ABSOLUTO (${missingProducts.length}):`);
  if (missingProducts.length > 0) {
    const list = [...new Set(missingProducts.map(p => `${p.codigo} - ${p.nombre}`))];
    list.forEach(p => console.log(`  - ${p}`));
  } else {
    console.log('  ¡Ninguno! Todos los códigos del Excel existen en el sistema.');
  }

  console.log(`\n❌ 2. PRODUCTOS QUE EXISTEN PERO NO TIENEN NINGÚN LOTE REGISTRADO (${noLotes.length}):`);
  if (noLotes.length > 0) {
    const list = [...new Set(noLotes.map(p => `${p.codigo} - ${p.nombre}`))];
    list.forEach(p => console.log(`  - ${p}`));
  } else {
    console.log('  ¡Ninguno!');
  }

  console.log(`\n❌ 3. FILAS CON LOTE NO ENCONTRADO EN EL SISTEMA para el producto (${loteNotFound.length}):`);
  if (loteNotFound.length > 0) {
    loteNotFound.forEach(item => {
      console.log(`  - Fila Excel ${item.rowNumber}: Código "${item.codigo}", Lote Excel: "${item.lote}". Lotes en DB: [${item.availableLotes.join(', ')}]`);
    });
  } else {
    console.log('  ¡Ninguno!');
  }

  console.log(`\n❌ 4. FILAS CON STOCK INSUFICIENTE / SALDO 0 EN EL LOTE (${insufficientStock.length}):`);
  if (insufficientStock.length > 0) {
    insufficientStock.forEach(item => {
      console.log(`  - Fila Excel ${item.rowNumber}: Código "${item.codigo}", Lote Excel: "${item.lote}", Cantidad Pedida: ${item.requested}, Disponible DB: ${item.available} (${item.reason})`);
    });
  } else {
    console.log('  ¡Ninguno!');
  }

  console.log(`\n✅ 5. FILAS IMPORTABLES CON ÉXITO (${successfulRows.length}):`);
  if (successfulRows.length > 0) {
    successfulRows.forEach(item => {
      console.log(`  - Fila Excel ${item.rowNumber}: Código "${item.codigo}", Lote: "${item.lote}", Cantidad Importada: ${item.quantityUsed}${item.adjusted ? ' (AJUSTADA por stock)' : ''}`);
    });
  }
  
  const aggregatedKeys = {};
  for (const s of successfulRows) {
    const key = `${s.product.id}|${s.lote.numero_lote}`;
    aggregatedKeys[key] = (aggregatedKeys[key] || 0) + s.quantityUsed;
  }
  console.log(`\nTotal de filas colapsadas en la Nota de Salida (agrupadas por código + lote): ${Object.keys(aggregatedKeys).length}`);
  
  await client.end();
}

main().catch(err => console.error(err));
