import React, { useEffect, useState } from 'react';
import { alertasService } from '../../services/alertas.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

export const AlertasWidget = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const response = await alertasService.listar({
                estado: 'PROXIMO_A_VENCER',
                limit: 5
            });
            setAlerts(response.data || []);
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
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

    return (
        <Card className="h-full border-l-4 border-l-rose-500">
            <CardHeader className="mb-4">
                <CardTitle className="text-rose-600 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> Alertas de Vencimiento
                </CardTitle>
            </CardHeader>

            <CardContent>
                {loading ? <p className="text-sm text-slate-500">Cargando alertas...</p> : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg">
                        <span className="text-4xl mb-2">✅</span>
                        <p className="text-slate-600 font-medium">Todo en orden</p>
                        <p className="text-xs text-slate-400">No hay productos próximos a vencer.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Producto</TableHeader>
                                <TableHeader>Lote</TableHeader>
                                <TableHeader>Vence</TableHeader>
                                <TableHeader>Stock</TableHeader>
                                <TableHeader>Días</TableHeader>
                                <TableHeader>Prioridad</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {alerts.map((alerta) => (
                                <TableRow key={alerta.id}>
                                    <TableCell className="font-medium text-slate-700">
                                        {alerta.producto?.descripcion || alerta.producto?.codigo || alerta.producto_id || 'N/A'}
                                    </TableCell>
                                    <TableCell>{alerta.lote?.numero_lote || alerta.lote_numero || alerta.lote_id || 'N/A'}</TableCell>
                                    <TableCell>{formatFecha(alerta.fecha_vencimiento || alerta.lote?.fecha_vencimiento)}</TableCell>
                                    <TableCell>{alerta.lote?.cantidad_disponible ?? alerta.producto?.stock_actual ?? 'N/A'}</TableCell>
                                    <TableCell className="text-rose-600 font-bold">
                                        {Number.isFinite(alerta.dias_faltantes) ? alerta.dias_faltantes : 'N/A'}
                                    </TableCell>
                                    <TableCell>{getEstadoBadge(alerta.estado)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
