import React, { useState, useEffect, useRef } from 'react';
import { API_ORIGIN } from '../../services/api';

// ─── Constantes de empresa ──────────────────────────────────────────────────
const EMPRESA = {
    nombre: 'SISTEMA DE ALMACÉN',
    ruc: '',
    direccion: '',
    reporte: 'KARDEX — REGISTRO DE MOVIMIENTOS DE INVENTARIO',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

const fmtHora = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const tipoInfo = (tipo) => ({
    INGRESO: { label: 'INGRESO', color: '#16a34a', bg: '#dcfce7', icon: '▲' },
    SALIDA: { label: 'SALIDA', color: '#dc2626', bg: '#fee2e2', icon: '▼' },
    AJUSTE_POSITIVO: { label: 'AJ. (+)', color: '#0891b2', bg: '#e0f2fe', icon: '◆' },
    AJUSTE_NEGATIVO: { label: 'AJ. (−)', color: '#d97706', bg: '#fef3c7', icon: '◆' },
    AJUSTE_POR_RECEPCION: { label: 'AJ. REC.', color: '#7c3aed', bg: '#ede9fe', icon: '◈' },
}[tipo] || { label: tipo, color: '#6b7280', bg: '#f3f4f6', icon: '●' });

// ─── Componente principal ───────────────────────────────────────────────────
export const KardexFuncional = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const printRef = useRef(null);

    // Filtros
    const [filtroProducto, setFiltroProducto] = useState('');
    const [filtroLote, setFiltroLote] = useState('');
    const [filtroDocumento, setFiltroDocumento] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
    const [filtroCliente, setFiltroCliente] = useState('');

    // Stats
    const [stats, setStats] = useState({ ingresos: 0, salidas: 0, balance: 0, total: 0 });

    useEffect(() => {
        cargarClientes();
        cargarProveedores();
    }, []);

    useEffect(() => {
        cargarKardex();
    }, [filtroProducto, filtroLote, filtroDocumento, filtroTipo, filtroFechaDesde, filtroFechaHasta, filtroCliente]);

    const cargarClientes = async () => {
        try {
            const res = await fetch(`${API_ORIGIN}/api/clientes?limit=500&activo=true`);
            const d = await res.json();
            setClientes(d.data || []);
        } catch (e) { console.error(e); }
    };

    const cargarProveedores = async () => {
        try {
            const res = await fetch(`${API_ORIGIN}/api/ingresos?limit=500`);
            const d = await res.json();
            const set = new Set();
            (d.data || []).forEach(n => { if (n.proveedor) set.add(n.proveedor); });
            setProveedores([...set].sort());
        } catch (e) { console.error(e); }
    };

    const cargarKardex = async () => {
        try {
            setLoading(true);
            // Se sube el límite a 100,000 para traer todo el histórico y evitar discrepancias de suma.
            let url = `${API_ORIGIN}/api/kardex?limit=100000&order=ASC`;
            if (filtroProducto) url += `&producto_nombre=${encodeURIComponent(filtroProducto)}`;
            if (filtroLote) url += `&lote_numero=${encodeURIComponent(filtroLote)}`;
            if (filtroDocumento) url += `&documento_numero=${encodeURIComponent(filtroDocumento)}`;
            if (filtroTipo) url += `&tipo_movimiento=${filtroTipo}`;
            if (filtroFechaDesde) url += `&fecha_desde=${filtroFechaDesde}`;
            if (filtroFechaHasta) url += `&fecha_hasta=${filtroFechaHasta}`;
            if (filtroCliente) url += `&cliente_nombre=${encodeURIComponent(filtroCliente)}`;

            const res = await fetch(url);
            const result = await res.json();
            const data = result.data || [];
            setMovimientos(data);

            const ing = data.filter(m => ['INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION'].includes(m.tipo_movimiento));
            const sal = data.filter(m => ['SALIDA', 'AJUSTE_NEGATIVO'].includes(m.tipo_movimiento));
            const sumIng = ing.reduce((s, m) => s + Number(m.cantidad), 0);
            const sumSal = sal.reduce((s, m) => s + Number(m.cantidad), 0);
            setStats({ ingresos: sumIng, salidas: sumSal, balance: sumIng - sumSal, total: data.length });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const limpiar = () => {
        setFiltroProducto(''); setFiltroLote(''); setFiltroDocumento('');
        setFiltroTipo(''); setFiltroFechaDesde(''); setFiltroFechaHasta('');
        setFiltroCliente('');
    };

    const exportarExcel = () => {
        let url = `${API_ORIGIN}/api/kardex/exportar?`;
        if (filtroProducto) url += `&producto_nombre=${encodeURIComponent(filtroProducto)}`;
        if (filtroFechaDesde) url += `&fecha_desde=${filtroFechaDesde}`;
        if (filtroFechaHasta) url += `&fecha_hasta=${filtroFechaHasta}`;
        if (filtroCliente) url += `&cliente_nombre=${encodeURIComponent(filtroCliente)}`;
        window.open(url, '_blank');
    };

    const hayFiltrosActivos = filtroProducto || filtroLote || filtroDocumento || filtroTipo || filtroFechaDesde || filtroFechaHasta || filtroCliente;

    /* ── Estilos inline ─────────────────────────────────────────────────── */
    const s = {
        page: {
            padding: '0',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            background: '#f0f4f8',
            minHeight: '100vh',
        },
        /* Cabecera empresa */
        header: {
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0b6aa2 60%, #1a7abf 100%)',
            color: 'white',
            padding: '1.5rem 2rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        },
        headerLeft: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
        headerIcon: {
            width: 56, height: 56,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
            border: '2px solid rgba(255,255,255,0.3)',
        },
        headerTitle: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px', lineHeight: 1.1 },
        headerSub: { fontSize: '0.78rem', opacity: 0.75, marginTop: 4, fontWeight: 400 },
        headerRight: { textAlign: 'right', fontSize: '0.8rem', opacity: 0.8 },
        /* Toolbar */
        toolbar: {
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.75rem 2rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
        },
        /* Panel filtros */
        filterPanel: {
            background: 'white',
            margin: '1.25rem 1.5rem',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            overflow: 'hidden',
        },
        filterHeader: {
            background: 'linear-gradient(90deg,#1e3a5f,#0b6aa2)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.9rem', fontWeight: 600,
        },
        filterGrid: {
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1rem',
        },
        filterGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
        filterLabel: { fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
        filterInput: {
            padding: '0.5rem 0.75rem',
            border: '1.5px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.88rem',
            outline: 'none',
            transition: 'border-color 0.2s',
            background: '#f8fafc',
        },
        /* Stats */
        statsRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            margin: '0 1.5rem 1.25rem',
        },
        statCard: (color1, color2) => ({
            background: `linear-gradient(135deg, ${color1}, ${color2})`,
            color: 'white',
            padding: '1.1rem 1.3rem',
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }),
        statLabel: { fontSize: '0.78rem', opacity: 0.85, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px' },
        statValue: { fontSize: '1.7rem', fontWeight: 700, lineHeight: 1.1, margin: '4px 0 2px' },
        statSub: { fontSize: '0.72rem', opacity: 0.75 },
        /* Tabla wrapper */
        tableWrapper: {
            background: 'white',
            margin: '0 1.5rem 2rem',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            overflow: 'hidden',
        },
        tableHeaderBar: {
            background: 'linear-gradient(90deg,#1e3a5f,#0b6aa2)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.9rem', fontWeight: 600,
        },
        tableScroll: { overflowX: 'auto' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' },
        th: {
            background: '#1e3a5f',
            color: 'white',
            padding: '0.65rem 0.75rem',
            textAlign: 'left',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            whiteSpace: 'nowrap',
            borderRight: '1px solid rgba(255,255,255,0.1)',
        },
        thRight: {
            background: '#1e3a5f',
            color: 'white',
            padding: '0.65rem 0.75rem',
            textAlign: 'right',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            whiteSpace: 'nowrap',
            borderRight: '1px solid rgba(255,255,255,0.1)',
        },
        tdBase: {
            padding: '0.6rem 0.75rem',
            borderBottom: '1px solid #e2e8f0',
            verticalAlign: 'middle',
        },
        /* Badges */
        badge: (color, bg) => ({
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '0.2rem 0.55rem',
            borderRadius: 20,
            fontSize: '0.72rem', fontWeight: 700,
            color, background: bg,
            border: `1px solid ${color}33`,
        }),
        /* Botones */
        btn: (bg, fg = 'white') => ({
            padding: '0.45rem 1rem',
            borderRadius: 8, border: 'none',
            background: bg, color: fg,
            fontWeight: 600, fontSize: '0.83rem',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'opacity 0.15s',
        }),
    };

    const esIngreso = (tipo) => ['INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION'].includes(tipo);

    return (
        <div style={s.page}>

            {/* ── CABECERA EMPRESA ─────────────────────────────────────────── */}
            <div style={s.header}>
                <div style={s.headerLeft}>
                    <div style={s.headerIcon}>📦</div>
                    <div>
                        <div style={s.headerTitle}>{EMPRESA.nombre}</div>
                        <div style={s.headerSub}>{EMPRESA.reporte}</div>
                    </div>
                </div>
                <div style={s.headerRight}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.95 }}>
                        {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ marginTop: 4 }}>
                        {movimientos.length} movimientos registrados
                    </div>
                </div>
            </div>

            {/* ── TOOLBAR ──────────────────────────────────────────────────── */}
            <div style={s.toolbar}>
                <button style={s.btn('#16a34a')} onClick={exportarExcel}>
                    📥 Exportar Excel
                </button>
                {hayFiltrosActivos && (
                    <button style={s.btn('#dc2626')} onClick={limpiar}>
                        ✕ Limpiar filtros
                    </button>
                )}
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b' }}>
                    {hayFiltrosActivos
                        ? `Mostrando ${movimientos.length} resultado(s) filtrados`
                        : `Total: ${movimientos.length} movimientos`}
                </span>
            </div>

            {/* ── FILTROS ──────────────────────────────────────────────────── */}
            <div style={s.filterPanel}>
                <div style={s.filterHeader}>
                    <span>🔍 Filtros de búsqueda</span>
                    {hayFiltrosActivos && (
                        <span style={{ background: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem' }}>
                            FILTROS ACTIVOS
                        </span>
                    )}
                </div>
                <div style={s.filterGrid}>
                    {/* Producto */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>📦 Producto</label>
                        <input
                            style={s.filterInput}
                            type="text"
                            placeholder="Nombre o código..."
                            value={filtroProducto}
                            onChange={e => setFiltroProducto(e.target.value)}
                        />
                    </div>

                    {/* Tipo movimiento */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>↕ Tipo movimiento</label>
                        <select
                            style={s.filterInput}
                            value={filtroTipo}
                            onChange={e => setFiltroTipo(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="INGRESO">Ingreso</option>
                            <option value="SALIDA">Salida</option>
                            <option value="AJUSTE_POSITIVO">Ajuste Positivo</option>
                            <option value="AJUSTE_NEGATIVO">Ajuste Negativo</option>
                            <option value="AJUSTE_POR_RECEPCION">Ajuste por Recepción</option>
                        </select>
                    </div>

                    {/* Fecha desde */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>📅 Fecha desde</label>
                        <input
                            style={s.filterInput}
                            type="date"
                            value={filtroFechaDesde}
                            onChange={e => setFiltroFechaDesde(e.target.value)}
                        />
                    </div>

                    {/* Fecha hasta */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>📅 Fecha hasta</label>
                        <input
                            style={s.filterInput}
                            type="date"
                            value={filtroFechaHasta}
                            onChange={e => setFiltroFechaHasta(e.target.value)}
                        />
                    </div>

                    {/* Cliente / Proveedor */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>🏢 Cliente / Proveedor</label>
                        <select
                            style={s.filterInput}
                            value={filtroCliente}
                            onChange={e => setFiltroCliente(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {clientes.length > 0 && (
                                <optgroup label="— Clientes —">
                                    {clientes.map(c => (
                                        <option key={`c-${c.id}`} value={c.razon_social}>{c.razon_social}</option>
                                    ))}
                                </optgroup>
                            )}
                            {proveedores.filter(p => !clientes.some(c => c.razon_social === p)).length > 0 && (
                                <optgroup label="— Proveedores —">
                                    {proveedores
                                        .filter(p => !clientes.some(c => c.razon_social === p))
                                        .map((p, i) => <option key={`p-${i}`} value={p}>{p}</option>)}
                                </optgroup>
                            )}
                        </select>
                    </div>

                    {/* Lote */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>🏷 Lote</label>
                        <input
                            style={s.filterInput}
                            type="text"
                            placeholder="Número de lote..."
                            value={filtroLote}
                            onChange={e => setFiltroLote(e.target.value)}
                        />
                    </div>

                    {/* Documento */}
                    <div style={s.filterGroup}>
                        <label style={s.filterLabel}>📄 N° Documento</label>
                        <input
                            style={s.filterInput}
                            type="text"
                            placeholder="Número de documento..."
                            value={filtroDocumento}
                            onChange={e => setFiltroDocumento(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── STATS ────────────────────────────────────────────────────── */}
            <div style={s.statsRow}>
                <div style={s.statCard('#16a34a', '#15803d')}>
                    <div style={s.statLabel}>▲ Total Ingresos</div>
                    <div style={s.statValue}>{stats.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                    <div style={s.statSub}>unidades ingresadas</div>
                </div>
                <div style={s.statCard('#dc2626', '#b91c1c')}>
                    <div style={s.statLabel}>▼ Total Salidas</div>
                    <div style={s.statValue}>{stats.salidas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                    <div style={s.statSub}>unidades despachadas</div>
                </div>
                <div style={s.statCard('#0b6aa2', '#075985')}>
                    <div style={s.statLabel}>◆ Balance Neto</div>
                    <div style={s.statValue}>{stats.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                    <div style={s.statSub}>stock resultante</div>
                </div>
                <div style={s.statCard('#7c3aed', '#6d28d9')}>
                    <div style={s.statLabel}>≡ Movimientos</div>
                    <div style={s.statValue}>{stats.total}</div>
                    <div style={s.statSub}>registros totales</div>
                </div>
            </div>

            {/* ── TABLA ────────────────────────────────────────────────────── */}
            <div style={s.tableWrapper}>
                <div style={s.tableHeaderBar}>
                    <span>📋 Detalle de Movimientos</span>
                    <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                        {filtroFechaDesde || filtroFechaHasta
                            ? `Período: ${filtroFechaDesde || '···'} → ${filtroFechaHasta || '···'}`
                            : 'Todos los períodos'}
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
                        <div>Cargando movimientos...</div>
                    </div>
                ) : movimientos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>Sin resultados</div>
                        <div style={{ fontSize: '0.85rem' }}>No hay movimientos con los filtros seleccionados.</div>
                    </div>
                ) : (
                    <div style={s.tableScroll}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>#</th>
                                    <th style={s.th}>Fecha</th>
                                    <th style={s.th}>Tipo</th>
                                    <th style={s.th}>Código</th>
                                    <th style={{ ...s.th, minWidth: 200 }}>Producto</th>
                                    <th style={s.th}>Lote</th>
                                    <th style={s.th}>Documento</th>
                                    <th style={s.th}>N° Doc.</th>
                                    <th style={s.thRight}>Ingreso</th>
                                    <th style={s.thRight}>Salida</th>
                                    <th style={s.thRight}>Saldo</th>
                                    <th style={s.th}>UM</th>
                                    <th style={{ ...s.th, minWidth: 200 }}>Proveedor / Cliente</th>
                                    <th style={{ ...s.th, minWidth: 160 }}>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.map((mov, idx) => {
                                    const ti = tipoInfo(mov.tipo_movimiento);
                                    const isIng = esIngreso(mov.tipo_movimiento);
                                    const rowBg = idx % 2 === 0 ? 'white' : '#f8fafc';

                                    return (
                                        <tr key={mov.id || idx} style={{ background: rowBg }}>
                                            {/* # */}
                                            <td style={{ ...s.tdBase, color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>
                                                {idx + 1}
                                            </td>

                                            {/* Fecha */}
                                            <td style={{ ...s.tdBase, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                                                {isIng
                                                    ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(mov.fecha_ingreso || mov.created_at)}</span>
                                                    : <span style={{ color: '#dc2626', fontWeight: 600 }}>{fmt(mov.fecha_salida || mov.created_at)}</span>
                                                }
                                            </td>

                                            {/* Tipo */}
                                            <td style={s.tdBase}>
                                                <span style={s.badge(ti.color, ti.bg)}>
                                                    {ti.icon} {ti.label}
                                                </span>
                                            </td>

                                            {/* Código */}
                                            <td style={s.tdBase}>
                                                <span style={{
                                                    background: '#dbeafe', color: '#1d4ed8',
                                                    padding: '0.2rem 0.5rem', borderRadius: 6,
                                                    fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap'
                                                }}>
                                                    {mov.producto?.codigo || '—'}
                                                </span>
                                            </td>

                                            {/* Producto */}
                                            <td style={{ ...s.tdBase, maxWidth: 240 }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.83rem', color: '#1e293b' }}>
                                                    {mov.producto?.descripcion || '—'}
                                                </span>
                                            </td>

                                            {/* Lote */}
                                            <td style={s.tdBase}>
                                                {mov.lote_numero && mov.lote_numero !== 'N/A'
                                                    ? <span style={{ background: '#fef9c3', color: '#713f12', padding: '0.2rem 0.5rem', borderRadius: 5, fontSize: '0.78rem', fontWeight: 600 }}>{mov.lote_numero}</span>
                                                    : <span style={{ color: '#cbd5e1' }}>—</span>
                                                }
                                            </td>

                                            {/* Tipo documento */}
                                            <td style={{ ...s.tdBase, fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {mov.documento_tipo || '—'}
                                            </td>

                                            {/* N° documento */}
                                            <td style={{ ...s.tdBase, fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', color: '#334155' }}>
                                                {mov.documento_numero || '—'}
                                            </td>

                                            {/* Ingreso */}
                                            <td style={{ ...s.tdBase, textAlign: 'right', fontWeight: 700, color: isIng ? '#16a34a' : '#cbd5e1', fontSize: '0.9rem' }}>
                                                {isIng ? Number(mov.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
                                            </td>

                                            {/* Salida */}
                                            <td style={{ ...s.tdBase, textAlign: 'right', fontWeight: 700, color: !isIng ? '#dc2626' : '#cbd5e1', fontSize: '0.9rem' }}>
                                                {!isIng ? Number(mov.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '—'}
                                            </td>

                                            {/* Saldo */}
                                            <td style={{
                                                ...s.tdBase, textAlign: 'right', fontWeight: 800, fontSize: '0.9rem',
                                                color: Number(mov.saldo) > 0 ? '#15803d' : '#b91c1c',
                                                background: Number(mov.saldo) > 0 ? '#f0fdf4' : '#fff1f2',
                                                borderLeft: `3px solid ${Number(mov.saldo) > 0 ? '#16a34a' : '#dc2626'}`,
                                            }}>
                                                {Number(mov.saldo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* UM */}
                                            <td style={{ ...s.tdBase, textAlign: 'center', fontSize: '0.77rem', color: '#64748b', fontWeight: 600 }}>
                                                {mov.unidad_medida || 'UND'}
                                            </td>

                                            {/* Proveedor / Cliente ← COLUMNA CLAVE */}
                                            <td style={{ ...s.tdBase, maxWidth: 220 }}>
                                                {mov.cliente_nombre && mov.cliente_nombre !== 'N/A' && mov.cliente_nombre !== '-' ? (
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                        <span style={{
                                                            fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.35rem',
                                                            borderRadius: 4,
                                                            color: isIng ? '#0369a1' : '#b45309',
                                                            background: isIng ? '#e0f2fe' : '#fef3c7',
                                                            whiteSpace: 'nowrap', marginTop: 1,
                                                        }}>
                                                            {isIng ? 'PROV.' : 'CLIE.'}
                                                        </span>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
                                                            {mov.cliente_nombre}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                                )}
                                            </td>

                                            {/* Observaciones */}
                                            <td style={{ ...s.tdBase, fontSize: '0.78rem', color: '#64748b', maxWidth: 180 }}>
                                                {mov.observaciones && mov.observaciones !== '-' ? mov.observaciones : <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* ── Fila de totales ── */}
                            <tfoot>
                                <tr style={{ background: '#1e3a5f', color: 'white' }}>
                                    <td colSpan="8" style={{ padding: '0.7rem 0.75rem', fontWeight: 700, fontSize: '0.85rem' }}>
                                        TOTALES ({movimientos.length} movimientos)
                                    </td>
                                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#86efac', fontSize: '0.9rem' }}>
                                        {stats.ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#fca5a5', fontSize: '0.9rem' }}>
                                        {stats.salidas.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '0.7rem 0.75rem', textAlign: 'right', fontWeight: 800, color: '#93c5fd', fontSize: '0.9rem' }}>
                                        {stats.balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td colSpan="3" />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
