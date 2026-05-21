const { Client } = require('pg');
const XLSX = require('xlsx');
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
          || loteCsvCanonico.includes(loteNormalizado)
      ));
};

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const NOTE_ID = 5; // HDM CAPITAL salida

  // 1. Obtener detalles de la nota de la DB
  const nsdRes = await client.query(`
    SELECT d.id, d.producto_id, p.codigo as prod_codigo, p.descripcion as prod_desc, d.lote_numero, d.cantidad
    FROM nota_salida_detalles d
    JOIN productos p ON d.producto_id = p.id
    WHERE d.nota_salida_id = $1
  `, [NOTE_ID]);

  const dbDetalles = nsdRes.rows.map(r => ({
    id: r.id,
    producto_id: r.producto_id,
    codigo: normalizeProductCode(r.prod_codigo),
    descripcion: r.prod_desc,
    lote_numero: normalizeLote(r.lote_numero),
    cantidad: Number(r.cantidad),
    matchedAmount: 0 // to track how much of this DB detail quantity has been matched with Excel
  }));

  console.log(`Detalles en la nota de salida DB (ID ${NOTE_ID}): ${dbDetalles.length}`);
  const totalDbQty = dbDetalles.reduce((acc, d) => acc + d.cantidad, 0);
  console.log(`Cantidad total en la DB: ${totalDbQty}`);

  // 2. Leer Excel
  const excelPath = path.join(__dirname, 'docs', 'SALIDA HDM CAPITAL.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const excelRows = rows.map((row, i) => ({
    rowNumber: i + 2,
    codigo: normalizeProductCode(row.codigo_producto),
    codigoRaw: row.codigo_producto,
    nombre: String(row.nombre || '').trim(),
    lote: String(row.lote || '').trim(),
    cantidad: Number(row.cantidad || 0)
  }));

  console.log(`Filas de datos en Excel: ${excelRows.length}`);
  const totalExcelQty = excelRows.reduce((acc, r) => acc + r.cantidad, 0);
  console.log(`Cantidad total en Excel: ${totalExcelQty}\n`);

  const results = [];
  const unmatchedExcelRows = [];

  for (const er of excelRows) {
    // Buscamos coincidencia en los detalles de la DB
    const matches = dbDetalles.filter(dbd => {
      const prodCodeMatch = dbd.codigo === er.codigo || dbd.codigo.includes(er.codigo) || er.codigo.includes(dbd.codigo);
      const loteMatch = loteCoincideCSV(dbd.lote_numero, er.lote);
      return prodCodeMatch && loteMatch;
    });

    if (matches.length > 0) {
      // Tomamos el primero que tenga stock/cantidad no excedida en el cruce
      let matchedDbd = matches.find(m => m.matchedAmount < m.cantidad);
      if (!matchedDbd) {
        matchedDbd = matches[0]; // fallback
      }
      
      results.push({
        rowNumber: er.rowNumber,
        codigo: er.codigo,
        lote: er.lote,
        cantidadExcel: er.cantidad,
        cantidadDb: matchedDbd.cantidad,
        status: 'EXITOSO',
        dbMatch: matchedDbd
      });
      matchedDbd.matchedAmount += er.cantidad;
    } else {
      unmatchedExcelRows.push(er);
    }
  }

  console.log('=== FILAS EXCEL COMPLETAMENTE EXITOSAS ===');
  const exitosas = results.filter(r => Math.abs(r.cantidadExcel - r.dbMatch.cantidad) < 0.01);
  console.log(`Total: ${exitosas.length}`);

  console.log('\n=== FILAS CON DIFERENCIA DE CANTIDAD (RECORTADAS) ===');
  const recortadas = results.filter(r => Math.abs(r.cantidadExcel - r.dbMatch.cantidad) >= 0.01);
  console.log(`Total: ${recortadas.length}`);
  recortadas.forEach(r => {
    console.log(`Fila ${r.rowNumber}: Código=${r.codigo} | Lote=${r.lote} | Excel=${r.cantidadExcel} | DB=${r.dbMatch.cantidad} | Dif=${r.cantidadExcel - r.dbMatch.cantidad}`);
  });

  console.log('\n=== FILAS EXCEL OMITIDAS POR COMPLETO ===');
  console.log(`Total: ${unmatchedExcelRows.length}`);
  for (const er of unmatchedExcelRows) {
    // 1. ¿Existe el producto?
    const prodRes = await client.query('SELECT * FROM productos WHERE UPPER(codigo) = $1', [er.codigo]);
    if (prodRes.rows.length === 0) {
      console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: El producto no existe en el sistema.`);
      continue;
    }
    const product = prodRes.rows[0];

    // 2. ¿Tiene lotes en el sistema?
    const lotesRes = await client.query('SELECT id, numero_lote, cantidad_disponible FROM lotes WHERE producto_id = $1', [product.id]);
    if (lotesRes.rows.length === 0) {
      console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: El producto existe pero no tiene NINGÚN lote en el sistema.`);
      continue;
    }

    const matchedLote = lotesRes.rows.find(l => loteCoincideCSV(l.numero_lote, er.lote));
    if (!matchedLote) {
      console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: Lote no coincide. Lotes en sistema para este producto: [${lotesRes.rows.map(l=>l.numero_lote).join(', ')}].`);
      continue;
    }

    // 3. Stock disponible
    console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: Stock insuficiente o agotado en base de datos. Disponible actual: ${matchedLote.cantidad_disponible}`);
  }

  await client.end();
}

main().catch(err => console.error(err));
