import React, { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportes.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';

export const ReportesCompleto = () => {
    const [tipoReporte, setTipoReporte] = useState('stock');
    const [datos, setDatos] = useState([]);
    const [totales, setTotales] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        fecha_desde: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        fecha_hasta: new Date().toISOString().split('T')[0],
        cliente_id: ''
    });

    useEffect(() => {
        cargarReporte();
    }, [tipoReporte]);

    const cargarReporte = async () => {
        try {
            setLoading(true);
            let response;

            switch (tipoReporte) {
                case 'stock':
                    response = await reportesService.stockActual({ incluir_lotes: true });
                    setDatos(response.data || []);
                    setTotales(response.totales);
                    break;
                case 'ingresos':
                    response = await reportesService.ingresos(filtros);
                    setDatos(response.data || []);
                    setTotales(response.totales);
                    break;
                case 'salidas':
                    response = await reportesService.salidas(filtros);
                    setDatos(response.data || []);
                    setTotales(response.totales);
                    break;
                case 'categorias':
                    response = await reportesService.productosPorCategoria();
                    setDatos(response.data || []);
                    setTotales(response.totales);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Error al cargar reporte:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportar = async () => {
        try {
            const blob = await reportesService.exportar();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `reportes-${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Reportes y Análisis</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div
                    onClick={() => setTipoReporte('stock')}
                    style={{
                        padding: '15px',
                        border: `2px solid ${tipoReporte === 'stock' ? '#007bff' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: tipoReporte === 'stock' ? '#e7f3ff' : '#f5f5f5'
                    }}
                >
                    <div style={{ fontWeight: 'bold' }}>Stock Actual</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>Inventario disponible</div>
                </div>
                <div
                    onClick={() => setTipoReporte('ingresos')}
                    style={{
                        padding: '15px',
                        border: `2px solid ${tipoReporte === 'ingresos' ? '#007bff' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: tipoReporte === 'ingresos' ? '#e7f3ff' : '#f5f5f5'
                    }}
                >
                    <div style={{ fontWeight: 'bold' }}>Ingresos</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>Por período</div>
                </div>
                <div
                    onClick={() => setTipoReporte('salidas')}
                    style={{
                        padding: '15px',
                        border: `2px solid ${tipoReporte === 'salidas' ? '#007bff' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: tipoReporte === 'salidas' ? '#e7f3ff' : '#f5f5f5'
                    }}
                >
                    <div style={{ fontWeight: 'bold' }}>Salidas</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>Por período</div>
                </div>
                <div
                    onClick={() => setTipoReporte('categorias')}
                    style={{
                        padding: '15px',
                        border: `2px solid ${tipoReporte === 'categorias' ? '#007bff' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: tipoReporte === 'categorias' ? '#e7f3ff' : '#f5f5f5'
                    }}
                >
                    <div style={{ fontWeight: 'bold' }}>Por Categoría</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>Análisis</div>
                </div>
            </div>

            {(tipoReporte === 'ingresos' || tipoReporte === 'salidas') && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px'
                }}>
                    <div>
                        <label>Desde</label>
                        <Input
                            type="date"
                            value={filtros.fecha_desde}
                            onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Hasta</label>
                        <Input
                            type="date"
                            value={filtros.fecha_hasta}
                            onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button onClick={cargarReporte}>Filtrar</Button>
                    </div>
                </div>
            )}

            {totales && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '4px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                }}>
                    {totales.cantidad_total && (
                        <div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>Total Unidades</div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{totales.cantidad_total}</div>
                        </div>
                    )}
                    {totales.monto_total && (
                        <div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>Monto Total</div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                                ${totales.monto_total.toFixed(2)}
                            </div>
                        </div>
                    )}
                    {totales.stock_total && (
                        <div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>Stock Total</div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{totales.stock_total}</div>
                        </div>
                    )}
                    {totales.cantidad_categorias && (
                        <div>
                            <div style={{ fontSize: '0.9em', color: '#666' }}>Categorías</div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{totales.cantidad_categorias}</div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <Button onClick={handleExportar} variant="secondary">
                    Exportar Todos los Reportes a Excel
                </Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            {tipoReporte === 'stock' && (
                                <>
                                    <TableHeader>Producto ID</TableHeader>
                                    <TableHeader>Descripción</TableHeader>
                                    <TableHeader>Stock Actual</TableHeader>
                                    <TableHeader>Cantidad Lotes</TableHeader>
                                </>
                            )}
                            {tipoReporte === 'ingresos' && (
                                <>
                                    <TableHeader>Fecha</TableHeader>
                                    <TableHeader>Número Ingreso</TableHeader>
                                    <TableHeader>Proveedor</TableHeader>
                                    <TableHeader>Cantidad Unidades</TableHeader>
                                    <TableHeader>Monto Total</TableHeader>
                                </>
                            )}
                            {tipoReporte === 'salidas' && (
                                <>
                                    <TableHeader>Fecha</TableHeader>
                                    <TableHeader>Número Salida</TableHeader>
                                    <TableHeader>Cliente</TableHeader>
                                    <TableHeader>Cantidad Unidades</TableHeader>
                                    <TableHeader>Monto Total</TableHeader>
                                </>
                            )}
                            {tipoReporte === 'categorias' && (
                                <>
                                    <TableHeader>Categoría</TableHeader>
                                    <TableHeader>Cantidad Productos</TableHeader>
                                    <TableHeader>Stock Total</TableHeader>
                                    <TableHeader>Monto Total</TableHeader>
                                </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {datos.length > 0 ? (
                            datos.map((fila, idx) => (
                                <TableRow key={idx}>
                                    {tipoReporte === 'stock' && (
                                        <>
                                            <TableCell>{fila.producto_id}</TableCell>
                                            <TableCell>{fila.descripcion}</TableCell>
                                            <TableCell>{fila.stock_actual}</TableCell>
                                            <TableCell>{fila.lotes?.length || 0}</TableCell>
                                        </>
                                    )}
                                    {tipoReporte === 'ingresos' && (
                                        <>
                                            <TableCell>{new Date(fila.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell>{fila.numero_ingreso}</TableCell>
                                            <TableCell>{fila.proveedor}</TableCell>
                                            <TableCell>{fila.cantidad_total_unidades}</TableCell>
                                            <TableCell>${(fila.monto_total || 0).toFixed(2)}</TableCell>
                                        </>
                                    )}
                                    {tipoReporte === 'salidas' && (
                                        <>
                                            <TableCell>{new Date(fila.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell>{fila.numero_salida}</TableCell>
                                            <TableCell>{fila.cliente?.razon_social || fila.cliente_id}</TableCell>
                                            <TableCell>{fila.cantidad_total_unidades}</TableCell>
                                            <TableCell>${(fila.monto_total || 0).toFixed(2)}</TableCell>
                                        </>
                                    )}
                                    {tipoReporte === 'categorias' && (
                                        <>
                                            <TableCell>{fila.categoria_ingreso}</TableCell>
                                            <TableCell>{fila.cantidad_productos}</TableCell>
                                            <TableCell>{fila.stock_total}</TableCell>
                                            <TableCell>${(fila.monto_total || 0).toFixed(2)}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="4" style={{ textAlign: 'center' }}>
                                    No hay datos para este reporte
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
