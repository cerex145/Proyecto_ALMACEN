import React, { useState, useEffect } from 'react';
import { actasService } from '../../services/actas.service';
import { ingresosService } from '../../services/ingresos.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';

export const ActaRecepcionList = () => {
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({ estado: '', page: 1 });

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

    const getEstadoBadge = (estado) => {
        const colores = {
            'REGISTRADA': 'primary',
            'APROBADA': 'success',
            'RECHAZADA': 'danger'
        };
        return <Badge variant={colores[estado] || 'secondary'}>{estado}</Badge>;
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Actas de Recepción</h2>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Todos los estados</option>
                    <option value="REGISTRADA">Registrada</option>
                    <option value="APROBADA">Aprobada</option>
                    <option value="RECHAZADA">Rechazada</option>
                </select>
                <Button onClick={cargarActas}>Actualizar</Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Número Acta</TableHeader>
                            <TableHeader>Nota Ingreso</TableHeader>
                            <TableHeader>Fecha Recepción</TableHeader>
                            <TableHeader>Cantidad Detalles</TableHeader>
                            <TableHeader>Estado</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {actas.length > 0 ? (
                            actas.map((acta) => (
                                <TableRow key={acta.id}>
                                    <TableCell>{acta.numero_acta || acta.id}</TableCell>
                                    <TableCell>{acta.nota_ingreso_id}</TableCell>
                                    <TableCell>{new Date(acta.fecha_recepcion).toLocaleDateString()}</TableCell>
                                    <TableCell>{acta.detalles_count || 0}</TableCell>
                                    <TableCell>{getEstadoBadge(acta.estado)}</TableCell>
                                    <TableCell>
                                        {acta.estado === 'REGISTRADA' && (
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleAprobar(acta.id)}
                                            >
                                                Aprobar
                                            </Button>
                                        )}
                                        {acta.estado === 'APROBADA' && (
                                            <Badge variant="success">Aprobada</Badge>
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
