import React, { useState, useEffect } from 'react';
import { alertasService } from '../../services/alertas.service';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';

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
            setResumen(response.resumen || null);
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
            VIGENTE: 'success',
            PROXIMO_A_VENCER: 'warning',
            VENCIDO: 'danger'
        };
        return <Badge variant={colores[estado] || 'secondary'}>{estado}</Badge>;
    };

    const formatCantidad = (valor) => {
        const numero = Number(valor);
        if (!Number.isFinite(numero)) {
            return 'N/A';
        }
        return numero.toLocaleString();
    };

    const formatFecha = (valor) => {
        if (!valor) {
            return 'N/A';
        }
        const fecha = new Date(valor);
        if (Number.isNaN(fecha.getTime())) {
            return 'N/A';
        }
        return fecha.toLocaleDateString();
    };

    const getNombreProducto = (alerta) => {
        return (
            alerta.producto_nombre ||
            alerta.producto?.descripcion ||
            alerta.lote?.producto?.descripcion ||
            alerta.producto_codigo ||
            alerta.producto?.codigo ||
            alerta.lote?.producto?.codigo ||
            'N/A'
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2>Alertas de Vencimiento</h2>
            </div>

            {resumen && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '15px',
                        marginBottom: '20px'
                    }}
                >
                    <div
                        style={{
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            borderLeft: '4px solid #28a745'
                        }}
                    >
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Vigentes</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
                            {resumen.total_vigentes || 0}
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            borderLeft: '4px solid #ffc107'
                        }}
                    >
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Proximos a vencer</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>
                            {resumen.total_proximos_a_vencer || 0}
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            borderLeft: '4px solid #dc3545'
                        }}
                    >
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Vencidos</div>
                        <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545' }}>
                            {resumen.total_vencidos || 0}
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
                    <option value="PROXIMO_A_VENCER">Proximos a Vencer</option>
                    <option value="VENCIDO">Vencidos</option>
                </select>
                <Button onClick={cargarAlertas}>Actualizar</Button>
                <Button onClick={handleMarcarTodasLeidas} variant="secondary">
                    Marcar Todo como Leido
                </Button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Lote</TableHeader>
                            <TableHeader>Producto</TableHeader>
                            <TableHeader>Stock</TableHeader>
                            <TableHeader>Vencimiento</TableHeader>
                            <TableHeader>Dias Faltantes</TableHeader>
                            <TableHeader>Prioridad</TableHeader>
                            <TableHeader>Leida</TableHeader>
                            <TableHeader>Acciones</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alertas.length > 0 ? (
                            alertas.map((alerta) => (
                                <TableRow
                                    key={alerta.id}
                                    style={{
                                        backgroundColor: alerta.leida ? '#f5f5f5' : '#fffbea'
                                    }}
                                >
                                    <TableCell>{alerta.lote?.numero_lote || alerta.lote_numero || alerta.lote_id || 'N/A'}</TableCell>
                                    <TableCell>
                                        {getNombreProducto(alerta)}
                                    </TableCell>
                                    <TableCell>
                                        {formatCantidad(
                                            alerta.lote?.cantidad_disponible ??
                                                alerta.producto?.stock_actual ??
                                                alerta.lote?.cantidad_ingresada
                                        )}
                                    </TableCell>
                                    <TableCell>{formatFecha(alerta.fecha_vencimiento || alerta.lote?.fecha_vencimiento)}</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                        {Number.isFinite(alerta.dias_faltantes) ? alerta.dias_faltantes : 'N/A'}
                                    </TableCell>
                                    <TableCell>{getEstadoBadge(alerta.estado)}</TableCell>
                                    <TableCell>
                                        <Badge variant={alerta.leida ? 'success' : 'warning'}>
                                            {alerta.leida ? 'Si' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {!alerta.leida && (
                                            <Button size="sm" onClick={() => handleMarcarLeida(alerta.id)}>
                                                Marcar Leida
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
                                <TableCell colSpan="8" style={{ textAlign: 'center' }}>
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
