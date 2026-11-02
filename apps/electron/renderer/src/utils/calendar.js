export function parseCalendarDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    if (!match) return new Date(value);
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
    if (date.getFullYear() !== Number(match[1]) || date.getMonth() + 1 !== Number(match[2]) || date.getDate() !== Number(match[3])) return new Date(NaN);
    return date;
}

export function formatCalendarDate(value, fallback = '-') {
    if (!value) return fallback;
    const date = parseCalendarDate(value);
    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString('es-PE');
}

export const todayCalendarDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
