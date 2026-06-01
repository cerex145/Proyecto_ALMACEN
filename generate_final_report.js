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

  const insufficientStockRows = [];

  // 3. Loop through each row in memory
  for (const r of rows) {
    if (!r.codigo) continue;

    const product = productsMap.get(r.codigo);
    if (!product) continue;

    const allLotesForProduct = lotesByProductMap.get(product.id) || [];
    const clientLotes = allLotesForProduct.filter(l => 
      cleanRuc(l.ingreso_ruc) === cleanRuc(r.rucCliente)
    );

    if (clientLotes.length === 0) continue;

    const matchedLote = clientLotes.find(l => normalizeLote(l.numero_lote) === r.lote);
    if (!matchedLote) continue;

    const currentStock = simulatedStockCache.get(matchedLote.lote_id);
    
    if (currentStock <= 0) {
      insufficientStockRows.push({
        rowNumber: r.rowNumber,
        codigo: r.codigo,
        nombre: r.nombre,
        lote: r.lote,
        cantidadPedida: r.cantidad,
        stockDisponible: 0,
        faltante: r.cantidad,
        motivo: 'Lote agotado (saldo 0)'
      });
    } else if (r.cantidad > currentStock) {
      const faltante = r.cantidad - currentStock;
      insufficientStockRows.push({
        rowNumber: r.rowNumber,
        codigo: r.codigo,
        nombre: r.nombre,
        lote: r.lote,
        cantidadPedida: r.cantidad,
        stockDisponible: currentStock,
        faltante: faltante,
        motivo: `Stock insuficiente (pide ${r.cantidad}, solo quedan ${currentStock})`
      });
      simulatedStockCache.set(matchedLote.lote_id, 0);
    } else {
      simulatedStockCache.set(matchedLote.lote_id, currentStock - r.cantidad);
    }
  }

  console.log(`Filas con descuadre encontradas: ${insufficientStockRows.length}`);

  let mdTable = `| Fila Excel | Código de Producto | Descripción / Nombre | Lote | Cantidad Pedida | Stock Disponible en BD | Faltante | Motivo del Descuadre |\n`;
  mdTable += `| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

  insufficientStockRows.forEach(item => {
    mdTable += `| **${item.rowNumber}** | \`${item.codigo}\` | ${item.nombre} | \`${item.lote}\` | **${item.cantidadPedida}** | **${item.stockDisponible}** | <span style="color:red">**-${item.faltante}**</span> | ${item.motivo} |\n`;
  });

  fs.writeFileSync(path.join(__dirname, 'miret_fails_table.md'), mdTable, 'utf8');
  console.log('Tabla escrita en miret_fails_table.md');

  await client.end();
}

main().catch(console.error);
