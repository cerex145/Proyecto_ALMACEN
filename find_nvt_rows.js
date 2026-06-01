const { Client } = require('pg');
const ExcelJS = require('exceljs');
const path = require('path');

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

  const filePath = path.join(__dirname, 'docs', 'SALIDA MIRET MEDICAL.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const excelDemands = {}; // key: product|lote => { product, lote, qtyRequested, rows: [] }

  let headers = [];
  sheet.eachRow((row, rowNumber) => {
    const rawValues = Array.isArray(row.values) ? row.values : [];
    const values = rawValues.slice(1);

    if (rowNumber === 1) {
      headers = values.map(h => String(h || '').trim().toLowerCase());
      return;
    }

    if (values.length === 0 || values.every(v => v === null || v === '')) return;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index] : '';
    });

    const codigo = normalizeProductCode(rowObj['codigo_producto'] || rowObj['codigo producto'] || rowObj['codigo']);
    const lote = normalizeLote(rowObj['lote']);
    const cantidad = Number(rowObj['cantidad'] || 0);

    if (!codigo || !lote) return;

    const key = `${codigo}|${lote}`;
    if (!excelDemands[key]) {
      excelDemands[key] = {
        codigo,
        lote,
        qtyRequested: 0,
        rows: []
      };
    }
    excelDemands[key].qtyRequested += cantidad;
    excelDemands[key].rows.push({ rowNumber, cantidad });
  });

  console.log('=== COMPARATIVA DE DEMANDA DE EXCEL VS STOCK DISPONIBLE EN BD ===');
  
  const flaggedKeys = [
    'NVT23030|PMTDF64',
    'TSCMG-35-260-LESDC|E4747855',
    '41300150|SP4125031203',
    'RSC061125-HW45|202512604',
    '53610009|SP5324121808',
    'RS*R60N10MQ|250516',
    'AHW14R001S|251219A191'
  ];

  for (const key of flaggedKeys) {
    const [codigo, lote] = key.split('|');
    
    // 1. Get DB stock
    const prodRes = await client.query('SELECT id, codigo, descripcion FROM productos WHERE UPPER(codigo) = UPPER($1)', [codigo]);
    if (prodRes.rows.length === 0) {
      console.log(`\n❌ Producto ${codigo} no existe en la base de datos.`);
      continue;
    }
    const p = prodRes.rows[0];

    const loteRes = await client.query(`
      SELECT l.cantidad_disponible, ni.cliente_ruc, ni.proveedor
      FROM lotes l
      LEFT JOIN notas_ingreso ni ON l.nota_ingreso_id = ni.id
      WHERE l.producto_id = $1 AND UPPER(l.numero_lote) = UPPER($2)
    `, [p.id, lote]);

    const dbStock = loteRes.rows.length > 0 ? Number(loteRes.rows[0].cantidad_disponible) : 0;
    const demand = excelDemands[key];

    console.log(`\n📌 Producto: ${codigo} - ${p.descripcion}`);
    console.log(`   Lote: ${lote}`);
    console.log(`   Stock real en Base de Datos: ${dbStock}`);
    if (demand) {
      console.log(`   Total pedido en Excel: ${demand.qtyRequested}`);
      console.log(`   Filas del Excel que lo piden:`);
      demand.rows.forEach(r => {
        console.log(`     - Fila ${r.rowNumber}: cantidad = ${r.cantidad}`);
      });
      if (demand.qtyRequested > dbStock) {
        console.log(`   ⚠️ RESULTADO: Faltan ${demand.qtyRequested - dbStock} unidades en stock.`);
      } else {
        console.log(`   ✅ RESULTADO: El stock cubre la demanda.`);
      }
    } else {
      console.log(`   ⚠️ RESULTADO: Este lote no está solicitado en el Excel actual.`);
    }
  }

  await client.end();
}

main().catch(console.error);
