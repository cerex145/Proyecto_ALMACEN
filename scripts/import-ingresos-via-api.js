#!/usr/bin/env node
/*
  Importa ingresos desde CSV usando la logica oficial del backend (/api/ingresos).
  - Normaliza fechas y cantidades
  - Agrupa por codigo+lote+vto(+fecha_ingreso si existe) para evitar duplicados reales
  - Mapea codigo -> producto_id (con normalizaciones basicas)
  - Opcional: crea productos faltantes en Supabase
*/

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
const has = (name) => args.includes(name);

const CSV_PATH = arg('--file', '/home/ezku/Descargas/20606511991 - INGRESOS.csv');
const RUC = arg('--ruc', '20606511991');
const FECHA = arg('--fecha', '2026-04-05');
const API_BASE = arg('--api', 'http://localhost:3000');
const AUTO_CREATE_PRODUCTS = has('--auto-create-products');
const DRY_RUN = has('--dry-run');
const REPLACE_LAST_IMPORT = has('--replace-last-import');
const SPLIT_BY_FECHA_INGRESO = has('--split-by-fecha-ingreso');
const FECHA_INGRESO_PREFER_MDY = !has('--fecha-ingreso-dmy');

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL en apps/api/.env');
  process.exit(1);
}

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

function normalizeCode(s) {
  return String(s || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function normalizeCodeNoSpace(s) {
  return normalizeCode(s).replace(/\s+/g, '');
}

function normalizeCodeNoTrailDot(s) {
  return normalizeCode(s).replace(/\.+$/, '');
}

function parseNumber(v) {
  const raw = String(v ?? '').trim().replace(/\./g, '').replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function toIsoDate(raw, options = {}) {
  const { preferMDY = false } = options;
  const s = String(raw || '').trim();
  if (!s) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})$/);
  if (!m) return '';

  const a = Number(m[1]);
  const b = Number(m[2]);
  const c = Number(m[3]);
  let y;
  let mo;
  let d;

  if (String(m[1]).length === 4) {
    y = a;
    mo = b;
    d = c;
  } else if (String(m[3]).length === 4) {
    y = c;
    if (a > 12 && b <= 12) {
      d = a;
      mo = b;
    } else if (b > 12 && a <= 12) {
      mo = a;
      d = b;
    } else {
      if (preferMDY) {
        mo = a;
        d = b;
      } else {
        d = a;
        mo = b;
      }
    }
  } else {
    return '';
  }

  if (!(y >= 1900 && y <= 3000 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function normalizeHeaderKey(v) {
  return String(v || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

async function main() {
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const sha1 = crypto.createHash('sha1').update(csvRaw).digest('hex');

  const rows = parseCsv(csvRaw);
  if (rows.length < 2) throw new Error('CSV sin datos');

  const header = rows[0].map((h) => normalizeHeaderKey(h));
  const idx = {
    codigo: header.findIndex((h) => h === 'codigo_producto'),
    lote: header.findIndex((h) => h === 'lote'),
    vto: header.findIndex((h) => h === 'fecha_vencimiento'),
    fechaIngreso: header.findIndex((h) => h === 'fecha de ingreso' || h === 'fecha_ingreso' || h === 'fecha ingreso'),
    total: header.findIndex((h) => h === 'cantidad_total'),
    porCaja: header.findIndex((h) => h === 'cantidad_por_caja' || h === 'sum de cantidad_total')
  };

  if (idx.codigo < 0 || idx.lote < 0 || idx.vto < 0) {
    throw new Error('CSV inválido: faltan columnas codigo_producto/lote/fecha_vencimiento');
  }

  const qtyIdx = idx.total >= 0 ? idx.total : idx.porCaja;
  if (qtyIdx < 0) throw new Error('CSV inválido: falta cantidad_total o SUM de cantidad_total');

  // Agrupar por codigo+lote+vto(+fecha_ingreso cuando exista) para no mezclar movimientos historicos.
  const grouped = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const codigo = String(r[idx.codigo] || '').trim();
    const lote = String(r[idx.lote] || '').trim();
    const vto = toIsoDate(r[idx.vto], { preferMDY: false });
    const fechaIngreso = idx.fechaIngreso >= 0
      ? toIsoDate(r[idx.fechaIngreso], { preferMDY: FECHA_INGRESO_PREFER_MDY })
      : '';
    const qty = parseNumber(r[qtyIdx]);

    if (!codigo || !lote || !vto || qty <= 0) continue;

    const key = `${codigo}|||${lote}|||${vto}|||${fechaIngreso || '_'}`;
    const prev = grouped.get(key) || { codigo, lote, vto, fechaIngreso, qty: 0 };
    prev.qty += qty;
    grouped.set(key, prev);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  // Evitar doble carga del mismo archivo
  const existingByHash = await client.query(
    `select id, numero_ingreso, created_at
     from notas_ingreso
     where cliente_ruc = $1 and observaciones like $2
     order by id desc limit 1`,
    [RUC, `%sha1=${sha1}%`]
  );
  if (existingByHash.rows.length > 0) {
    console.log('Ya existe una carga con el mismo archivo (sha1).');
    console.log(existingByHash.rows[0]);
    await client.end();
    return;
  }

  if (REPLACE_LAST_IMPORT) {
    const lastImport = await client.query(
      `select id, numero_ingreso
       from notas_ingreso
       where cliente_ruc = $1 and numero_ingreso like 'ING-IMPORT-%'
       order by id desc limit 1`,
      [RUC]
    );

    if (lastImport.rows.length > 0) {
      const oldId = Number(lastImport.rows[0].id);
      await client.query('begin');
      try {
        await client.query(`delete from kardex where referencia_id = $1 and documento_tipo = 'NOTA_INGRESO'`, [oldId]);
        await client.query('delete from lotes where nota_ingreso_id = $1', [oldId]);
        await client.query('delete from nota_ingreso_detalles where nota_ingreso_id = $1', [oldId]);
        await client.query('delete from notas_ingreso where id = $1', [oldId]);
        await client.query('commit');
        console.log(`Import anterior eliminado: nota_id=${oldId}`);
      } catch (e) {
        await client.query('rollback');
        throw e;
      }
    }
  }

  const productos = await client.query('select id,codigo from productos');

  const exact = new Map();
  const noSpace = new Map();
  const noDot = new Map();

  for (const p of productos.rows) {
    const e = normalizeCode(p.codigo);
    const s = normalizeCodeNoSpace(p.codigo);
    const d = normalizeCodeNoTrailDot(p.codigo);
    if (!exact.has(e)) exact.set(e, []);
    if (!noSpace.has(s)) noSpace.set(s, []);
    if (!noDot.has(d)) noDot.set(d, []);
    exact.get(e).push(Number(p.id));
    noSpace.get(s).push(Number(p.id));
    noDot.get(d).push(Number(p.id));
  }

  const unresolved = [];
  const details = [];

  for (const item of grouped.values()) {
    const c1 = normalizeCode(item.codigo);
    const c2 = normalizeCodeNoSpace(item.codigo);
    const c3 = normalizeCodeNoTrailDot(item.codigo);

    let candidates = exact.get(c1) || [];
    if (candidates.length !== 1) candidates = noSpace.get(c2) || candidates;
    if (candidates.length !== 1) candidates = noDot.get(c3) || candidates;

    let productId = candidates.length === 1 ? candidates[0] : null;

    if (!productId && AUTO_CREATE_PRODUCTS) {
      const ins = await client.query(
        `insert into productos (codigo, descripcion, um, unidad, activo, cliente_ruc)
         values ($1,$2,$3,$4,1,$5)
         returning id`,
        [item.codigo, item.codigo, 'UND', 'UND', RUC]
      );
      productId = Number(ins.rows[0].id);

      const e = normalizeCode(item.codigo);
      const s = normalizeCodeNoSpace(item.codigo);
      const d = normalizeCodeNoTrailDot(item.codigo);
      exact.set(e, [productId]);
      noSpace.set(s, [productId]);
      noDot.set(d, [productId]);
    }

    if (!productId) {
      unresolved.push(item);
      continue;
    }

    details.push({
      producto_id: productId,
      cantidad: item.qty,
      lote_numero: item.lote,
      fecha_vencimiento: item.vto,
      fecha_ingreso: item.fechaIngreso || '',
      um: 'UND',
      cantidad_bultos: 1,
      cantidad_cajas: 1,
      cantidad_por_caja: item.qty,
      cantidad_fraccion: 0,
      cantidad_total: item.qty
    });
  }

  // Construye una o varias notas según fecha de ingreso, alineado al flujo operativo.
  const notesMap = new Map();
  for (const d of details) {
    const noteDate = (SPLIT_BY_FECHA_INGRESO && d.fecha_ingreso) ? d.fecha_ingreso : FECHA;
    const key = noteDate || FECHA;
    if (!notesMap.has(key)) notesMap.set(key, []);
    notesMap.get(key).push({
      producto_id: d.producto_id,
      cantidad: d.cantidad,
      lote_numero: d.lote_numero,
      fecha_vencimiento: d.fecha_vencimiento,
      um: d.um,
      cantidad_bultos: d.cantidad_bultos,
      cantidad_cajas: d.cantidad_cajas,
      cantidad_por_caja: d.cantidad_por_caja,
      cantidad_fraccion: d.cantidad_fraccion,
      cantidad_total: d.cantidad_total
    });
  }

  const payloads = Array.from(notesMap.entries())
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([fechaNota, detallesNota]) => ({
      fecha: fechaNota,
      ruc_cliente: RUC,
      observaciones: `Carga masiva por script via API | file=${path.basename(CSV_PATH)} | sha1=${sha1} | fecha_ingreso=${fechaNota}`,
      detalles: detallesNota
    }));

  const detallesTotales = payloads.reduce((acc, p) => acc + p.detalles.length, 0);

  console.log('Resumen preparación:');
  const groupedConFechaIngreso = Array.from(grouped.values()).filter((x) => x.fechaIngreso).length;
  console.log({
    source_rows: rows.length - 1,
    grouped_rows: grouped.size,
    grouped_with_fecha_ingreso: groupedConFechaIngreso,
    detalles_listos: detallesTotales,
    notas_planificadas: payloads.length,
    unresolved: unresolved.length,
    auto_create_products: AUTO_CREATE_PRODUCTS,
    split_by_fecha_ingreso: SPLIT_BY_FECHA_INGRESO,
    dry_run: DRY_RUN
  });

  if (payloads.length > 1) {
    const resumenNotas = payloads.map((p) => ({ fecha: p.fecha, detalles: p.detalles.length }));
    console.log('Notas planificadas (fecha/detalles):');
    console.log(resumenNotas);
  }

  if (unresolved.length > 0) {
    console.log('Unresolved preview (primeros 20):');
    console.log(unresolved.slice(0, 20));
  }

  if (DRY_RUN) {
    await client.end();
    return;
  }

  if (detallesTotales === 0) {
    await client.end();
    throw new Error('No hay detalles listos para insertar');
  }

  const resultados = [];
  for (const payload of payloads) {
    const res = await fetch(`${API_BASE}/api/ingresos`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const body = await res.json().catch(() => ({}));
    resultados.push({
      fecha: payload.fecha,
      detalles: payload.detalles.length,
      status: res.status,
      body
    });

    if (!res.ok) {
      console.log('API status:', res.status);
      console.log('API response:', body);
      await client.end();
      process.exit(1);
    }
  }

  console.log('Resultado inserción por nota:');
  console.log(resultados.map((r) => ({
    fecha: r.fecha,
    detalles: r.detalles,
    status: r.status,
    numero_ingreso: r.body?.data?.numero_ingreso,
    id: r.body?.data?.id
  })));

  await client.end();
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
