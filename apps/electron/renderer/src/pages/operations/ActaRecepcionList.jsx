import React, { useState, useEffect } from 'react';
import { actasService } from '../../services/actas.service';
import { Button } from '../../components/common/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const ActaRecepcionList = () => {
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({ page: 1 });

    useEffect(() => {
        cargarActas();
    }, [filtros]);

    const cargarActas = async () => {
        try {
            setLoading(true);
            const response = await actasService.listar(filtros);
            setActas(response.data || []);
        } catch (error) {
            console.error('Error al cargar actas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (id) => {
        try {
            await actasService.aprobar(id);
            cargarActas();
            alert('✅ Acta aprobada exitosamente');
        } catch (error) {
            alert('❌ Error al aprobar acta');
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Actas de Recepción</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button onClick={cargarActas}>Actualizar</Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Número Acta</TableHeader>
                            <TableHeader>Cliente</TableHeader>
                            <TableHeader>Documento</TableHeader>
                            <TableHeader>Fecha</TableHeader>
                            <TableHeader>Cantidad Detalles</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actas.length > 0 ? (
                            actas.map((acta) => (
                                <TableRow key={acta.id}>
                                    <TableCell>{acta.id}</TableCell>
                                    <TableCell>{acta.cliente?.razon_social || '—'}</TableCell>
                                    <TableCell>
                                        {(acta.tipo_documento || 'Documento')}
                                        {acta.numero_documento ? ` - ${acta.numero_documento}` : ''}
                                    </TableCell>
                                    <TableCell>{new Date(acta.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{acta.detalles?.length || 0}</TableCell>
                                    <TableCell>
                                        {(acta.estado || '').toLowerCase() === 'registrada' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleAprobar(acta.id)}
                                            >
                                                Aprobar
                                            </Button>
                                        )}
                                        {(acta.estado || '').toLowerCase() === 'confirmada' && (
                                            <Badge variant="success">Confirmada</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="6" style={{ textAlign: 'center' }}>
                                    No hay actas de recepción
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
