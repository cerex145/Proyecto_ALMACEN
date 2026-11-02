function parseNumber(value, fallback = 0) {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
    let text = String(value).trim().replace(/\s/g, '');
    if (!/^[+-]?[\d.,]+$/.test(text)) return fallback;
    const comma = text.lastIndexOf(',');
    const dot = text.lastIndexOf('.');
    if (comma >= 0 && dot >= 0) {
        const decimal = comma > dot ? ',' : '.';
        const thousands = decimal === ',' ? '.' : ',';
        text = text.split(thousands).join('').replace(decimal, '.');
    } else if (comma >= 0) {
        if ((text.match(/,/g) || []).length > 1) {
            if (!/^[+-]?\d{1,3}(,\d{3})+$/.test(text)) return fallback;
            text = text.replace(/,/g, '');
        } else text = text.replace(',', '.');
    } else if ((text.match(/\./g) || []).length > 1) {
        if (!/^[+-]?\d{1,3}(\.\d{3})+$/.test(text)) return fallback;
        text = text.replace(/\./g, '');
    }
    const result = Number(text);
    return Number.isFinite(result) ? result : fallback;
}

function parseCSV(content) {
    const raw = String(content || '').replace(/^\uFEFF/, '');
    const first = raw.split(/\r?\n/, 1)[0] || '';
    const delimiter = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ',';
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < raw.length; i++) {
        const c = raw[i];
        if (c === '"') {
            if (quoted && raw[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
        } else if (c === delimiter && !quoted) { row.push(field.trim()); field = ''; }
        else if ((c === '\n' || c === '\r') && !quoted) {
            if (c === '\r' && raw[i + 1] === '\n') i++;
            row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
            row = []; field = '';
        } else field += c;
    }
    if (quoted) throw new Error('El CSV contiene comillas sin cerrar');
    row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
    return rows;
}

module.exports = { parseNumber, parseCSV };
