import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';

const MS_PER_DAY = 86400000;

const getStartOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const parseSafeDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;
        return getStartOfDay(value);
    }
    const str = String(value).trim();
    if (!str) return null;

    const dateOnlyMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const candidate = dateOnlyMatch
        ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
        : new Date(str);

    if (Number.isNaN(candidate.getTime())) return null;
    return getStartOfDay(candidate);
};

const getDaysUntil = (value, baseDate = new Date()) => {
    const target = parseSafeDate(value);
    if (!target) return null;
    const base = getStartOfDay(baseDate);
    return Math.floor((target.getTime() - base.getTime()) / MS_PER_DAY);
};

const formatDatePE = (value) => {
    const date = parseSafeDate(value);
    if (!date) return null;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Aplanar la lista de productos: cada producto con N lotes genera N filas.
 * Si un producto no tiene lotes, genera 1 fila con lote vacío.
 */
const aplanarPorLote = (productos) => {
    const filas = [];
    for (const p of productos) {
        const lotes = Array.isArray(p.lotes) && p.lotes.length > 0 ? p.lotes : null;
        if (!lotes) {
            // Sin lotes: una sola fila
            filas.push({
                ...p,
                _lote_numero: null,
                _lote_vencimiento: p.proximo_vencimiento || null,
                _lote_ingresado: null,
                _lote_disponible: p.stock_calculado,
                _rowKey: `${p.id}-sinlote`,
            });
        } else {
            // Con lotes: una fila por cada lote
            const sortedLotes = [...lotes].sort((a, b) => {
                const d1 = parseSafeDate(a.fecha_vencimiento);
                const d2 = parseSafeDate(b.fecha_vencimiento);
                if (!d1 && !d2) return 0;
                if (!d1) return 1;
                if (!d2) return -1;
                return d1.getTime() - d2.getTime();
            });
            sortedLotes.forEach((lote, idx) => {
                const disponible = Number(lote.cantidad_disponible) || 0;
                filas.push({
                    ...p,
                    // Sobreescribir stock con el del lote individual
                    stock_calculado: disponible,
                    _lote_numero: lote.numero_lote || null,
                    _lote_vencimiento: lote.fecha_vencimiento || null,
                    _lote_ingresado: Number(lote.cantidad_ingresada) || 0,
                    _lote_disponible: disponible,
                    _rowKey: `${p.id}-lote-${idx}`,
                });
            });
        }
    }
    return filas;
};

export const InventarioGeneral = () => {
    const [inventario, setInventario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteFiltro, setClienteFiltro] = useState('');
    const [stockFiltro, setStockFiltro] = useState('');
    const [vencimientoFiltro, setVencimientoFiltro] = useState('');

    const normalizarRuc = (value) => String(value || '').replace(/\D/g, '');

    const obtenerNombreCliente = (producto) => {
        if (producto?.cliente_nombre) return producto.cliente_nombre;
        const ruc = normalizarRuc(producto?.cliente_ruc);
        if (!ruc) return '-';
        const cliente = clientes.find((c) => normalizarRuc(c?.cuit) === ruc);
        return cliente?.razon_social || '-';
    };

    useEffect(() => {
        const cargarClientes = async () => {
            try {
                const response = await clientesService.listar({ limit: 1000, activo: 'true' });
                setClientes(response?.data || []);
            } catch {
                setClientes([]);
            }
        };
        cargarClientes();
    }, []);

    const loadInventario = async () => {
        try {
            setLoading(true);
            const filtros = { busqueda };
            if (clienteFiltro) {
                const clienteIdNum = Number(clienteFiltro);
                const clienteSel = clientes.find((c) => Number(c.id) === clienteIdNum);
                filtros.cliente_id = clienteIdNum;
                if (clienteSel?.razon_social) {
                    filtros.cliente_nombre = clienteSel.razon_social;
                }
            }
            const data = await productService.getInventario(filtros);
            setInventario(data);
        } catch (error) {
            console.error('Error cargando inventario:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadInventario(); }, [busqueda, clienteFiltro, clientes]);

    const getStockStatus = (stock, min) => {
        if (stock <= 0) return { label: 'Sin Stock', variant: 'anulado' };
        if (stock <= min) return { label: 'Stock Bajo', variant: 'observado' };
        return { label: 'Normal', variant: 'aprobado' };
    };

    // ─── Aplanar inventario ──────────────────────────────────────────────────
    const today = getStartOfDay();

    // Primero aplanamos TODO el inventario para calcular stats correctamente
    const inventarioAplanado = aplanarPorLote(inventario);
    const busquedaNormalizada = busqueda.trim().toLowerCase();

    // Filtrado sobre la lista aplanada
    const inventarioFiltrado = inventarioAplanado.filter(p => {
        if (busquedaNormalizada) {
            const camposBusqueda = [
                p.codigo,
                p.descripcion,
                p.proveedor,
                p.cliente_nombre,
                p.cliente_ruc,
                p.registro_sanitario,
                p.categoria_ingreso,
                p.um,
                p.unidad,
                p._lote_numero
            ];

            const coincideTexto = camposBusqueda.some((campo) =>
                String(campo || '').toLowerCase().includes(busquedaNormalizada)
            );

            if (!coincideTexto) return false;
        }

        // Filtro por estado de stock (usamos _lote_disponible)
        const disp = p._lote_disponible;
        if (stockFiltro === 'con_stock' && disp <= 0) return false;
        if (stockFiltro === 'sin_stock' && disp > 0) return false;
        if (stockFiltro === 'stock_bajo' && !(disp > 0 && disp <= p.stock_minimo)) return false;
        if (stockFiltro === 'normal' && !(disp > p.stock_minimo)) return false;

        // Filtro por vencimiento
        if (vencimientoFiltro) {
            const fv = parseSafeDate(p._lote_vencimiento);
            const diasHastaVenc = getDaysUntil(fv, today);

            if (vencimientoFiltro === 'vencido') {
                if (diasHastaVenc === null || diasHastaVenc >= 0) return false;
            } else if (vencimientoFiltro === 'prox30') {
                if (diasHastaVenc === null || diasHastaVenc < 0 || diasHastaVenc > 30) return false;
            } else if (vencimientoFiltro === 'prox90') {
                if (diasHastaVenc === null || diasHastaVenc < 0 || diasHastaVenc > 90) return false;
            } else if (vencimientoFiltro === 'sin_fecha') {
                if (fv !== null) return false;
            }
        }
        return true;
    }).sort((a, b) => {
        if (!vencimientoFiltro) return 0;
        const fechaA = parseSafeDate(a._lote_vencimiento);
        const fechaB = parseSafeDate(b._lote_vencimiento);
        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;
        return fechaA.getTime() - fechaB.getTime();
    });

    // Stats sobre inventario aplanado total
    const totalFilas = inventarioAplanado.length;
    const filasSinStock = inventarioAplanado.filter(p => p._lote_disponible <= 0).length;
    const filasStockBajo = inventarioAplanado.filter(p => p._lote_disponible > 0 && p._lote_disponible <= p.stock_minimo).length;
    const stockTotal = inventarioAplanado.reduce((sum, p) => sum + (p._lote_disponible || 0), 0);
    const filasConStock = inventarioAplanado.filter(p => p._lote_disponible > 0).length;

    // ─── Exportar Excel ──────────────────────────────────────────────────────
    const exportarExcel = () => {
        if (inventarioFiltrado.length === 0) return;

        const toExcelRows = (filas) => filas.map(p => ({
            'Código': p.codigo || '-',
            'Descripción': p.descripcion,
            'Registro Sanitario': p.registro_sanitario || '-',
            'Proveedor': p.proveedor || '-',
            'Categoría': p.categoria_ingreso?.replace(/_/g, ' ') || '-',
            'Unidad': p.um || p.unidad || 'UND',
            'N° Lote': p._lote_numero || '-',
            'Vencimiento': p._lote_vencimiento ? formatDatePE(p._lote_vencimiento) : 'Sin fecha',
            'Ingresado': p._lote_ingresado != null ? Number(p._lote_ingresado).toFixed(2) : '-',
            'Disponible': Number(p._lote_disponible || 0).toFixed(2),
            'Estado': getStockStatus(p._lote_disponible, p.stock_minimo).label
        }));

        const baseDatos = inventarioFiltrado;
        const dataGeneral = toExcelRows(baseDatos);
        const dataConStock = toExcelRows(baseDatos.filter(p => p._lote_disponible > p.stock_minimo));
        const dataStockBajo = toExcelRows(baseDatos.filter(p => p._lote_disponible > 0 && p._lote_disponible <= p.stock_minimo));
        const dataSinStock = toExcelRows(baseDatos.filter(p => p._lote_disponible <= 0));

        const wb = XLSX.utils.book_new();
        const agregarHoja = (datos, nombre) => {
            if (datos.length === 0) return;
            const ws = XLSX.utils.json_to_sheet(datos);
            ws['!autofilter'] = { ref: `A1:K${datos.length + 1}` };
            XLSX.utils.book_append_sheet(wb, ws, nombre);
        };

        agregarHoja(dataGeneral, 'General');
        agregarHoja(dataConStock, 'Con Stock');
        agregarHoja(dataStockBajo, 'Stock Bajo');
        agregarHoja(dataSinStock, 'Sin Stock');

        XLSX.writeFile(wb, `Reporte_Stock_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 font-display">Stock de Inventario</h1>
                    <p className="text-slate-500 mt-1">Stock real calculado en tiempo real — cada lote se muestra como una fila independiente</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportarExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors text-sm font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportar a Excel
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Registros</p>
                                <p className="text-4xl font-bold text-white mt-2">{totalFilas}</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">Stock Total</p>
                                <p className="text-4xl font-bold text-white mt-2">{stockTotal.toFixed(2)}</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Stock Bajo</p>
                                <p className="text-4xl font-bold text-white mt-2">{filasStockBajo}</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Sin Stock</p>
                                <p className="text-4xl font-bold text-white mt-2">{filasSinStock}</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-3">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Búsqueda */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                🔍 Buscar Producto
                            </label>
                            <input
                                type="text"
                                placeholder="Código, nombre, proveedor, cliente o lote..."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        {/* Estado de Stock */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                📦 Estado de Stock
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={stockFiltro}
                                onChange={(e) => setStockFiltro(e.target.value)}
                            >
                                <option value="">Todos los registros</option>
                                <option value="con_stock">✅ Con Stock ({filasConStock})</option>
                                <option value="sin_stock">❌ Sin Stock ({filasSinStock})</option>
                                <option value="stock_bajo">⚠️ Stock Bajo ({filasStockBajo})</option>
                                <option value="normal">🟢 Stock Normal</option>
                            </select>
                        </div>

                        {/* Vencimiento */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                📅 Vencimiento
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={vencimientoFiltro}
                                onChange={(e) => setVencimientoFiltro(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="vencido">🔴 Vencidos</option>
                                <option value="prox30">🟠 Próximos 30 días</option>
                                <option value="prox90">🟡 Próximos 90 días</option>
                                <option value="sin_fecha">⬜ Sin fecha registrada</option>
                            </select>
                        </div>

                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Cliente
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={clienteFiltro}
                                onChange={(e) => setClienteFiltro(e.target.value)}
                            >
                                <option value="">Todos los clientes</option>
                                {clientes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {(c.razon_social || c.nombre || 'Cliente')} {c.cuit ? `- ${c.cuit}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Resultados visibles + botón reset */}
                    {(stockFiltro || vencimientoFiltro || clienteFiltro) && (
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Mostrando <strong className="text-slate-700">{inventarioFiltrado.length}</strong> de {totalFilas} registros
                            </span>
                            <button
                                onClick={() => { setStockFiltro(''); setVencimientoFiltro(''); setClienteFiltro(''); }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabla de Inventario */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 mt-4">Cargando inventario...</p>
                        </div>
                    ) : inventarioFiltrado.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-slate-500 mt-4">No se encontraron registros</p>
                        </div>
                    ) : (
                        <div className="table-scroll-top">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Proveedor
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Unidad
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            N° Lote
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Vencimiento
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Disponible
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {inventarioFiltrado.map((fila) => {
                                        const disp = fila._lote_disponible;
                                        const status = getStockStatus(disp, fila.stock_minimo);
                                        const vencFecha = parseSafeDate(fila._lote_vencimiento);
                                        const diasHasta = getDaysUntil(vencFecha, today);

                                        const vencimientoColorClass = vencFecha
                                            ? (diasHasta < 0 || diasHasta <= 30
                                                ? 'bg-red-100 text-red-700'
                                                : diasHasta <= 90
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700')
                                            : '';

                                        return (
                                            <tr key={fila._rowKey} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {fila.codigo || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {fila.descripcion}
                                                    </div>
                                                    {fila.registro_sanitario && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            RS: {fila.registro_sanitario}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-700">
                                                        {obtenerNombreCliente(fila)}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {fila.cliente_ruc || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">
                                                        {fila.proveedor || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-600">
                                                        {fila.categoria_ingreso?.replace('_', ' ') || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-600">
                                                        {fila.um || fila.unidad || 'UND'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {fila._lote_numero ? (
                                                        <span className="font-mono text-sm text-slate-700 font-medium">
                                                            {fila._lote_numero}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Sin lote</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {vencFecha ? (
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${vencimientoColorClass}`}>
                                                            {formatDatePE(vencFecha)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Sin fecha</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`text-sm font-semibold ${disp <= 0
                                                        ? 'text-red-600'
                                                        : disp <= fila.stock_minimo
                                                            ? 'text-amber-600'
                                                            : 'text-emerald-600'
                                                        }`}>
                                                        {Number(disp || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Badge variant={status.variant}>{status.label}</Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default InventarioGeneral;
