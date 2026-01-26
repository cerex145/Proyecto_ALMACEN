import React, { useEffect, useState } from 'react';
import { kardexService } from '../../services/kardex.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const AlertasWidget = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const data = await kardexService.getAlerts();
            setAlerts(data);
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
        <div style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            height: '100%'
        }}>
            <h3 style={{ marginTop: 0, color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ Alertas de Vencimiento
            </h3>

            {loading ? <p>Cargando...</p> : alerts.length === 0 ? (
                <p style={{ color: 'var(--success-color)' }}>✅ No hay productos próximos a vencer.</p>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Producto</TableHeader>
                            <TableHeader>Lote</TableHeader>
                            <TableHeader>Vence</TableHeader>
                            <TableHeader>Stock</TableHeader>
                            <TableHeader>Restante</TableHeader>
                            <TableHeader>Prioridad</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alerts.map(a => (
                            <TableRow key={a.id}>
                                <TableCell>{a.descripcion}</TableCell>
                                <TableCell>{a.numero_lote}</TableCell>
                                <TableCell>{new Date(a.fecha_vencimiento).toLocaleDateString()}</TableCell>
                                <TableCell>{a.stock_lote}</TableCell>
                                <TableCell><strong>{a.dias_restantes} días</strong></TableCell>
                                <TableCell>{getPriorityBadge(a.prioridad)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
