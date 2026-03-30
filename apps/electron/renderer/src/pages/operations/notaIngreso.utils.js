export const detectarDelimitadorCSV = (line) => {
    const raw = String(line || '');
    const comas = (raw.match(/,/g) || []).length;
    const puntosComa = (raw.match(/;/g) || []).length;
    return puntosComa > comas ? ';' : ',';
};

export const parseCSVLine = (line, delimiter = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];

        if (char === '"') {
            const next = line[i + 1];
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
};

export const parseCSVDocument = (content) => {
    const raw = String(content || '').replace(/^\uFEFF/, '');
    const firstLine = raw.split(/\r?\n/, 1)[0] || '';
    const delimiter = detectarDelimitadorCSV(firstLine);

    const rows = [];
    let row = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < raw.length; i += 1) {
        const char = raw[i];
        const next = raw[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === delimiter && !inQuotes) {
            row.push(current.trim());
            current = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') {
                i += 1;
            }

            row.push(current.trim());
            current = '';

            if (row.some((cell) => String(cell || '').trim() !== '')) {
                rows.push(row);
            }

            row = [];
            continue;
        }

        current += char;
    }

    row.push(current.trim());
    if (row.some((cell) => String(cell || '').trim() !== '')) {
        rows.push(row);
    }

    return { delimiter, rows };
};

export const parseNumber = (value, fallback = 0) => {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const normalized = String(value).replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizarFechaInput = (value) => {
    if (!value) return '';

    const raw = String(value).trim();
    if (!raw) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const matchDMY = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (matchDMY) {
        const day = Number(matchDMY[1]);
        const month = Number(matchDMY[2]);
        const year = Number(matchDMY[3]);

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const normalizarTexto = (value) => String(value || '').trim().toLowerCase();

export const normalizarCodigoProducto = (value) => normalizarTexto(value).replace(/\s+/g, ' ');

export const normalizarRuc = (value) => String(value || '').replace(/[^0-9]/g, '').trim();

export const esRucValido = (value) => normalizarRuc(value).length === 11;

export const obtenerCodigosProducto = (producto) => {
    const codigos = [
        producto?.codigo,
        producto?.codigo_producto,
        producto?.producto_codigo,
        producto?.sku,
        producto?.codigo_interno
    ]
        .map((v) => String(v || '').trim())
        .filter(Boolean);

    const codigosBase = codigos
        .map((codigo) => codigo.split(/\s+/)[0])
        .filter(Boolean);

    return [...new Set([...codigos, ...codigosBase])];
};

export const coincideCodigoProducto = (producto, codigoBuscadoRaw) => {
    const codigoBuscado = normalizarCodigoProducto(codigoBuscadoRaw);
    if (!codigoBuscado) return false;

    return obtenerCodigosProducto(producto).some((codigo) => {
        const normalizado = normalizarCodigoProducto(codigo);
        return normalizado === codigoBuscado
            || normalizado.startsWith(`${codigoBuscado} `)
            || codigoBuscado.startsWith(`${normalizado} `);
    });
};

export const obtenerLoteProducto = (producto) => String(
    producto?.lote
    || producto?.numero_lote
    || producto?.lote_numero
    || ''
);

export const buildDetalleCalculo = ({
    cantidad_bultos = 0,
    cantidad_cajas = 0,
    cantidad_por_caja = 0,
    cantidad_fraccion = 0
}) => `Bultos: ${cantidad_bultos || 0}, Cajas: ${cantidad_cajas || 0}, Und/Caja: ${cantidad_por_caja || 0}, Frac: ${cantidad_fraccion || 0}`;

export const getProductFilters = ({ showAllProducts, selectedClient, selectedClientRuc, limit = 5000, extra = {} }) => {
    const filters = {
        page: 1,
        limit,
        ...extra
    };

    if (!showAllProducts) {
        if (!selectedClient) {
            return null;
        }

        if (selectedClientRuc) {
            filters.cliente_ruc = selectedClientRuc;
        } else {
            filters.cliente_id = Number(selectedClient);
        }
    }

    return filters;
};
