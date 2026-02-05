import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const HistorialIngresosFuncional = () => {
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        cargarIngresos();
    }, [filtro]);

    const cargarIngresos = async () => {
        try {
            setLoading(true);
            const params = filtro ? `?numero_ingreso=${filtro}` : '';
            const response = await fetch(`http://localhost:3000/api/ingresos${params}`);
            const result = await response.json();
            setIngresos(result.data || []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado) => {
        switch(estado) {
            case 'REGISTRADO': return <Badge variant="registrado">Registrado</Badge>;
            case 'RECIBIDO': return <Badge variant="observado">Recibido</Badge>;
            case 'ANULADO': return <Badge variant="anulado">Anulado</Badge>;
            default: return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📋 Historial de Ingresos</h1>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Buscar por Número de Ingreso
                    </label>
                    <Input
                        placeholder="Ej: ING-2026-001"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                <Button onClick={() => setFiltro('')}>Limpiar</Button>
            </div>

            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {loading ? (
                    <p>Cargando ingresos...</p>
                ) : ingresos.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay registros de ingreso</p>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nº Ingreso</TableHeader>
                                <TableHeader>Fecha</TableHeader>
                                <TableHeader>Proveedor</TableHeader>
                                <TableHeader>Responsable</TableHeader>
                                <TableHeader>Estado</TableHeader>
                                <TableHeader>Detalles</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ingresos.map(ingreso => (
                                <TableRow key={ingreso.id}>
                                    <TableCell><strong>{ingreso.numero_ingreso}</strong></TableCell>
                                    <TableCell>{new Date(ingreso.fecha_ingreso).toLocaleDateString()}</TableCell>
                                    <TableCell>{ingreso.proveedor?.nombre || 'N/A'}</TableCell>
                                    <TableCell>{ingreso.responsable?.usuario || 'N/A'}</TableCell>
                                    <TableCell>{getEstadoBadge(ingreso.estado)}</TableCell>
                                    <TableCell>
                                        <small>{ingreso.detalle_ingreso?.length || 0} items</small>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};
