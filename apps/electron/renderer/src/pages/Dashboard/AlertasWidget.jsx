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
            const response = await alertasService.listar();
            setAlerts(response.data || []);
        } catch (error) {
            console.error('Error loading alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'critica': return <Badge variant="anulado">Crítica</Badge>;
            case 'alta': return <Badge variant="observado">Alta</Badge>;
            case 'media': return <Badge variant="pendiente">Media</Badge>;
            default: return <Badge variant="secondary">{priority}</Badge>;
        }
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
                            {alerts.map(a => (
                                <TableRow key={a.id}>
                                    <TableCell className="font-medium text-slate-700">{a.producto?.descripcion || 'Producto desconocido'}</TableCell>
                                    <TableCell>{a.lote_numero}</TableCell>
                                    <TableCell>{new Date(a.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                    <TableCell>{a.producto?.stock_actual || '-'}</TableCell>
                                    <TableCell className="text-rose-600 font-bold">{a.dias_faltantes}</TableCell>
                                    <TableCell>{getPriorityBadge(a.estado)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
