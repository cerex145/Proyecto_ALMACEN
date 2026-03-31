#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
    const args = { fifo: true };
    for (let i = 2; i < argv.length; i += 1) {
        const token = argv[i];
        if (token === '--ingresos') args.ingresos = argv[++i];
        else if (token === '--salidas') args.salidas = argv[++i];
        else if (token === '--out') args.out = argv[++i];
        else if (token === '--delimiter') args.delimiter = argv[++i];
        else if (token === '--no-fifo') args.fifo = false;
    }
    return args;
}

function detectDelimiter(line, preferred) {
    if (preferred) return preferred;
    const raw = String(line || '');
    const counts = {
        ',': (raw.match(/,/g) || []).length,
        ';': (raw.match(/;/g) || []).length,
        '\t': (raw.match(/\t/g) || []).length
    };
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] || ',';
}

function parseCSV(content, preferredDelimiter) {
    const raw = String(content || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const firstLine = raw.split('\n', 1)[0] || '';
    const delimiter = detectDelimiter(firstLine, preferredDelimiter);

    const rows = [];
    let row = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < raw.length; i += 1) {
        const ch = raw[i];
        const next = raw[i + 1];

        if (ch === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (ch === delimiter && !inQuotes) {
            row.push(current);
            current = '';
            continue;
        }

        if (ch === '\n' && !inQuotes) {
            row.push(current);
            if (row.some((c) => String(c || '').trim() !== '')) rows.push(row);
            row = [];
            current = '';
            continue;
        }

        current += ch;
    }

    row.push(current);
    if (row.some((c) => String(c || '').trim() !== '')) rows.push(row);

    if (!rows.length) return { delimiter, headers: [], data: [] };

    const headers = rows[0].map((h) => normalizeHeader(h));
    const data = rows.slice(1).map((cols, idx) => {
        const obj = { __row: idx + 2 };
        headers.forEach((h, i) => {
            obj[h] = normalizeField(cols[i]);
        });
        return obj;
    });

    return { delimiter, headers, data };
}

function normalizeHeader(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.\-]+/g, ' ')
        .replace(/\s+/g, '_');
}

function normalizeField(value) {
    return String(value || '')
        .replace(/\r?\n+/g, ' ')
        .replace(/[\u0000-\u001f]/g, ' ')
        .trim();
}

function cleanCode(value) {
    return normalizeField(value)
        .replace(/^"+|"+$/g, '')
        .replace(/\s+/g, ' ')
        .toUpperCase();
}

function cleanLot(value) {
    return normalizeField(value)
        .replace(/^"+|"+$/g, '')
        .replace(/\s+/g, ' ')
        .toUpperCase();
}

function cleanName(value) {
    return normalizeField(value)
        .replace(/^"+|"+$/g, '')
        .replace(/\s+/g, ' ')
        .toUpperCase();
}

function parseNumber(value, fallback = 0) {
    const raw = normalizeField(value);
    if (!raw) return fallback;
    const compact = raw.replace(/[^0-9,.-]/g, '');
    if (!compact) return fallback;

    let normalized = compact;
    const hasComma = compact.includes(',');
    const hasDot = compact.includes('.');

    if (hasComma && hasDot) {
        const lastComma = compact.lastIndexOf(',');
        const lastDot = compact.lastIndexOf('.');
        const decimalSep = lastComma > lastDot ? ',' : '.';
        const thousandsSep = decimalSep === ',' ? /\./g : /,/g;
        normalized = compact.replace(thousandsSep, '').replace(decimalSep, '.');
    } else if (hasComma) {
        normalized = compact.replace(',', '.');
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value) {
    const raw = normalizeField(value);
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = new Date(`${raw}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const m = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) {
        const d = new Date(`${m[3]}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}T00:00:00`);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

function pick(obj, keys) {
    for (const k of keys) {
        if (obj[k] !== undefined && normalizeField(obj[k]) !== '') return obj[k];
    }
    return '';
}

function normalizeIngresoRow(row, idx) {
    const codigo = cleanCode(pick(row, ['codigo_producto', 'codigo', 'cod_producto', 'producto_codigo', 'cod_producto_']));
    const nombre = cleanName(pick(row, ['nombre', 'nombre_producto', 'producto', 'descripcion']));
    const lote = cleanLot(pick(row, ['lote', 'numero_lote', 'lote_numero']));
    const fechaIngresoRaw = pick(row, ['fecha_ingreso', 'fecha_de_ingreso', 'fecha_de_h_ingreso', 'fecha']);
    const fechaIngreso = parseDate(fechaIngresoRaw);
    const cantidad = parseNumber(pick(row, ['cantidad_total', 'cantidad', 'cant_total', 'cant_total_ingreso', 'cant_total__ingreso']), NaN);

    return {
        rowNumber: row.__row || idx + 2,
        codigo,
        nombre,
        lote,
        fechaIngreso,
        fechaIngresoRaw: normalizeField(fechaIngresoRaw),
        cantidad,
        raw: row
    };
}

function normalizeSalidaRow(row, idx) {
    const codigo = cleanCode(pick(row, ['codigo_producto', 'codigo', 'cod_producto', 'producto_codigo']));
    const lote = cleanLot(pick(row, ['lote', 'numero_lote', 'lote_numero']));
    const fechaRaw = pick(row, ['fecha_salida', 'fecha_de_h_salida', 'fecha', 'fecha_movimiento']);
    const fecha = parseDate(fechaRaw);
    const cantidad = parseNumber(pick(row, ['cantidad_total', 'cantidad', 'cant_total', 'cant_total_salida']), NaN);

    return {
        rowNumber: row.__row || idx + 2,
        codigo,
        lote,
        fecha,
        fechaRaw: normalizeField(fechaRaw),
        cantidad,
        raw: row,
        ordinal: idx
    };
}

function validateAndBuild({ ingresosRows, salidasRows, fifoEnabled = true }) {
    const errors = [];
    const warnings = [];
    const EPS = 1e-9;

    const nameToCodes = new Map();
    const codeToNames = new Map();

    const ingresos = ingresosRows.map(normalizeIngresoRow).filter((r) => {
        if (!r.codigo || !r.lote || !Number.isFinite(r.cantidad) || r.cantidad <= 0) {
            errors.push(`Ingreso fila ${r.rowNumber}: datos inválidos (codigo/lote/cantidad).`);
            return false;
        }
        if (!r.fechaIngreso) {
            errors.push(`Ingreso fila ${r.rowNumber}: fecha_ingreso inválida (${r.fechaIngresoRaw || 'vacía'}).`);
            return false;
        }

        if (r.nombre) {
            if (!nameToCodes.has(r.nombre)) nameToCodes.set(r.nombre, new Set());
            nameToCodes.get(r.nombre).add(r.codigo);

            if (!codeToNames.has(r.codigo)) codeToNames.set(r.codigo, new Set());
            codeToNames.get(r.codigo).add(r.nombre);
        }
        return true;
    });

    const salidas = salidasRows.map(normalizeSalidaRow).filter((r) => {
        if (!r.codigo || !r.lote || !Number.isFinite(r.cantidad) || r.cantidad <= 0) {
            errors.push(`Salida fila ${r.rowNumber}: datos inválidos (codigo/lote/cantidad).`);
            return false;
        }
        return true;
    });

    for (const [nombre, codes] of nameToCodes.entries()) {
        if (codes.size > 1) {
            warnings.push(`Producto "${nombre}" tiene múltiples códigos: ${Array.from(codes).join(', ')}`);
        }
    }
    for (const [codigo, names] of codeToNames.entries()) {
        if (names.size > 1) {
            warnings.push(`Código "${codigo}" aparece con múltiples nombres: ${Array.from(names).slice(0, 3).join(' | ')}`);
        }
    }

    ingresos.sort((a, b) => a.fechaIngreso - b.fechaIngreso || a.rowNumber - b.rowNumber);
    salidas.sort((a, b) => {
        if (!a.fecha && !b.fecha) return a.ordinal - b.ordinal;
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return a.fecha - b.fecha || a.ordinal - b.ordinal;
    });

    const duplicateMap = new Map();
    for (const s of salidas) {
        const key = `${s.codigo}|${s.lote}|${s.cantidad}`;
        if (!duplicateMap.has(key)) duplicateMap.set(key, []);
        duplicateMap.get(key).push(s.rowNumber);
    }
    for (const rows of duplicateMap.values()) {
        if (rows.length > 1) {
            rows.slice(1).forEach((rn) => warnings.push(`Posible duplicado detectado en fila ${rn}`));
        }
    }

    // Consolidación: agrupar salidas por producto+lote+fecha(yyyy-mm-dd o sin-fecha)
    const consolidatedMap = new Map();
    for (const s of salidas) {
        const dateKey = s.fecha ? s.fecha.toISOString().slice(0, 10) : `sin-fecha-${s.ordinal}`;
        const key = `${s.codigo}|${s.lote}|${dateKey}`;
        if (!consolidatedMap.has(key)) {
            consolidatedMap.set(key, {
                codigo: s.codigo,
                lote: s.lote,
                fecha: s.fecha,
                cantidad: 0,
                sourceRows: []
            });
        }
        const group = consolidatedMap.get(key);
        group.cantidad += s.cantidad;
        group.sourceRows.push(s.rowNumber);
    }
    const salidasConsolidadas = Array.from(consolidatedMap.values()).sort((a, b) => {
        if (!a.fecha && !b.fecha) return a.sourceRows[0] - b.sourceRows[0];
        if (!a.fecha) return 1;
        if (!b.fecha) return -1;
        return a.fecha - b.fecha || a.sourceRows[0] - b.sourceRows[0];
    });

    const stock = new Map(); // key producto|lote => qty
    const fifoByProduct = new Map(); // producto => [{ lote, fechaIngreso, qty }]

    for (const i of ingresos) {
        const key = `${i.codigo}|${i.lote}`;
        stock.set(key, (stock.get(key) || 0) + i.cantidad);

        if (!fifoByProduct.has(i.codigo)) fifoByProduct.set(i.codigo, []);
        fifoByProduct.get(i.codigo).push({ lote: i.lote, fechaIngreso: i.fechaIngreso, qty: i.cantidad });
    }

    for (const entries of fifoByProduct.values()) {
        entries.sort((a, b) => a.fechaIngreso - b.fechaIngreso);
    }

    for (const s of salidasConsolidadas) {
        const key = `${s.codigo}|${s.lote}`;
        const available = stock.get(key) || 0;
        const projected = available - s.cantidad;

        // Solo es error si la operación deja stock negativo real. Quedar exactamente en 0 es válido.
        if (projected < -EPS) {
            const hasAnyProductStock = Array.from(stock.keys()).some((k) => k.startsWith(`${s.codigo}|`) && (stock.get(k) || 0) > EPS);
            if (available <= EPS) {
                if (hasAnyProductStock) {
                    warnings.push(`Producto encontrado pero lote incorrecto o inexistente: ${s.codigo} lote ${s.lote}`);
                }
                errors.push(`Sin stock disponible para el producto ${s.codigo} lote ${s.lote}`);
                continue;
            }

            const msg = `Cantidad supera stock disponible. Stock actual: ${available}, solicitado: ${s.cantidad} (producto ${s.codigo}, lote ${s.lote}, filas ${s.sourceRows.join(',')})`;
            errors.push(msg);

            if (fifoEnabled) {
                const fifoLots = (fifoByProduct.get(s.codigo) || []).filter((x) => x.qty > 0);
                const fifoTotal = fifoLots.reduce((acc, x) => acc + x.qty, 0);
                if (fifoTotal >= s.cantidad) {
                    warnings.push(`FIFO sugerido: hay stock suficiente en otros lotes para ${s.codigo}.`);
                }
            }
            continue;
        }

        stock.set(key, Math.abs(projected) <= EPS ? 0 : projected);

        if (fifoEnabled) {
            const lots = fifoByProduct.get(s.codigo) || [];
            const exact = lots.find((l) => l.lote === s.lote);
            if (exact) {
                exact.qty = Math.max(0, exact.qty - s.cantidad);
            }
        }
    }

    const stockFinal = Array.from(stock.entries())
        .map(([key, qty]) => {
            const [codigo, lote] = key.split('|');
            return { codigo, lote, stock_actual: Number(qty.toFixed(2)) };
        })
        .sort((a, b) => a.codigo.localeCompare(b.codigo) || a.lote.localeCompare(b.lote));

    return {
        okToImport: errors.length === 0,
        summary: {
            ingresosValidos: ingresos.length,
            salidasValidas: salidas.length,
            salidasConsolidadas: salidasConsolidadas.length,
            errores: errors.length,
            advertencias: warnings.length
        },
        errors,
        warnings,
        stockFinal
    };
}

function main() {
    const args = parseArgs(process.argv);
    if (!args.ingresos || !args.salidas) {
        console.error('Uso: node scripts/validate-inventory-import.js --ingresos <archivo.csv> --salidas <archivo.csv> [--out resultado.json] [--delimiter ",|;|\\t"] [--no-fifo]');
        process.exit(1);
    }

    const ingresosPath = path.resolve(process.cwd(), args.ingresos);
    const salidasPath = path.resolve(process.cwd(), args.salidas);

    if (!fs.existsSync(ingresosPath) || !fs.existsSync(salidasPath)) {
        console.error('No se encontraron los archivos de ingresos o salidas.');
        process.exit(1);
    }

    const ingresosCSV = fs.readFileSync(ingresosPath, 'utf8');
    const salidasCSV = fs.readFileSync(salidasPath, 'utf8');

    const ingresosParsed = parseCSV(ingresosCSV, args.delimiter);
    const salidasParsed = parseCSV(salidasCSV, args.delimiter);

    const result = validateAndBuild({
        ingresosRows: ingresosParsed.data,
        salidasRows: salidasParsed.data,
        fifoEnabled: args.fifo
    });

    console.log('\\n=== VALIDACION PRE-IMPORTACION ===');
    console.log(`Ingresos válidos: ${result.summary.ingresosValidos}`);
    console.log(`Salidas válidas: ${result.summary.salidasValidas}`);
    console.log(`Salidas consolidadas: ${result.summary.salidasConsolidadas}`);
    console.log(`Errores: ${result.summary.errores}`);
    console.log(`Advertencias: ${result.summary.advertencias}`);
    console.log(`Permitir importación: ${result.okToImport ? 'SI' : 'NO'}`);

    if (result.errors.length) {
        console.log('\\nErrores críticos:');
        result.errors.slice(0, 100).forEach((e) => console.log(`- ${e}`));
    }

    if (result.warnings.length) {
        console.log('\\nAdvertencias:');
        result.warnings.slice(0, 100).forEach((w) => console.log(`- ${w}`));
    }

    const outputPath = path.resolve(process.cwd(), args.out || 'tmp_inventory_validation.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`\\nReporte guardado en: ${outputPath}`);

    if (!result.okToImport) process.exitCode = 2;
}

main();
