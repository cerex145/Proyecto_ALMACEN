import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const HistorialSalidasFuncional = () => {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        cargarSalidas();
    }, [filtro]);

    const cargarSalidas = async () => {
        try {
            setLoading(true);
            const params = filtro ? `?numero_salida=${filtro}` : '';
            const response = await fetch(`http://localhost:3000/api/salidas${params}`);
            const result = await response.json();
            setSalidas(result.data || []);
        } catch (error) {
            console.error('Error al cargar salidas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado) => {
        switch(estado) {
            case 'REGISTRADO': return <Badge variant="registrado">Registrado</Badge>;
            case 'ENTREGADO': return <Badge variant="observado">Entregado</Badge>;
            case 'ANULADO': return <Badge variant="anulado">Anulado</Badge>;
            default: return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>📦 Historial de Salidas</h1>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Buscar por Número de Salida
                    </label>
                    <Input
                        placeholder="Ej: SAL-2026-001"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
                <Button onClick={() => setFiltro('')}>Limpiar</Button>
            </div>

            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {loading ? (
                    <p>Cargando salidas...</p>
                ) : salidas.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay registros de salida</p>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nº Salida</TableHeader>
                                <TableHeader>Fecha</TableHeader>
                                <TableHeader>Cliente</TableHeader>
                                <TableHeader>Responsable</TableHeader>
                                <TableHeader>Estado</TableHeader>
                                <TableHeader>Items</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salidas.map(salida => (
                                <TableRow key={salida.id}>
                                    <TableCell><strong>{salida.numero_salida}</strong></TableCell>
                                    <TableCell>{new Date(salida.fecha_salida).toLocaleDateString()}</TableCell>
                                    <TableCell>{salida.cliente?.razon_social || 'N/A'}</TableCell>
                                    <TableCell>{salida.responsable?.usuario || 'N/A'}</TableCell>
                                    <TableCell>{getEstadoBadge(salida.estado)}</TableCell>
                                    <TableCell>
                                        <small>{salida.detalle_salida?.length || 0} items</small>
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
