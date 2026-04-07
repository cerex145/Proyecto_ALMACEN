#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '..', 'apps', 'api', '.env') });

const args = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = args.indexOf(name);
  if (i >= 0 && i + 1 < args.length) return args[i + 1];
  return fallback;
};

const CSV_PATH = arg('--file', path.join(__dirname, '..', 'salidas_trauma_spine_preparado.csv'));
const NOTE_ID = Number(arg('--note-id', '25'));
const OUT_CSV = arg('--out-csv', path.join(__dirname, '..', 'reporte_salidas_recortes_omitidos.csv'));
const OUT_TXT = arg('--out-txt', path.join(__dirname, '..', 'reporte_salidas_diferencia_total.txt'));

function parseCsv(content) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const nx = content[i + 1];

    if (ch === '"') {
      if (inQuotes && nx === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && nx === '\n') i++;
      row.push(cur);
      if (row.some((c) => String(c).trim() !== '')) rows.push(row);
      row = [];
      cur = '';
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  if (row.some((c) => String(c).trim() !== '')) rows.push(row);
  return rows;
}

function parseNumber(v) {
  const raw = String(v ?? '').trim().replace(/\./g, '').replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\.+$/, '')
    .replace(/\s+DBM$/i, '')
    .replace(/\s+/g, ' ');
}

function toCsv(rows) {
  return rows
    .map((r) => r.map((v) => {
      const s = String(v ?? '');
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    }).join(','))
    .join('\n');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en apps/api/.env');
  }

  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const sha1 = crypto.createHash('sha1').update(csvRaw).digest('hex');
  const rows = parseCsv(csvRaw);
  if (rows.length < 2) throw new Error('CSV sin datos');

  const header = rows[0].map((h) => String(h || '').trim().toLowerCase());
  const idxCodigo = header.findIndex((h) => h === 'codigo_producto');
  const idxQty = header.findIndex((h) => h === 'sum de cantidad' || h === 'sum de cantidad_total' || h === 'cantidad_total');
  if (idxCodigo < 0 || idxQty < 0) throw new Error('CSV invalido para reporte');

  const requestedByCode = new Map();
  let totalRequested = 0;

  for (let i = 1; i < rows.length; i++) {
    const codigo = normalizeCode(rows[i][idxCodigo]);
    const qty = parseNumber(rows[i][idxQty]);
    if (!codigo || qty <= 0) continue;
    requestedByCode.set(codigo, (requestedByCode.get(codigo) || 0) + qty);
    totalRequested += qty;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const noteCheck = await client.query(
    'select id, numero_salida, fecha, cliente_ruc, observaciones from notas_salida where id = $1',
    [NOTE_ID]
  );
  if (!noteCheck.rows.length) {
    await client.end();
    throw new Error(`No existe nota_salida id=${NOTE_ID}`);
  }

  const detalleRows = await client.query(
    `select p.codigo as codigo, coalesce(sum(d.cantidad),0) as cantidad
     from nota_salida_detalles d
     join productos p on p.id = d.producto_id
     where d.nota_salida_id = $1
     group by p.codigo`,
    [NOTE_ID]
  );

  const dispatchedByCode = new Map();
  let totalDispatched = 0;
  for (const r of detalleRows.rows) {
    const code = normalizeCode(r.codigo);
    const qty = Number(r.cantidad || 0);
    if (!code) continue;
    dispatchedByCode.set(code, (dispatchedByCode.get(code) || 0) + qty);
    totalDispatched += qty;
  }

  await client.end();

  const recortesRows = [
    ['codigo_producto', 'solicitado_csv', 'despachado_nota', 'diferencia', 'estado']
  ];

  const allCodes = new Set([...requestedByCode.keys(), ...dispatchedByCode.keys()]);
  let totalDifference = 0;
  let totalOmitido = 0;
  let totalRecortado = 0;

  for (const code of allCodes) {
    const req = Number(requestedByCode.get(code) || 0);
    const dsp = Number(dispatchedByCode.get(code) || 0);
    const diff = req - dsp;
    if (diff <= 0.0001) continue;

    totalDifference += diff;
    const estado = dsp <= 0.0001 ? 'OMITIDO' : 'RECORTADO';
    if (estado === 'OMITIDO') totalOmitido += 1;
    else totalRecortado += 1;

    recortesRows.push([
      code,
      req.toFixed(2),
      dsp.toFixed(2),
      diff.toFixed(2),
      estado
    ]);
  }

  fs.writeFileSync(OUT_CSV, toCsv(recortesRows) + '\n', 'utf8');

  const fechaNota = new Date(noteCheck.rows[0].fecha);
  const fechaIso = Number.isNaN(fechaNota.getTime()) ? String(noteCheck.rows[0].fecha) : fechaNota.toISOString().slice(0, 10);

  const txt = [
    `nota_salida_id=${NOTE_ID}`,
    `numero_salida=${noteCheck.rows[0].numero_salida}`,
    `fecha=${fechaIso}`,
    `cliente_ruc=${noteCheck.rows[0].cliente_ruc || ''}`,
    `csv_file=${path.basename(CSV_PATH)}`,
    `csv_sha1=${sha1}`,
    `total_solicitado_csv=${totalRequested.toFixed(2)}`,
    `total_despachado_nota=${totalDispatched.toFixed(2)}`,
    `diferencia_exacta=${(totalRequested - totalDispatched).toFixed(2)}`,
    `codigos_omitidos=${totalOmitido}`,
    `codigos_recortados=${totalRecortado}`,
    `filas_reporte=${Math.max(0, recortesRows.length - 1)}`
  ].join('\n');

  fs.writeFileSync(OUT_TXT, `${txt}\n`, 'utf8');

  console.log('Reporte generado:');
  console.log({
    out_csv: OUT_CSV,
    out_txt: OUT_TXT,
    total_solicitado_csv: totalRequested.toFixed(2),
    total_despachado_nota: totalDispatched.toFixed(2),
    diferencia_exacta: (totalRequested - totalDispatched).toFixed(2),
    filas_reporte: Math.max(0, recortesRows.length - 1)
  });
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
