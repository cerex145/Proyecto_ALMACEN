import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ActasRecepcionFuncional = () => {
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedActa, setSelectedActa] = useState(null);

    useEffect(() => {
        cargarActas();
    }, []);

    const cargarActas = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/actas-recepcion');
            const result = await response.json();
            setActas(result.data || []);
        } catch (error) {
            console.error('Error al cargar actas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado) => {
        switch(estado) {
            case 'REGISTRADA': return <Badge variant="registrado">Registrada</Badge>;
            case 'CONFIRMADA': return <Badge variant="observado">Confirmada</Badge>;
            case 'RECHAZADA': return <Badge variant="anulado">Rechazada</Badge>;
            default: return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    if (selectedActa) {
        return (
            <div style={{ padding: '2rem' }}>
                <Button onClick={() => setSelectedActa(null)} variant="secondary">← Volver</Button>
                
                <div style={{ marginTop: '2rem', background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h2>Acta Nº {selectedActa.numero_acta}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <p><strong>Ingreso:</strong> {selectedActa.ingreso?.numero_ingreso}</p>
                            <p><strong>Fecha Recepción:</strong> {new Date(selectedActa.fecha_recepcion).toLocaleDateString()}</p>
                            <p><strong>Responsable:</strong> {selectedActa.responsable_recepcion?.usuario}</p>
                        </div>
                        <div>
                            <p><strong>Estado:</strong> {getEstadoBadge(selectedActa.estado)}</p>
                            <p><strong>Total Items:</strong> {selectedActa.detalle_acta?.length || 0}</p>
                        </div>
                    </div>

                    <h3>Detalle de Recepción</h3>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Producto</TableHeader>
                                <TableHeader>Lote</TableHeader>
                                <TableHeader>Vencimiento</TableHeader>
                                <TableHeader>Esperado</TableHeader>
                                <TableHeader>Recibido</TableHeader>
                                <TableHeader>Diferencia</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedActa.detalle_acta?.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{item.producto?.descripcion}</TableCell>
                                    <TableCell>{item.numero_lote}</TableCell>
                                    <TableCell>{new Date(item.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                    <TableCell>{item.cantidad_esperada}</TableCell>
                                    <TableCell><strong>{item.cantidad_recibida}</strong></TableCell>
                                    <TableCell style={{ color: item.diferencia === 0 ? 'green' : 'red' }}>
                                        {item.diferencia > 0 ? '+' : ''}{item.diferencia}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {selectedActa.observaciones && (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
                            <strong>Observaciones:</strong>
                            <p>{selectedActa.observaciones}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>📄 Actas de Recepción</h1>

            <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {loading ? (
                    <p>Cargando actas...</p>
                ) : actas.length === 0 ? (
                    <p style={{ color: 'var(--secondary-color)' }}>No hay actas de recepción registradas</p>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nº Acta</TableHeader>
                                <TableHeader>Ingreso</TableHeader>
                                <TableHeader>Fecha Recepción</TableHeader>
                                <TableHeader>Responsable</TableHeader>
                                <TableHeader>Estado</TableHeader>
                                <TableHeader>Items</TableHeader>
                                <TableHeader>Acción</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {actas.map(acta => (
                                <TableRow key={acta.id}>
                                    <TableCell><strong>{acta.numero_acta}</strong></TableCell>
                                    <TableCell>{acta.ingreso?.numero_ingreso}</TableCell>
                                    <TableCell>{new Date(acta.fecha_recepcion).toLocaleDateString()}</TableCell>
                                    <TableCell>{acta.responsable_recepcion?.usuario}</TableCell>
                                    <TableCell>{getEstadoBadge(acta.estado)}</TableCell>
                                    <TableCell>{acta.detalle_acta?.length || 0}</TableCell>
                                    <TableCell>
                                        <Button size="sm" onClick={() => setSelectedActa(acta)}>
                                            Ver Detalles
                                        </Button>
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
