import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product.service';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';

export const InventarioGeneral = () => {
    const [inventario, setInventario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [activoFiltro, setActivoFiltro] = useState('');

    const loadInventario = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (busqueda) filters.busqueda = busqueda;
            if (categoriaFiltro) filters.categoria_ingreso = categoriaFiltro;
            if (activoFiltro) filters.activo = activoFiltro;

            const data = await productService.getInventario(filters);
            setInventario(data);
        } catch (error) {
            console.error('Error cargando inventario:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventario();
    }, [busqueda, categoriaFiltro, activoFiltro]);

    const getStockStatus = (stock, min) => {
        if (stock <= 0) return { label: 'Sin Stock', variant: 'anulado' };
        if (stock <= min) return { label: 'Stock Bajo', variant: 'observado' };
        return { label: 'Normal', variant: 'aprobado' };
    };

    const totalProductos = inventario.length;
    const productosSinStock = inventario.filter(p => p.stock_calculado <= 0).length;
    const productosStockBajo = inventario.filter(p => p.stock_calculado > 0 && p.stock_calculado <= p.stock_minimo).length;
    const stockTotal = inventario.reduce((sum, p) => sum + p.stock_calculado, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 font-display">Stock de Inventario</h1>
                    <p className="text-slate-500 mt-1">Stock real calculado en tiempo real — se actualiza con cada Nota de Ingreso y Salida</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Buscar Producto
                            </label>
                            <input
                                type="text"
                                placeholder="Código o descripción..."
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Categoría
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={categoriaFiltro}
                                onChange={(e) => setCategoriaFiltro(e.target.value)}
                            >
                                <option value="">Todas</option>
                                <option value="IMPORTACION">Importación</option>
                                <option value="COMPRA_LOCAL">Compra Local</option>
                                <option value="TRASLADO">Traslado</option>
                                <option value="DEVOLUCION">Devolución</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Estado
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={activoFiltro}
                                onChange={(e) => setActivoFiltro(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="true">Activos</option>
                                <option value="false">Inactivos</option>
                            </select>
                        </div>
                    </div>
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
                    ) : inventario.length === 0 ? (
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
                                    {inventario.map((producto) => {
                                        const status = getStockStatus(producto.stock_calculado, producto.stock_minimo);
                                        return (
                                            <tr key={producto.id} className="hover:bg-slate-50 transition-colors">
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
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                                                        {producto.total_lotes || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {producto.proximo_vencimiento ? (
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${new Date(producto.proximo_vencimiento) < new Date(Date.now() + 30 * 86400000)
                                                            ? 'bg-red-100 text-red-700'
                                                            : new Date(producto.proximo_vencimiento) < new Date(Date.now() + 90 * 86400000)
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {new Date(producto.proximo_vencimiento + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Sin lotes</span>
                                                    )}
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
