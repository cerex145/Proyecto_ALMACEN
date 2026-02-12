import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const KardexFuncional = () => {
    const [kardexResumen, setKardexResumen] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroProducto, setFiltroProducto] = useState('');

    useEffect(() => {
        cargarKardexResumen();
    }, [filtroProducto]);

    const cargarKardexResumen = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:3000/api/kardex?limit=1000';
            if (filtroProducto) url += `&producto_id=${filtroProducto}`;
            
            const response = await fetch(url);
            const result = await response.json();
            const movimientos = result.data || [];

            // Agrupar por producto_id + lote_numero
            const resumenMap = new Map();
            
            movimientos.forEach(mov => {
                const key = `${mov.producto_id}|${mov.lote_numero || 'SIN_LOTE'}`;
                
                if (!resumenMap.has(key)) {
                    resumenMap.set(key, {
                        producto_id: mov.producto_id,
                        codigo_producto: mov.producto?.codigo || 'N/A',
                        descripcion: mov.producto?.descripcion || 'N/A',
                        lote_numero: mov.lote_numero || '-',
                        total_ingreso: 0,
                        total_salida: 0,
                        stock: 0
                    });
                }
                
                const resumen = resumenMap.get(key);
                
                // Acumular ingresos y salidas
                if (mov.tipo_movimiento === 'INGRESO' || mov.tipo_movimiento === 'AJUSTE_POSITIVO' || mov.tipo_movimiento === 'AJUSTE_POR_RECEPCION') {
                    resumen.total_ingreso += Number(mov.cantidad) || 0;
                } else if (mov.tipo_movimiento === 'SALIDA' || mov.tipo_movimiento === 'AJUSTE_NEGATIVO') {
                    resumen.total_salida += Number(mov.cantidad) || 0;
                }
                
                // El saldo final es el último registrado para ese lote
                resumen.stock = Number(mov.saldo) || 0;
            });

            // Convertir Map a Array y ordenar
            const resumen = Array.from(resumenMap.values())
                .sort((a, b) => a.codigo_producto.localeCompare(b.codigo_producto));
            
            setKardexResumen(resumen);
        } catch (error) {
            console.error('Error al cargar kardex:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📊 Kardex - Resumen por Producto</h1>
            <p style={{ color: 'var(--secondary-color)', marginBottom: '2rem' }}>
                Vista resumida del inventario por producto y lote
            </p>

            {/* Filtros */}
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Código de Producto</label>
                    <Input
                        type="text"
                        placeholder="Filtrar por código..."
                        value={filtroProducto}
                        onChange={(e) => setFiltroProducto(e.target.value)}
                    />
                </div>
                <Button onClick={() => { setFiltroProducto(''); }}>Limpiar Filtros</Button>
            </div>

            {/* Tabla */}
            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {loading ? (
                    <p>Cargando kardex...</p>
                ) : kardexResumen.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay movimientos registrados</p>
                ) : (
                    <>
                        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                            <strong>Líneas de Inventario:</strong> {kardexResumen.length}
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Código Producto</TableHeader>
                                        <TableHeader>Producto</TableHeader>
                                        <TableHeader>Lote</TableHeader>
                                        <TableHeader style={{ textAlign: 'right' }}>Total Ingreso</TableHeader>
                                        <TableHeader style={{ textAlign: 'right' }}>Total Salida</TableHeader>
                                        <TableHeader style={{ textAlign: 'right' }}>Stock Actual</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {kardexResumen.map((res, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell style={{ fontWeight: 'bold', color: '#0b6aa2' }}>{res.codigo_producto}</TableCell>
                                            <TableCell>{res.descripcion}</TableCell>
                                            <TableCell>{res.lote_numero}</TableCell>
                                            <TableCell style={{ textAlign: 'right', color: '#28a745', fontWeight: 'bold' }}>
                                                {Number(res.total_ingreso).toFixed(2)}
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>
                                                {Number(res.total_salida).toFixed(2)}
                                            </TableCell>
                                            <TableCell style={{ 
                                                textAlign: 'right', 
                                                fontWeight: 'bold', 
                                                backgroundColor: res.stock > 0 ? '#d4edda' : '#f8d7da',
                                                color: res.stock > 0 ? '#155724' : '#721c24',
                                                padding: '0.5rem'
                                            }}>
                                                {Number(res.stock).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totales Generales */}
                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total General Ingreso</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                    {kardexResumen.reduce((sum, r) => sum + Number(r.total_ingreso), 0).toFixed(2)}
                                </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Total General Salida</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                    {kardexResumen.reduce((sum, r) => sum + Number(r.total_salida), 0).toFixed(2)}
                                </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Stock Total</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0b6aa2' }}>
                                    {kardexResumen.reduce((sum, r) => sum + Number(r.stock), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
