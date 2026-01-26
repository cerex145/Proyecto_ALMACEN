import React, { useEffect, useState } from 'react';
import { kardexService } from '../../services/kardex.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const KardexWidget = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMovements();
    }, []);

    const loadMovements = async () => {
        try {
            setLoading(true);
            const data = await kardexService.getRecentMovements(5);
            setMovements(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'ingreso': return <Badge variant="registrado">Ingreso</Badge>
            case 'salida': return <Badge variant="anulado">Salida</Badge>
            case 'ajuste': return <Badge variant="observado">Ajuste</Badge>
            default: return type;
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
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>🔄 Últimos Movimientos</h3>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableHeader>Fecha</TableHeader>
                        <TableHeader>Producto</TableHeader>
                        <TableHeader>Tipo</TableHeader>
                        <TableHeader>Cant.</TableHeader>
                        <TableHeader>Saldo</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? <TableRow><TableCell colspan={5}>Cargando...</TableCell></TableRow> :
                        movements.length === 0 ? <TableRow><TableCell colspan={5}>Sin movimientos</TableCell></TableRow> :
                            movements.map(m => (
                                <TableRow key={m.id}>
                                    <TableCell>{new Date(m.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{m.producto?.codigo || 'PROD'}</TableCell>
                                    <TableCell>{getTypeLabel(m.tipo_movimiento)}</TableCell>
                                    <TableCell>
                                        {m.tipo_movimiento === 'ingreso' ? `+${m.cantidad_entrada}` : `-${m.cantidad_salida}`}
                                    </TableCell>
                                    <TableCell>{m.saldo}</TableCell>
                                </TableRow>
                            ))}
                </TableBody>
            </Table>
        </div>
    );
};
