function formatCalendarDate(value, fallback = '-') {
    if (!value) return fallback;
    const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : fallback;
}

module.exports = { formatCalendarDate };
