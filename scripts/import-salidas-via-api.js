#!/usr/bin/env node
/*
  Importa salidas desde CSV usando la logica oficial del backend (/api/salidas).
  - Normaliza cantidades
  - Agrupa por codigo+lote
  - Mapea codigo -> producto_id y lote -> lote_id
  - Usa POST /api/salidas para respetar la transaccion oficial
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

const CSV_PATH = arg('--file', '/home/ezku/CEREX/Proyecto_ALMACEN/salidas_trauma_spine_preparado.csv');
const RUC = arg('--ruc', '20606511991');
const CLIENTE_ID = arg('--cliente-id', null);
const FECHA = arg('--fecha', new Date().toISOString().slice(0, 10));
const API_BASE = arg('--api', 'http://localhost:3000');
const DRY_RUN = has('--dry-run');
const STRICT_LOTE = has('--strict-lote');
const ALLOW_FIFO_FALLBACK = has('--allow-fifo-fallback') || !STRICT_LOTE;
const CAP_TO_STOCK = has('--cap-to-stock');
const IGNORE_LOTE = has('--ignore-lote');

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

function parseNumber(v) {
  const raw = String(v ?? '').trim().replace(/\./g, '').replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
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

function normalizeCodeNoDbmSuffix(s) {
  return normalizeCodeNoTrailDot(s).replace(/\s+DBM$/i, '');
}

function normalizeLote(s) {
  return String(s || '').trim().toUpperCase().replace(/\s+/g, '');
}

async function main() {
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8').replace(/^\uFEFF/, '');
  const sha1 = crypto.createHash('sha1').update(csvRaw).digest('hex');

  const rows = parseCsv(csvRaw);
  if (rows.length < 2) throw new Error('CSV sin datos');

  const header = rows[0].map((h) => String(h || '').trim().toLowerCase());
  const idx = {
    codigo: header.findIndex((h) => h === 'codigo_producto'),
    lote: header.findIndex((h) => h === 'lote'),
    qty: header.findIndex((h) => h === 'sum de cantidad' || h === 'sum de cantidad_total' || h === 'cantidad_total')
  };

  if (idx.codigo < 0 || idx.lote < 0 || idx.qty < 0) {
    throw new Error('CSV invalido: faltan columnas codigo_producto/lote/SUM de cantidad');
  }

  const grouped = new Map();
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const codigo = String(r[idx.codigo] || '').trim();
    const lote = String(r[idx.lote] || '').trim();
    const qty = parseNumber(r[idx.qty]);

    if (!codigo || !lote || qty <= 0) continue;

    const key = `${normalizeCodeNoTrailDot(codigo)}|||${normalizeLote(lote)}`;
    const prev = grouped.get(key) || { codigo, lote, qty: 0 };
    prev.qty += qty;
    grouped.set(key, prev);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  let clienteId = CLIENTE_ID ? Number(CLIENTE_ID) : null;
  if (!clienteId) {
    const cli = await client.query(
      `select id, codigo, razon_social, cuit
       from clientes
       where regexp_replace(coalesce(cuit,''), '[^0-9]', '', 'g') = $1
       order by id asc
       limit 1`,
      [String(RUC)]
    );
    if (cli.rows.length === 0) {
      await client.end();
      throw new Error(`No se encontro cliente para RUC ${RUC}. Usa --cliente-id`);
    }
    clienteId = Number(cli.rows[0].id);
  }

  const productosRuc = await client.query(
    `select id, codigo from productos where cliente_ruc = $1`,
    [String(RUC)]
  );
  const productosAll = await client.query('select id, codigo from productos');
  const lotes = await client.query(
    `select id, producto_id, numero_lote, cantidad_disponible
     from lotes
     where cantidad_disponible > 0`
  );

  const buildMaps = (rows) => {
    const exact = new Map();
    const noSpace = new Map();
    const noDot = new Map();
    const noDbm = new Map();
    for (const p of rows) {
      const pid = Number(p.id);
      const e = normalizeCode(p.codigo);
      const s = normalizeCodeNoSpace(p.codigo);
      const d = normalizeCodeNoTrailDot(p.codigo);
      const b = normalizeCodeNoDbmSuffix(p.codigo);
      if (!exact.has(e)) exact.set(e, []);
      if (!noSpace.has(s)) noSpace.set(s, []);
      if (!noDot.has(d)) noDot.set(d, []);
      if (!noDbm.has(b)) noDbm.set(b, []);
      exact.get(e).push(pid);
      noSpace.get(s).push(pid);
      noDot.get(d).push(pid);
      noDbm.get(b).push(pid);
    }
    return { exact, noSpace, noDot, noDbm };
  };

  const mapsRuc = buildMaps(productosRuc.rows);
  const mapsAll = buildMaps(productosAll.rows);

  const resolveCandidates = (codigo) => {
    const c1 = normalizeCode(codigo);
    const c2 = normalizeCodeNoSpace(codigo);
    const c3 = normalizeCodeNoTrailDot(codigo);
    const c4 = normalizeCodeNoDbmSuffix(codigo);

    let candidates = mapsRuc.exact.get(c1) || [];
    if (candidates.length !== 1) candidates = mapsRuc.noSpace.get(c2) || candidates;
    if (candidates.length !== 1) candidates = mapsRuc.noDot.get(c3) || candidates;
    if (candidates.length !== 1) candidates = mapsRuc.noDbm.get(c4) || candidates;
    if (candidates.length > 0) return candidates;

    candidates = mapsAll.exact.get(c1) || [];
    if (candidates.length !== 1) candidates = mapsAll.noSpace.get(c2) || candidates;
    if (candidates.length !== 1) candidates = mapsAll.noDot.get(c3) || candidates;
    if (candidates.length !== 1) candidates = mapsAll.noDbm.get(c4) || candidates;
    return candidates;
  };

  const lotesByProducto = new Map();
  for (const l of lotes.rows) {
    const pid = Number(l.producto_id);
    if (!lotesByProducto.has(pid)) lotesByProducto.set(pid, []);
    lotesByProducto.get(pid).push({
      id: Number(l.id),
      lote: String(l.numero_lote || ''),
      loteNorm: normalizeLote(l.numero_lote),
      stock: Number(l.cantidad_disponible || 0)
    });
  }

  const totalStockByProducto = new Map();
  for (const [pid, ls] of lotesByProducto.entries()) {
    const total = ls.reduce((acc, l) => acc + Number(l.stock || 0), 0);
    totalStockByProducto.set(pid, total);
  }

  const pickBestCandidate = (candidates, neededQty = 0) => {
    if (!candidates || candidates.length === 0) return null;
    const sorted = [...candidates].sort((a, b) => {
      const sb = Number(totalStockByProducto.get(b) || 0);
      const sa = Number(totalStockByProducto.get(a) || 0);
      return sb - sa || a - b;
    });

    const enough = sorted.find((pid) => Number(totalStockByProducto.get(pid) || 0) + 0.0001 >= neededQty);
    return enough || sorted[0];
  };

  const plannedByProduct = new Map();
  const getRemainingByProduct = (pid) => {
    const total = Number(totalStockByProducto.get(pid) || 0);
    const planned = Number(plannedByProduct.get(pid) || 0);
    return Math.max(0, total - planned);
  };

  const allocateAcrossCandidates = (candidates, requestedQty) => {
    const need = Number(requestedQty || 0);
    if (need <= 0) return [];

    const sorted = [...new Set(candidates)].sort((a, b) => {
      const rb = getRemainingByProduct(b);
      const ra = getRemainingByProduct(a);
      return rb - ra || a - b;
    });

    let pending = need;
    const allocations = [];

    for (const pid of sorted) {
      if (pending <= 0.0001) break;
      const rem = getRemainingByProduct(pid);
      if (rem <= 0.0001) continue;
      const take = Math.min(rem, pending);
      if (take <= 0.0001) continue;

      allocations.push({ producto_id: pid, cantidad: take });
      plannedByProduct.set(pid, Number(plannedByProduct.get(pid) || 0) + take);
      pending -= take;
    }

    return allocations;
  };

  const unresolved = [];
  const details = [];

  for (const item of grouped.values()) {
    const candidates = resolveCandidates(item.codigo);

    if (!candidates.length) {
      unresolved.push({ reason: 'producto_no_encontrado', ...item });
      continue;
    }

    if (IGNORE_LOTE) {
      const alloc = allocateAcrossCandidates(candidates, item.qty);
      if (alloc.length === 0) {
        if (CAP_TO_STOCK) {
          const best = pickBestCandidate(candidates, item.qty);
          if (best) {
            details.push({
              producto_id: best,
              cantidad: item.qty,
              cant_bulto: 1,
              cant_caja: 1,
              cant_x_caja: item.qty,
              cant_fraccion: 0
            });
            continue;
          }
        }
        unresolved.push({ reason: 'sin_candidato_producto', candidates, ...item });
        continue;
      }

      for (const a of alloc) {
        details.push({
          producto_id: a.producto_id,
          cantidad: a.cantidad,
          cant_bulto: 1,
          cant_caja: 1,
          cant_x_caja: a.cantidad,
          cant_fraccion: 0
        });
      }
      continue;
    }

    const loteNorm = normalizeLote(item.lote);
    let loteMatches = [];

    for (const pid of candidates) {
      const lps = lotesByProducto.get(pid) || [];
      for (const l of lps) {
        if (l.loteNorm === loteNorm) {
          loteMatches.push({ ...l, producto_id: pid });
        }
      }
    }

    if (loteMatches.length === 0 && ALLOW_FIFO_FALLBACK) {
      const alloc = allocateAcrossCandidates(candidates, item.qty);
      if (alloc.length === 0) {
        if (CAP_TO_STOCK) {
          const best = pickBestCandidate(candidates, item.qty);
          if (best) {
            details.push({
              producto_id: best,
              cantidad: item.qty,
              cant_bulto: 1,
              cant_caja: 1,
              cant_x_caja: item.qty,
              cant_fraccion: 0
            });
            continue;
          }
        }
        unresolved.push({ reason: 'sin_candidato_fifo', candidates, ...item });
        continue;
      }

      for (const a of alloc) {
        details.push({
          producto_id: a.producto_id,
          cantidad: a.cantidad,
          cant_bulto: 1,
          cant_caja: 1,
          cant_x_caja: a.cantidad,
          cant_fraccion: 0
        });
      }
      continue;
    }

    if (loteMatches.length === 0) {
      unresolved.push({ reason: 'lote_no_encontrado', candidates, ...item });
      continue;
    }

    loteMatches = loteMatches.sort((a, b) => b.stock - a.stock || a.id - b.id);
    const chosen = loteMatches[0];

    if (chosen.stock + 0.0001 < item.qty && ALLOW_FIFO_FALLBACK) {
      const alloc = allocateAcrossCandidates(candidates, item.qty);
      if (alloc.length === 0) {
        if (CAP_TO_STOCK) {
          const best = pickBestCandidate(candidates, item.qty);
          if (best) {
            details.push({
              producto_id: best,
              cantidad: item.qty,
              cant_bulto: 1,
              cant_caja: 1,
              cant_x_caja: item.qty,
              cant_fraccion: 0
            });
            continue;
          }
        }
        unresolved.push({ reason: 'sin_candidato_fifo_stock', candidates, ...item });
        continue;
      }
      for (const a of alloc) {
        details.push({
          producto_id: a.producto_id,
          cantidad: a.cantidad,
          cant_bulto: 1,
          cant_caja: 1,
          cant_x_caja: a.cantidad,
          cant_fraccion: 0
        });
      }
      continue;
    }

    if (chosen.stock + 0.0001 < item.qty) {
      unresolved.push({ reason: 'stock_insuficiente_lote', stock: chosen.stock, ...item });
      continue;
    }

    details.push({
      producto_id: chosen.producto_id,
      lote_id: chosen.id,
      cantidad: item.qty,
      cant_bulto: 1,
      cant_caja: 1,
      cant_x_caja: item.qty,
      cant_fraccion: 0
    });
  }

  const adjustedDetails = [];
  const adjustedOut = [];
  if (CAP_TO_STOCK) {
    const usedByProduct = new Map();
    for (const d of details) {
      const pid = Number(d.producto_id);
      const stockTotal = Number(totalStockByProducto.get(pid) || 0);
      const used = Number(usedByProduct.get(pid) || 0);
      const remaining = Math.max(0, stockTotal - used);
      if (remaining <= 0.0001) {
        adjustedOut.push({ reason: 'sin_stock_total', producto_id: pid, requested: Number(d.cantidad || 0), stock_total: stockTotal });
        continue;
      }

      const requested = Number(d.cantidad || 0);
      const take = Math.min(requested, remaining);
      if (take <= 0.0001) continue;

      const adjusted = {
        ...d,
        cantidad: take,
        cant_x_caja: take
      };
      // En modo recorte por stock, delegamos la asignacion de lotes al FIFO del backend.
      delete adjusted.lote_id;

      adjustedDetails.push(adjusted);
      usedByProduct.set(pid, used + take);

      if (take + 0.0001 < requested) {
        adjustedOut.push({
          reason: 'recortado_por_stock',
          producto_id: pid,
          requested,
          taken: take,
          stock_total: stockTotal
        });
      }
    }
  }

  const finalDetails = CAP_TO_STOCK ? adjustedDetails : details;

  const payload = {
    cliente_id: clienteId,
    cliente_ruc: String(RUC),
    fecha: FECHA,
    observaciones: `Carga masiva salidas por script via API | file=${path.basename(CSV_PATH)} | sha1=${sha1}`,
    detalles: finalDetails
  };

  console.log('Resumen preparacion:');
  console.log({
    source_rows: rows.length - 1,
    grouped_rows: grouped.size,
    detalles_listos: finalDetails.length,
    unresolved: unresolved.length,
    ajustados_stock: adjustedOut.length,
    cliente_id: clienteId,
    dry_run: DRY_RUN,
    allow_fifo_fallback: ALLOW_FIFO_FALLBACK,
    cap_to_stock: CAP_TO_STOCK,
    ignore_lote: IGNORE_LOTE
  });

  if (unresolved.length > 0) {
    console.log('Unresolved preview (primeros 30):');
    console.log(unresolved.slice(0, 30));
  }

  if (adjustedOut.length > 0) {
    console.log('Ajustes por stock (primeros 30):');
    console.log(adjustedOut.slice(0, 30));
  }

  if (DRY_RUN) {
    await client.end();
    return;
  }

  if (finalDetails.length === 0) {
    await client.end();
    throw new Error('No hay detalles listos para insertar');
  }

  const res = await fetch(`${API_BASE}/api/salidas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.json().catch(() => ({}));
  console.log('API status:', res.status);
  console.log('API response:', body);

  await client.end();

  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
