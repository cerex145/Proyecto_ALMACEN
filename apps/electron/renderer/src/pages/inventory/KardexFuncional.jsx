import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const KardexFuncional = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filtros mejorados
    const [filtroProducto, setFiltroProducto] = useState('');
    const [filtroLote, setFiltroLote] = useState('');
    const [filtroDocumento, setFiltroDocumento] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
    const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

    // Estadísticas
    const [stats, setStats] = useState({
        totalIngresos: 0,
        totalSalidas: 0,
        cantidadIngresos: 0,
        cantidadSalidas: 0
    });

    useEffect(() => {
        cargarKardex();
    }, [filtroProducto, filtroLote, filtroDocumento, filtroTipo, filtroFechaDesde, filtroFechaHasta]);

    const cargarKardex = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:3000/api/kardex?limit=1000';
            
            if (filtroProducto) url += `&producto_nombre=${encodeURIComponent(filtroProducto)}`;
            if (filtroLote) url += `&lote_numero=${encodeURIComponent(filtroLote)}`;
            if (filtroDocumento) url += `&documento_numero=${encodeURIComponent(filtroDocumento)}`;
            if (filtroTipo) url += `&tipo_movimiento=${filtroTipo}`;
            if (filtroFechaDesde) url += `&fecha_desde=${filtroFechaDesde}`;
            if (filtroFechaHasta) url += `&fecha_hasta=${filtroFechaHasta}`;
            
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data || [];

            setMovimientos(data);

            // Calcular estadísticas
            const ingresos = data.filter(m => 
                m.tipo_movimiento === 'INGRESO' || 
                m.tipo_movimiento === 'AJUSTE_POSITIVO' || 
                m.tipo_movimiento === 'AJUSTE_POR_RECEPCION'
            );
            const salidas = data.filter(m => 
                m.tipo_movimiento === 'SALIDA' || 
                m.tipo_movimiento === 'AJUSTE_NEGATIVO'
            );

            setStats({
                totalIngresos: ingresos.reduce((sum, m) => sum + Number(m.cantidad), 0),
                totalSalidas: salidas.reduce((sum, m) => sum + Number(m.cantidad), 0),
                cantidadIngresos: ingresos.length,
                cantidadSalidas: salidas.length
            });
        } catch (error) {
            console.error('Error al cargar kardex:', error);
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setFiltroProducto('');
        setFiltroLote('');
        setFiltroDocumento('');
        setFiltroTipo('');
        setFiltroFechaDesde('');
        setFiltroFechaHasta('');
    };

    const getTipoMovimientoInfo = (tipo) => {
        const tipos = {
            'INGRESO': { label: 'Ingreso', variant: 'aprobado', color: '#28a745' },
            'SALIDA': { label: 'Salida', variant: 'anulado', color: '#dc3545' },
            'AJUSTE_POSITIVO': { label: 'Ajuste +', variant: 'aprobado', color: '#17a2b8' },
            'AJUSTE_NEGATIVO': { label: 'Ajuste -', variant: 'observado', color: '#ffc107' },
            'AJUSTE_POR_RECEPCION': { label: 'Ajuste Recepción', variant: 'aprobado', color: '#6f42c1' }
        };
        return tipos[tipo] || { label: tipo, variant: 'default', color: '#6c757d' };
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📊 Kardex - Detalle de Movimientos</h1>
            <p style={{ color: 'var(--secondary-color)', marginBottom: '2rem' }}>
                Registro detallado de todos los movimientos de inventario
            </p>

            {/* Estadísticas */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
            }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                    color: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Ingresos</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalIngresos.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {stats.cantidadIngresos} movimientos
                    </div>
                </div>

                <div style={{ 
                    background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)', 
                    color: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Total Salidas</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalSalidas.toFixed(2)}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {stats.cantidadSalidas} movimientos
                    </div>
                </div>

                <div style={{ 
                    background: 'linear-gradient(135deg, #0b6aa2 0%, #17a2b8 100%)', 
                    color: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Balance Neto</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {(stats.totalIngresos - stats.totalSalidas).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {movimientos.length} movimientos totales
                    </div>
                </div>
            </div>

            {/* Filtros Mejorados */}
            <div style={{ 
                background: 'var(--surface-color)', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                marginBottom: '2rem', 
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                    🔍 Filtros de Búsqueda
                </h3>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Producto (Código o Descripción)
                        </label>
                        <Input
                            type="text"
                            placeholder="Buscar producto..."
                            value={filtroProducto}
                            onChange={(e) => setFiltroProducto(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Número de Lote
                        </label>
                        <Input
                            type="text"
                            placeholder="Filtrar por lote..."
                            value={filtroLote}
                            onChange={(e) => setFiltroLote(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Número de Documento
                        </label>
                        <Input
                            type="text"
                            placeholder="Filtrar por documento..."
                            value={filtroDocumento}
                            onChange={(e) => setFiltroDocumento(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Tipo de Movimiento
                        </label>
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="">Todos</option>
                            <option value="INGRESO">Ingreso</option>
                            <option value="SALIDA">Salida</option>
                            <option value="AJUSTE_POSITIVO">Ajuste Positivo</option>
                            <option value="AJUSTE_NEGATIVO">Ajuste Negativo</option>
                            <option value="AJUSTE_POR_RECEPCION">Ajuste por Recepción</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Fecha Desde
                        </label>
                        <Input
                            type="date"
                            value={filtroFechaDesde}
                            onChange={(e) => setFiltroFechaDesde(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                            Fecha Hasta
                        </label>
                        <Input
                            type="date"
                            value={filtroFechaHasta}
                            onChange={(e) => setFiltroFechaHasta(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={limpiarFiltros} variant="secondary">
                    🗑️ Limpiar Filtros
                </Button>
            </div>

            {/* Tabla de Movimientos */}
            <div style={{ 
                background: 'var(--surface-color)', 
                padding: '2rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando movimientos...</p>
                ) : movimientos.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)', textAlign: 'center', padding: '2rem' }}>
                        No hay movimientos registrados con los filtros seleccionados
                    </p>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Fecha</TableHeader>
                                        <TableHeader>Tipo</TableHeader>
                                        <TableHeader>Código</TableHeader>
                                        <TableHeader>Producto</TableHeader>
                                        <TableHeader>Lote</TableHeader>
                                        <TableHeader>Documento</TableHeader>
                                        <TableHeader>N° Documento</TableHeader>
                                        <TableHeader style={{ textAlign: 'right' }}>Ingreso</TableHeader>
                                        <TableHeader style={{ textAlign: 'right' }}>Salida</TableHeader>
                                        <TableHeader style={{ textAlign: 'right' }}>Saldo</TableHeader>
                                        <TableHeader>UM</TableHeader>
                                        <TableHeader>Cliente/Proveedor</TableHeader>
                                        <TableHeader>Observaciones</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {movimientos.map((mov, idx) => {
                                        const tipoInfo = getTipoMovimientoInfo(mov.tipo_movimiento);
                                        const esIngreso = ['INGRESO', 'AJUSTE_POSITIVO', 'AJUSTE_POR_RECEPCION'].includes(mov.tipo_movimiento);
                                        
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                    {formatFecha(mov.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={tipoInfo.variant}>
                                                        {tipoInfo.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell style={{ fontWeight: 'bold', color: '#0b6aa2' }}>
                                                    {mov.producto?.codigo || 'N/A'}
                                                </TableCell>
                                                <TableCell style={{ maxWidth: '250px' }}>
                                                    {mov.producto?.descripcion || 'N/A'}
                                                </TableCell>
                                                <TableCell>{mov.lote_numero || '-'}</TableCell>
                                                <TableCell style={{ fontSize: '0.85rem' }}>
                                                    {mov.documento_tipo || '-'}
                                                </TableCell>
                                                <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                    {mov.documento_numero || '-'}
                                                </TableCell>
                                                <TableCell style={{ 
                                                    textAlign: 'right', 
                                                    color: '#28a745', 
                                                    fontWeight: 'bold',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {esIngreso ? Number(mov.cantidad).toFixed(2) : '-'}
                                                </TableCell>
                                                <TableCell style={{ 
                                                    textAlign: 'right', 
                                                    color: '#dc3545', 
                                                    fontWeight: 'bold',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {!esIngreso ? Number(mov.cantidad).toFixed(2) : '-'}
                                                </TableCell>
                                                <TableCell style={{ 
                                                    textAlign: 'right', 
                                                    fontWeight: 'bold',
                                                    backgroundColor: Number(mov.saldo) > 0 ? '#d4edda' : '#f8d7da',
                                                    color: Number(mov.saldo) > 0 ? '#155724' : '#721c24',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {Number(mov.saldo).toFixed(2)}
                                                </TableCell>
                                                <TableCell style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                                                    {mov.unidad_medida || 'UND'}
                                                </TableCell>
                                                <TableCell style={{ fontSize: '0.85rem' }}>
                                                    {mov.cliente_nombre || '-'}
                                                </TableCell>
                                                <TableCell style={{ fontSize: '0.85rem', maxWidth: '200px' }}>
                                                    {mov.observaciones || '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
