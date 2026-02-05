import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const KardexFuncional = () => {
    const [kardex, setKardex] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroProducto, setFiltroProducto] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');

    useEffect(() => {
        cargarKardex();
    }, [filtroProducto, filtroTipo]);

    const cargarKardex = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:3000/api/kardex?limit=500';
            if (filtroProducto) url += `&producto_id=${filtroProducto}`;
            if (filtroTipo) url += `&tipo_movimiento=${filtroTipo}`;
            
            const response = await fetch(url);
            const result = await response.json();
            setKardex(result.data || []);
        } catch (error) {
            console.error('Error al cargar kardex:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTipoBadge = (tipo) => {
        switch(tipo) {
            case 'ingreso': return <Badge variant="registrado">📥 Ingreso</Badge>;
            case 'salida': return <Badge variant="anulado">📤 Salida</Badge>;
            case 'ajuste': return <Badge variant="observado">🔧 Ajuste</Badge>;
            default: return <Badge variant="secondary">{tipo}</Badge>;
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📊 Kardex General</h1>
            <p style={{ color: 'var(--secondary-color)', marginBottom: '2rem' }}>
                Registro detallado de todos los movimientos de inventario
            </p>

            {/* Filtros */}
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tipo de Movimiento</label>
                    <select 
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    >
                        <option value="">Todos</option>
                        <option value="ingreso">Ingresos</option>
                        <option value="salida">Salidas</option>
                        <option value="ajuste">Ajustes</option>
                    </select>
                </div>
                <Button onClick={() => { setFiltroTipo(''); setFiltroProducto(''); }}>Limpiar Filtros</Button>
            </div>

            {/* Tabla */}
            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {loading ? (
                    <p>Cargando kardex...</p>
                ) : kardex.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay movimientos registrados</p>
                ) : (
                    <>
                        <p style={{ color: 'var(--secondary-color)', marginBottom: '1rem' }}>
                            <strong>Total Movimientos:</strong> {kardex.length}
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Fecha</TableHeader>
                                        <TableHeader>Producto</TableHeader>
                                        <TableHeader>Lote</TableHeader>
                                        <TableHeader>Tipo</TableHeader>
                                        <TableHeader>Entrada</TableHeader>
                                        <TableHeader>Salida</TableHeader>
                                        <TableHeader>Saldo</TableHeader>
                                        <TableHeader>Ref. Doc</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {kardex.map((mov, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{new Date(mov.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell>{mov.producto?.descripcion}</TableCell>
                                            <TableCell>{mov.lote_numero}</TableCell>
                                            <TableCell>{getTipoBadge(mov.tipo_movimiento)}</TableCell>
                                            <TableCell style={{ textAlign: 'right' }}>{mov.cantidad_entrada || '-'}</TableCell>
                                            <TableCell style={{ textAlign: 'right' }}>{mov.cantidad_salida || '-'}</TableCell>
                                            <TableCell style={{ textAlign: 'right', fontWeight: 'bold' }}>{mov.saldo}</TableCell>
                                            <TableCell>{mov.numero_referencia || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
