import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';

const parseSafeDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }
    const str = String(value).trim();
    if (!str) return null;

    const candidate = /^\d{4}-\d{2}-\d{2}$/.test(str)
        ? new Date(`${str}T00:00:00`)
        : new Date(str);

    return Number.isNaN(candidate.getTime()) ? null : candidate;
};

const formatDatePE = (value) => {
    const date = parseSafeDate(value);
    if (!date) return null;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Sub-componente: detalle de lotes de un producto ─────────────────────────
const LotesDetalle = ({ productoId, clienteId }) => {
    const [lotes, setLotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productService.getLotesByProduct(productoId, clienteId || null)
            .then(data => setLotes(data || []))
            .catch(() => setLotes([]))
            .finally(() => setLoading(false));
    }, [productoId, clienteId]);

    if (loading) {
        return (
            <tr>
                <td colSpan={10} className="px-6 py-3 bg-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Cargando lotes...
                    </div>
                </td>
            </tr>
        );
    }

    if (lotes.length === 0) {
        return (
            <tr>
                <td colSpan={10} className="px-8 py-3 bg-slate-50 text-xs text-slate-400 italic">
                    Sin lotes registrados.
                </td>
            </tr>
        );
    }

    const today = new Date();
    const getVencimientoStyle = (fecha) => {
        if (!fecha) return 'text-slate-400';
        const d = parseSafeDate(fecha);
        if (!d) return 'text-slate-400';
        const dias = Math.floor((d - today) / 86400000);
        if (dias < 0) return 'text-red-600 font-semibold';
        if (dias <= 30) return 'text-red-500';
        if (dias <= 90) return 'text-amber-500';
        return 'text-emerald-600';
    };

    return (
        <tr>
            <td colSpan={10} className="px-0 bg-gradient-to-r from-blue-50/80 to-slate-50 border-b border-blue-100">
                <div className="px-10 py-3">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            Desglose por lote ({lotes.length})
                        </span>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-blue-100 shadow-sm">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="px-4 py-2 text-left font-semibold">N° Lote</th>
                                    <th className="px-4 py-2 text-center font-semibold">Vencimiento</th>
                                    <th className="px-4 py-2 text-right font-semibold">Ingresado</th>
                                    <th className="px-4 py-2 text-right font-semibold">Disponible</th>
                                    <th className="px-4 py-2 text-right font-semibold">Consumido</th>
                                    <th className="px-4 py-2 text-center font-semibold">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {lotes.map((lote, i) => {
                                    const ingresado = Number(lote.cantidad_ingresada) || 0;
                                    const disponible = Number(lote.cantidad_disponible) || 0;
                                    const consumido = ingresado - disponible;
                                    const pct = ingresado > 0 ? Math.round((disponible / ingresado) * 100) : 0;
                                    const sinStock = disponible <= 0;
                                    return (
                                        <tr key={lote.id || i} className={sinStock ? 'bg-slate-50 opacity-60' : 'hover:bg-blue-50/30'}>
                                            <td className="px-4 py-2 font-mono text-slate-700 font-medium">
                                                {lote.numero_lote || '-'}
                                            </td>
                                            <td className={`px-4 py-2 text-center ${getVencimientoStyle(lote.fecha_vencimiento)}`}>
                                                {formatDatePE(lote.fecha_vencimiento) || <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-500">{ingresado.toFixed(2)}</td>
                                            <td className={`px-4 py-2 text-right font-semibold ${disponible > 0 ? 'text-emerald-600' : 'text-red-400'}`}>
                                                {disponible.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-right text-slate-400">{consumido.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-center">
                                                {sinStock ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                                        Agotado
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                            <div
                                                                className="bg-emerald-500 h-1.5 rounded-full"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-emerald-600 font-medium">{pct}%</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                <tr>
                                    <td className="px-4 py-2 text-xs font-semibold text-slate-600" colSpan={2}>
                                        TOTALES
                                    </td>
                                    <td className="px-4 py-2 text-right text-xs font-semibold text-slate-600">
                                        {lotes.reduce((s, l) => s + (Number(l.cantidad_ingresada) || 0), 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-right text-xs font-semibold text-emerald-600">
                                        {lotes.reduce((s, l) => s + (Number(l.cantidad_disponible) || 0), 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-right text-xs font-semibold text-slate-500">
                                        {lotes.reduce((s, l) => s + (Number(l.cantidad_ingresada) - Number(l.cantidad_disponible) || 0), 0).toFixed(2)}
                                    </td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </td>
        </tr>
    );
};

export const InventarioGeneral = () => {
    const [inventario, setInventario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteFiltro, setClienteFiltro] = useState('');
    const [stockFiltro, setStockFiltro] = useState('');
    const [vencimientoFiltro, setVencimientoFiltro] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());

    const normalizarRuc = (value) => String(value || '').replace(/\D/g, '');

    const obtenerNombreCliente = (producto) => {
        if (producto?.cliente_nombre) return producto.cliente_nombre;
        const ruc = normalizarRuc(producto?.cliente_ruc);
        if (!ruc) return '-';
        const cliente = clientes.find((c) => normalizarRuc(c?.cuit) === ruc);
        return cliente?.razon_social || '-';
    };

    const toggleRow = (productoId) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(productoId)) {
                next.delete(productoId);
            } else {
                next.add(productoId);
            }
            return next;
        });
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

    // ─── Filtrado cliente ──────────────────────────────────────────────────────
    const today = new Date();
    const inventarioFiltrado = inventario.filter(p => {
        // Filtro por estado de stock
        if (stockFiltro === 'con_stock' && p.stock_calculado <= 0) return false;
        if (stockFiltro === 'sin_stock' && p.stock_calculado > 0) return false;
        if (stockFiltro === 'stock_bajo' && !(p.stock_calculado > 0 && p.stock_calculado <= p.stock_minimo)) return false;
        if (stockFiltro === 'normal' && !(p.stock_calculado > p.stock_minimo)) return false;

        // Filtro por vencimiento
        if (vencimientoFiltro) {
            const fv = p.proximo_vencimiento ? new Date(p.proximo_vencimiento + 'T00:00:00') : null;
            const diasHastaVenc = fv ? Math.floor((fv - today) / 86400000) : null;
            if (vencimientoFiltro === 'vencido' && (diasHastaVenc === null || diasHastaVenc >= 0)) return false;
            if (vencimientoFiltro === 'prox30' && (diasHastaVenc === null || diasHastaVenc < 0 || diasHastaVenc > 30)) return false;
            if (vencimientoFiltro === 'prox90' && (diasHastaVenc === null || diasHastaVenc < 0 || diasHastaVenc > 90)) return false;
            if (vencimientoFiltro === 'sin_fecha' && fv !== null) return false;
        }
        return true;
    }).sort((a, b) => {
        if (!vencimientoFiltro) return 0;

        const fechaA = parseSafeDate(a.proximo_vencimiento);
        const fechaB = parseSafeDate(b.proximo_vencimiento);

        if (!fechaA && !fechaB) return 0;
        if (!fechaA) return 1;
        if (!fechaB) return -1;

        const diff = fechaA.getTime() - fechaB.getTime();

        // Para próximos 30/90 y vencidos: primero los más cercanos a hoy.
        if (vencimientoFiltro === 'prox30' || vencimientoFiltro === 'prox90' || vencimientoFiltro === 'vencido') {
            return diff;
        }

        return 0;
    });

    // Stats siempre sobre el total (no sobre el filtro)
    const totalProductos = inventario.length;
    const productosSinStock = inventario.filter(p => p.stock_calculado <= 0).length;
    const productosStockBajo = inventario.filter(p => p.stock_calculado > 0 && p.stock_calculado <= p.stock_minimo).length;
    const stockTotal = inventario.reduce((sum, p) => sum + p.stock_calculado, 0);
    const productosConStock = inventario.filter(p => p.stock_calculado > 0).length;

    const mapProductoToExcel = (p) => ({
        'Código': p.codigo || '-',
        'Descripción': p.descripcion,
        'Registro Sanitario': p.registro_sanitario || '-',
        'Proveedor': p.proveedor || '-',
        'Categoría': p.categoria_ingreso?.replace(/_/g, ' ') || '-',
        'Unidad': p.um || p.unidad || 'UND',
        'Lotes Activos': p.total_lotes || 0,
        'Próximo Vencimiento': p.proximo_vencimiento ? formatDatePE(p.proximo_vencimiento) : 'Sin lotes',
        'Stock Actual': Number(p.stock_calculado).toFixed(2),
        'Estado': getStockStatus(p.stock_calculado, p.stock_minimo).label
    });

    const exportarExcel = () => {
        if (inventario.length === 0) return;
        
        // Determinar qué base de datos usar (si hay búsqueda, usar filtrado, sino todo)
        const baseDatos = inventarioFiltrado.length > 0 ? inventarioFiltrado : inventario;
        
        // 1. Datos para cada hoja
        const dataGeneral = baseDatos.map(mapProductoToExcel);
        const dataConStock = baseDatos.filter(p => p.stock_calculado > p.stock_minimo).map(mapProductoToExcel);
        const dataStockBajo = baseDatos.filter(p => p.stock_calculado > 0 && p.stock_calculado <= p.stock_minimo).map(mapProductoToExcel);
        const dataSinStock = baseDatos.filter(p => p.stock_calculado <= 0).map(mapProductoToExcel);

        const wb = XLSX.utils.book_new();

        // 2. Función helper para agregar hoja con autofiltro
        const agregarHoja = (datos, nombre) => {
            if (datos.length === 0) return;
            const ws = XLSX.utils.json_to_sheet(datos);
            // Agregar Autofilter (flechitas de filtrado en excel) a todas las columnas usadas
            ws['!autofilter'] = { ref: `A1:J${datos.length + 1}` };
            XLSX.utils.book_append_sheet(wb, ws, nombre);
        };

        // 3. Crear las hojas separadas
        agregarHoja(dataGeneral, "General");
        agregarHoja(dataConStock, "Con Stock");
        agregarHoja(dataStockBajo, "Stock Bajo");
        agregarHoja(dataSinStock, "Sin Stock");

        // 4. Escribir y descargar el archivo
        XLSX.writeFile(wb, `Reporte_Stock_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 font-display">Stock de Inventario</h1>
                    <p className="text-slate-500 mt-1">Stock real calculado en tiempo real — se actualiza con cada Nota de Ingreso y Salida</p>
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
                                <p className="text-blue-100 text-sm font-medium">Total Productos</p>
                                <p className="text-4xl font-bold text-white mt-2">{totalProductos}</p>
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
                                <p className="text-4xl font-bold text-white mt-2">{productosStockBajo}</p>
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
                                <p className="text-4xl font-bold text-white mt-2">{productosSinStock}</p>
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
                                placeholder="Código, nombre, proveedor o fabricante..."
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
                                <option value="">Todos los productos</option>
                                <option value="con_stock">✅ Con Stock ({productosConStock})</option>
                                <option value="sin_stock">❌ Sin Stock ({productosSinStock})</option>
                                <option value="stock_bajo">⚠️ Stock Bajo ({productosStockBajo})</option>
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
                                Mostrando <strong className="text-slate-700">{inventarioFiltrado.length}</strong> de {totalProductos} productos
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
                            <p className="text-slate-500 mt-4">No se encontraron productos</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
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
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Lotes
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Próx. Vencimiento
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Stock Actual
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {inventarioFiltrado.map((producto) => {
                                        const status = getStockStatus(producto.stock_calculado, producto.stock_minimo);
                                        const isExpanded = expandedRows.has(producto.id);
                                        return (
                                            <React.Fragment key={producto.id}>
                                                <tr className={`transition-colors ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-medium text-slate-900">
                                                            {producto.codigo || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {producto.descripcion}
                                                        </div>
                                                        {producto.registro_sanitario && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                RS: {producto.registro_sanitario}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-slate-700">
                                                            {obtenerNombreCliente(producto)}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {producto.cliente_ruc || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">
                                                            {producto.proveedor || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-slate-600">
                                                            {producto.categoria_ingreso?.replace('_', ' ') || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-slate-600">
                                                            {producto.um || producto.unidad || 'UND'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {(producto.total_lotes || 0) > 0 ? (
                                                            <button
                                                                onClick={() => toggleRow(producto.id)}
                                                                title={isExpanded ? 'Ocultar desglose de lotes' : 'Ver desglose de lotes'}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                                                                    isExpanded
                                                                        ? 'bg-blue-600 text-white shadow-md'
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                                                                }`}
                                                            >
                                                                {producto.total_lotes}
                                                                <svg
                                                                    className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 text-xs">0</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {(() => {
                                                            const proximo = parseSafeDate(producto.proximo_vencimiento);
                                                            if (!proximo) {
                                                                return <span className="text-xs text-slate-400">Sin lotes</span>;
                                                            }
                                                            const now30 = new Date(Date.now() + 30 * 86400000);
                                                            const now90 = new Date(Date.now() + 90 * 86400000);
                                                            const colorClass = proximo < now30
                                                                ? 'bg-red-100 text-red-700'
                                                                : proximo < now90
                                                                    ? 'bg-amber-100 text-amber-700'
                                                                    : 'bg-green-100 text-green-700';
                                                            return (
                                                                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${colorClass}`}>
                                                                    {formatDatePE(proximo) || 'Sin lotes'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className={`text-sm font-semibold ${producto.stock_calculado <= 0
                                                            ? 'text-red-600'
                                                            : producto.stock_calculado <= producto.stock_minimo
                                                                ? 'text-amber-600'
                                                                : 'text-emerald-600'
                                                            }`}>
                                                            {producto.stock_calculado.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <Badge variant={status.variant}>{status.label}</Badge>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <LotesDetalle productoId={producto.id} clienteId={clienteFiltro ? Number(clienteFiltro) : null} />
                                                )}
                                            </React.Fragment>
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
