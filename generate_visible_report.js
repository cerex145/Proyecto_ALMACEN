const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

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
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  let headers = [];
  const rows = [];

  sheet.eachRow((row, rowNumber) => {
    // Check if the row is marked as hidden in Excel
    if (row.hidden === true) {
      return; // Skip hidden rows
    }

    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);

    if (rowNumber === 1) {
      headers = values.map(h => normalizeText(h));
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
      nombre: String(rowObj['descripcion'] || rowObj['nombre'] || rowObj['nombre_producto'] || '').trim(),
      lote: normalizeLote(rowObj['lote']),
      cantidad: Number(rowObj['cantidad'] || 0)
    });
  });

  console.log(`Filas VISIBLES totales de datos en Excel: ${rows.length}`);

  // 1. Fetch all products into memory
  const productsRes = await client.query('SELECT id, codigo, descripcion FROM productos');
  const productsMap = new Map();
  for (const p of productsRes.rows) {
    productsMap.set(normalizeProductCode(p.codigo), p);
  }

  // 2. Fetch all lotes into memory
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

  const simulatedStockCache = new Map();
  const lotesByProductMap = new Map();
  
  for (const l of dbLotesRes.rows) {
    simulatedStockCache.set(l.lote_id, Number(l.cantidad_disponible || 0));
    if (!lotesByProductMap.has(l.producto_id)) {
      lotesByProductMap.set(l.producto_id, []);
    }
    lotesByProductMap.get(l.producto_id).push(l);
  }

  // Group demands and rows by Product + Lote (for visible rows only)
  const aggregatedDemands = {};

  for (const r of rows) {
    if (!r.codigo || !r.lote) continue;

    const product = productsMap.get(r.codigo);
    if (!product) continue;

    const key = `${r.codigo}|${r.lote}`;
    if (!aggregatedDemands[key]) {
      aggregatedDemands[key] = {
        codigo: r.codigo,
        nombre: r.nombre,
        lote: r.lote,
        qtyRequested: 0,
        rows: [],
        productId: product.id
      };
    }
    aggregatedDemands[key].qtyRequested += r.cantidad;
    aggregatedDemands[key].rows.push(r.rowNumber);
  }

  const outputList = [];

  for (const key of Object.keys(aggregatedDemands)) {
    const demand = aggregatedDemands[key];
    
    // Find stock for this product + lote for Miret RUC
    const allLotesForProduct = lotesByProductMap.get(demand.productId) || [];
    const clientLotes = allLotesForProduct.filter(l => 
      cleanRuc(l.ingreso_ruc) === '20605712241'
    );

    const matchedLote = clientLotes.find(l => normalizeLote(l.numero_lote) === demand.lote);
    const initialStock = matchedLote ? Number(matchedLote.cantidad_disponible || 0) : 0;

    if (demand.qtyRequested > initialStock) {
      const faltante = demand.qtyRequested - initialStock;
      outputList.push({
        codigo: demand.codigo,
        nombre: demand.nombre,
        lote: demand.lote,
        stockDisponible: initialStock,
        totalPedido: demand.qtyRequested,
        faltante: faltante,
        celdas: demand.rows.map(r => `Fila ${r}`).join(', ')
      });
    }
  }

  let mdTable = `| Código de Producto | Descripción / Nombre | Lote | Stock Inicial en BD | Total Pedido en Excel (Visibles) | Total Faltante | Filas del Excel (Celdas Visibles) |\n`;
  mdTable += `| :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

  outputList.forEach(item => {
    let celdasStr = item.celdas;
    if (celdasStr.length > 300) {
      celdasStr = celdasStr.substring(0, 300) + '... (y más filas)';
    }

    mdTable += `| \`${item.codigo}\` | ${item.nombre} | \`${item.lote}\` | **${item.stockDisponible}** | **${item.totalPedido}** | <span style="color:red">**-${item.faltante}**</span> | ${celdasStr} |\n`;
  });

  fs.writeFileSync(path.join(__dirname, 'miret_collapsed_visible_table.md'), mdTable, 'utf8');
  console.log('Tabla de filas visibles escrita en miret_collapsed_visible_table.md');

  await client.end();
}

main().catch(console.error);
