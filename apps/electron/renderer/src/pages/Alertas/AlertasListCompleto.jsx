import React, { useState, useEffect } from 'react';
import { alertasService } from '../../services/alertas-service';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export const AlertasListCompleto = () => {
    const [alertas, setAlertas] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        cargarAlertas();
        cargarResumen();
    }, [filtro]);

    const cargarAlertas = async () => {
        try {
            setLoading(true);
            const response = await alertasService.listar({ estado: filtro });
            setAlertas(response.data || []);
        } catch (error) {
            console.error('Error al cargar alertas:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarResumen = async () => {
        try {
            const response = await alertasService.resumen();
            setResumen(response.data);
        } catch (error) {
            console.error('Error al cargar resumen:', error);
        }
    };

    const handleMarcarLeida = async (id) => {
        try {
            await alertasService.marcarLeida(id);
            cargarAlertas();
            cargarResumen();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await alertasService.marcarTodasLeidas();
            cargarAlertas();
            cargarResumen();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEliminar = async (id) => {
        try {
            await alertasService.eliminar(id);
            cargarAlertas();
            cargarResumen();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getEstadoBadge = (estado) => {
        const colores = {
            'VIGENTE': 'success',
            'PROXIMO_A_VENCER': 'warning',
            'VENCIDO': 'danger'
        };
        return <Badge variant={colores[estado] || 'secondary'}>{estado}</Badge>;
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Alertas de Vencimiento</h2>
            </div>

            {resumen && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        borderLeft: '4px solid #28a745'
                    }}>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Vigentes</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
                            {resumen.vigentes_count || 0}
                        </div>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        borderLeft: '4px solid #ffc107'
                    }}>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Próximos a vencer</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>
                            {resumen.proximos_count || 0}
                        </div>
                    </div>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        borderLeft: '4px solid #dc3545'
                    }}>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Vencidos</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545' }}>
                            {resumen.vencidos_count || 0}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Todos</option>
                    <option value="VIGENTE">Vigentes</option>
                    <option value="PROXIMO_A_VENCER">Próximos a Vencer</option>
                    <option value="VENCIDO">Vencidos</option>
                </select>
                <Button onClick={cargarAlertas}>Actualizar</Button>
                <Button onClick={handleMarcarTodasLeidas} variant="secondary">
                    Marcar Todo como Leído
                </Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Lote</TableHeader>
                            <TableHeader>Producto ID</TableHeader>
                            <TableHeader>Vencimiento</TableHeader>
                            <TableHeader>Días Faltantes</TableHeader>
                            <TableHeader>Estado</TableHeader>
                            <TableHeader>Leída</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alertas.length > 0 ? (
                            alertas.map((alerta) => (
                                <TableRow key={alerta.id} style={{
                                    backgroundColor: alerta.leida ? '#f5f5f5' : '#fffbea'
                                }}>
                                    <TableCell>{alerta.lote?.numero_lote || 'N/A'}</TableCell>
                                    <TableCell>{alerta.lote?.producto_id || 'N/A'}</TableCell>
                                    <TableCell>{new Date(alerta.lote?.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                        {alerta.dias_faltantes}
                                    </TableCell>
                                    <TableCell>{getEstadoBadge(alerta.estado)}</TableCell>
                                    <TableCell>
                                        <Badge variant={alerta.leida ? 'success' : 'warning'}>
                                            {alerta.leida ? 'Sí' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {!alerta.leida && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarcarLeida(alerta.id)}
                                            >
                                                Marcar Leída
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handleEliminar(alerta.id)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="7" style={{ textAlign: 'center' }}>
                                    No hay alertas
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
