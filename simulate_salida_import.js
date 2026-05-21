const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

// Normalization functions identical to the system
function normalizeProductCode(code) {
  return String(code || '').trim().toUpperCase();
}

function normalizeLote(lote) {
  return String(lote || '').trim().toUpperCase();
}

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Conectado a la base de datos.');

  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
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
      nombre: String(values[3] || '').trim(),
      lote: normalizeLote(values[4]),
      cantidad: Number(values[10] || 0)
    });
  });

  console.log(`\nFilas totales de datos en Excel: ${rows.length}`);

  const missingProducts = [];
  const noLotes = [];
  const loteNotFound = [];
  const insufficientStock = [];
  const successfulRows = [];
  
  // Cache to track simulated stock allocations during import
  const simulatedStockCache = new Map(); // key: lote_id, value: stock_disponible

  // 1. Load all lots from database to initialize stock cache
  const dbLotesRes = await client.query(`
    SELECT l.id, l.producto_id, l.numero_lote, l.cantidad_disponible, p.codigo as prod_codigo, p.descripcion as prod_desc
    FROM lotes l
    JOIN productos p ON l.producto_id = p.id
  `);
  
  for (const l of dbLotesRes.rows) {
    simulatedStockCache.set(l.id, Number(l.cantidad_disponible));
  }

  // 2. Loop through each row of the excel and evaluate
  for (const r of rows) {
    // A. Find product
    const prodRes = await client.query('SELECT * FROM productos WHERE codigo = $1', [r.codigo]);
    if (prodRes.rows.length === 0) {
      missingProducts.push({ ...r, reason: 'Producto no registrado en el sistema' });
      continue;
    }
    const product = prodRes.rows[0];

    // B. Get lotes for this product in DB
    const lotesRes = await client.query('SELECT * FROM lotes WHERE producto_id = $1', [product.id]);
    if (lotesRes.rows.length === 0) {
      noLotes.push({ ...r, product, reason: 'El producto no tiene ningún lote ingresado en la base de datos' });
      continue;
    }

    // C. Try to match the lote from Excel
    const matchedLote = lotesRes.rows.find(l => normalizeLote(l.numero_lote) === r.lote);
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
      
      // Update cache with remaining 0 stock
      simulatedStockCache.set(matchedLote.id, 0);
      successfulRows.push({ ...r, product, lote: matchedLote, quantityUsed: currentStock, adjusted: true });
    } else {
      // Deduct from cache
      simulatedStockCache.set(matchedLote.id, currentStock - r.cantidad);
      successfulRows.push({ ...r, product, lote: matchedLote, quantityUsed: r.cantidad, adjusted: false });
    }
  }

  // Print results
  console.log('\n==================================================');
  console.log('RESULTADOS DE LA SIMULACIÓN DE IMPORTACIÓN DE SALIDAS');
  console.log('==================================================');

  console.log(`\n❌ PRODUCTOS QUE NO EXISTEN EN EL SISTEMA (${missingProducts.length}):`);
  if (missingProducts.length > 0) {
    const list = [...new Set(missingProducts.map(p => `${p.codigo} - ${p.nombre}`))];
    list.slice(0, 10).forEach(p => console.log(`  - ${p}`));
    if (list.length > 10) console.log(`  ... y ${list.length - 10} más`);
  }

  console.log(`\n❌ PRODUCTOS QUE EXISTEN PERO NO TIENEN NINGÚN LOTE REGISTRADO (${noLotes.length}):`);
  if (noLotes.length > 0) {
    const list = [...new Set(noLotes.map(p => `${p.codigo} - ${p.nombre}`))];
    list.slice(0, 10).forEach(p => console.log(`  - ${p}`));
  }

  console.log(`\n❌ FILAS CON LOTE NO ENCONTRADO EN EL SISTEMA (${loteNotFound.length}):`);
  if (loteNotFound.length > 0) {
    loteNotFound.slice(0, 10).forEach(item => {
      console.log(`  - Fila Excel ${item.rowNumber}: Producto "${item.codigo}", Lote Excel: "${item.lote}". Lotes en DB: [${item.availableLotes.join(', ')}]`);
    });
    if (loteNotFound.length > 10) console.log(`  ... y ${loteNotFound.length - 10} más`);
  }

  console.log(`\n❌ FILAS CON STOCK INSUFICIENTE / SIN STOCK (${insufficientStock.length}):`);
  if (insufficientStock.length > 0) {
    insufficientStock.slice(0, 15).forEach(item => {
      console.log(`  - Fila Excel ${item.rowNumber}: Producto "${item.codigo}", Lote: "${item.lote.numero_lote}", Cantidad Pedida: ${item.requested}, Disponible DB: ${item.available} (${item.reason})`);
    });
    if (insufficientStock.length > 15) console.log(`  ... y ${insufficientStock.length - 15} más`);
  }

  console.log(`\n✅ FILAS IMPORTABLES CON ÉXITO (${successfulRows.length}):`);
  console.log(`  Total importados con éxito o ajustados: ${successfulRows.length}`);
  
  // Let's analyze aggregation of successful rows (Product + Lote)
  const aggregatedKeys = {};
  for (const s of successfulRows) {
    const key = `${s.product.id}|${s.lote.numero_lote}`;
    aggregatedKeys[key] = (aggregatedKeys[key] || 0) + s.quantityUsed;
  }
  console.log(`  Total de filas colapsadas (agrupadas por código + lote) en el formulario: ${Object.keys(aggregatedKeys).length}`);
  
  await client.end();
}

main().catch(err => console.error(err));
