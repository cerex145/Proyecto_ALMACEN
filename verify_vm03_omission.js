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

  // Cargar lotes de Kinessences (producto 5615) desde la DB
  const lotesRes = await client.query('SELECT * FROM lotes WHERE producto_id = 5615 ORDER BY id ASC');
  const lotesState = lotesRes.rows.map(l => ({
    id: l.id,
    numero_lote: l.numero_lote,
    cantidad_disponible: Number(l.cantidad_disponible) + 126 // restaurar para simulación (ya que VM03/38 tiene 0 ahora)
  }));
  // Para VM03/38 su stock ingresado era 126
  const vm03_38 = lotesState.find(l => l.numero_lote === 'VM03/38');
  if (vm03_38) vm03_38.cantidad_disponible = 126;
  const vm03 = lotesState.find(l => l.numero_lote === 'VM03');
  if (vm03) vm03.cantidad_disponible = 156;

  console.log('Lotes iniciales en simulación para Kinessences:');
  console.log(lotesState);

  console.log('\n--- SIMULACIÓN DE PROCESAMIENTO SECUENCIAL DE FILAS DE KINESSENCES ---');
  let totalImportado = 0;
  let totalOmitido = 0;

  // Filtrar solo las filas del excel que corresponden a Kinessences (las que tienen lote VM03 o VM03/38)
  const kinessenceRows = excelRows.filter(r => r.lote === 'VM03' || r.lote === 'VM03/38');

  for (const r of kinessenceRows) {
    // Buscar lote que coincide según la lógica del frontend:
    // .find recorre en orden
    const matchedLote = lotesState.find(l => loteCoincideCSV(l.numero_lote, r.lote));

    if (!matchedLote) {
      console.log(`Fila ${r.rowNumber}: Lote Excel "${r.lote}" | Pedido: ${r.cantidad} -> OMITIDA: No coincide con ningún lote.`);
      totalOmitido += r.cantidad;
      continue;
    }

    const disponible = matchedLote.cantidad_disponible;
    if (disponible <= 0) {
      console.log(`Fila ${r.rowNumber}: Lote Excel "${r.lote}" | Pedido: ${r.cantidad} -> OMITIDA: Se emparejó con Lote DB "${matchedLote.numero_lote}" pero el stock disponible es 0.`);
      totalOmitido += r.cantidad;
      continue;
    }

    let cantidadAUsar = r.cantidad;
    if (cantidadAUsar > disponible) {
      console.log(`Fila ${r.rowNumber}: Lote Excel "${r.lote}" | Pedido: ${r.cantidad} -> IMPORTADA PARCIAL: Se emparejó con Lote DB "${matchedLote.numero_lote}". Solicitado: ${r.cantidad}, Disponible: ${disponible}. Ajustado a ${disponible}.`);
      cantidadAUsar = disponible;
      matchedLote.cantidad_disponible = 0;
    } else {
      console.log(`Fila ${r.rowNumber}: Lote Excel "${r.lote}" | Pedido: ${r.cantidad} -> IMPORTADA CON ÉXITO: Se emparejó con Lote DB "${matchedLote.numero_lote}". Stock restante: ${disponible - cantidadAUsar}`);
      matchedLote.cantidad_disponible -= cantidadAUsar;
    }
    totalImportado += cantidadAUsar;
  }

  console.log('\n--- RESULTADOS FINALES DE LA SIMULACIÓN KINESSENCES ---');
  console.log(`Total solicitado en Excel para Kinessences: ${kinessenceRows.reduce((acc, r) => acc + r.cantidad, 0)}`);
  console.log(`Total importado con éxito: ${totalImportado}`);
  console.log(`Total omitido: ${totalOmitido}`);

  await client.end();
}

main().catch(err => console.error(err));
