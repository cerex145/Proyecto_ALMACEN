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
          || loteCsvCanonico.includes(loteNormalizado)
      ));
};

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.jdcqstaoqximbmqbwjwy:Sardev190712@aws-1-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // 1. Obtener los detalles de la Nota de Salida 81
  const nsdRes = await client.query(`
    SELECT d.id, d.producto_id, p.codigo as prod_codigo, p.descripcion as prod_desc, d.lote_numero, d.cantidad
    FROM nota_salida_detalles d
    JOIN productos p ON d.producto_id = p.id
    WHERE d.nota_salida_id = 81
  `);
  const dbDetalles = nsdRes.rows.map(r => ({
    producto_id: r.producto_id,
    codigo: normalizeProductCode(r.prod_codigo),
    descripcion: r.prod_desc,
    lote_numero: normalizeLote(r.lote_numero),
    cantidad: Number(r.cantidad),
    usedAmount: 0 // para control de agregación
  }));

  console.log(`Detalles en la nota de salida DB: ${dbDetalles.length}`);

  // 2. Leer el Excel de Salidas
  const filePath = path.join(__dirname, 'docs', 'SALIDA AFECORP.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const excelRows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    excelRows.push({
      rowNumber,
      codigo: normalizeProductCode(values[2]),
      codigoRaw: values[2],
      nombre: String(values[3] || '').trim(),
      lote: String(values[4] || '').trim(),
      cantidad: Number(values[10] || 0)
    });
  });

  console.log(`Filas de datos en Excel: ${excelRows.length}\n`);

  const results = [];
  const unmatchedExcelRows = [];

  for (const er of excelRows) {
    // Buscamos un detalle en la DB que coincida por producto y por lote
    // Para el código, hacemos una comparación flexible (por ejemplo, si uno contiene al otro o si coinciden canonizados)
    const matches = dbDetalles.filter(dbd => {
      const prodCodeMatch = dbd.codigo === er.codigo || dbd.codigo.includes(er.codigo) || er.codigo.includes(dbd.codigo) ||
                            (er.codigoRaw === '-' && (normalizeText(dbd.descripcion).includes(normalizeText(er.nombre)) || normalizeText(er.nombre).includes(normalizeText(dbd.descripcion))));
      const loteMatch = loteCoincideCSV(dbd.lote_numero, er.lote);
      return prodCodeMatch && loteMatch;
    });

    if (matches.length > 0) {
      // Coincide con al menos un registro en la nota de salida DB
      // Registramos esto
      results.push({
        rowNumber: er.rowNumber,
        codigo: er.codigo,
        lote: er.lote,
        cantidad: er.cantidad,
        status: 'EXITOSO',
        dbMatch: matches[0]
      });
      matches[0].usedAmount += er.cantidad;
    } else {
      unmatchedExcelRows.push(er);
    }
  }

  console.log('=== RESUMEN DE COINCIDENCIAS ===');
  console.log(`Filas exitosas/importadas del Excel (incluyendo las que se agruparon): ${results.length}`);
  console.log(`Filas omitidas del Excel: ${unmatchedExcelRows.length}`);

  console.log('\n=== DETALLE DE FILAS OMITIDAS ===');
  // Para cada fila omitida, queremos explicar por qué no se importó.
  // 1. ¿Existe el producto en el sistema?
  // 2. ¿Existe el lote en el sistema para ese producto?
  // 3. ¿Tiene stock disponible?
  for (const er of unmatchedExcelRows) {
    const prodRes = await client.query('SELECT * FROM productos WHERE LOWER(codigo) = LOWER($1)', [er.codigo]);
    if (prodRes.rows.length === 0) {
      console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: El producto no existe en el sistema.`);
      continue;
    }
    const product = prodRes.rows[0];

    const lotesRes = await client.query('SELECT * FROM lotes WHERE producto_id = $1', [product.id]);
    if (lotesRes.rows.length === 0) {
      console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: El producto existe, pero no tiene NINGÚN lote ingresado en la base de datos.`);
      continue;
    }

    const matchedLote = lotesRes.rows.find(l => loteCoincideCSV(l.numero_lote, er.lote));
    if (!matchedLote) {
      console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: Lote no coincide con los lotes del sistema: [${lotesRes.rows.map(l=>l.numero_lote).join(', ')}].`);
      continue;
    }

    // Si coincide el lote, tiene que ser por stock
    console.log(`Fila ${er.rowNumber}: Código "${er.codigoRaw}" | Lote "${er.lote}" | Cantidad ${er.cantidad} -> MOTIVO: Stock insuficiente o agotado en DB (Disponible: ${matchedLote.cantidad_disponible}, Nota de Ingreso ID: ${matchedLote.nota_ingreso_id}).`);
  }

  console.log('\n=== AGRUPACIÓN / COLAPSAMIENTO DE FILAS ===');
  // Agrupar filas exitosas por producto + lote
  const aggregations = {};
  for (const r of results) {
    const key = `${r.dbMatch.codigo} - Lote ${r.dbMatch.lote_numero}`;
    if (!aggregations[key]) {
      aggregations[key] = [];
    }
    aggregations[key].push(`Fila ${r.rowNumber} (Cant: ${r.cantidad})`);
  }

  Object.entries(aggregations).forEach(([key, list]) => {
    if (list.length > 1) {
      console.log(`Producto y Lote: ${key}`);
      console.log(`  Se combinaron las siguientes ${list.length} filas del Excel:`);
      list.forEach(l => console.log(`    - ${l}`));
      const totalSum = results.filter(r => `${r.dbMatch.codigo} - Lote ${r.dbMatch.lote_numero}` === key).reduce((sum, r) => sum + r.cantidad, 0);
      console.log(`  -> Quedó consolidado en 1 sola fila con Cantidad Total: ${totalSum}\n`);
    }
  });

  await client.end();
}

main().catch(err => console.error(err));
