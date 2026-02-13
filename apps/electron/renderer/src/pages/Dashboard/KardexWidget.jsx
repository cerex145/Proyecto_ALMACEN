import React, { useEffect, useState } from 'react';
import { kardexService } from '../../services/kardex.service';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';

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
            case 'INGRESO': return <Badge variant="registrado">Ingreso</Badge>
            case 'SALIDA': return <Badge variant="anulado">Salida</Badge>
            case 'AJUSTE':
            case 'AJUSTE_POR_RECEPCION':
                return <Badge variant="observado">Ajuste</Badge>
            default: return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const formatDate = (value) => {
        const date = value ? new Date(value) : null;
        if (!date || Number.isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString();
    };

    const formatCantidad = (mov) => {
        const cantidad = Number(mov.cantidad);
        if (!Number.isFinite(cantidad)) {
            return 'N/A';
        }
        if (mov.tipo_movimiento === 'INGRESO') {
            return `+${cantidad}`;
        }
        if (mov.tipo_movimiento === 'SALIDA') {
            return `-${Math.abs(cantidad)}`;
        }
        const sign = cantidad >= 0 ? '+' : '-';
        return `${sign}${Math.abs(cantidad)}`;
    };

    return (
        <Card className="h-full">
            <CardHeader className="mb-4">
                <CardTitle className="text-blue-600 flex items-center gap-2">
                    <span className="text-2xl">🔄</span> Últimos Movimientos
                </CardTitle>
            </CardHeader>

            <CardContent>
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
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">Cargando...</TableCell></TableRow>
                        ) : movements.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">Sin movimientos recientes</TableCell></TableRow>
                        ) : (
                            movements.map(m => (
                                <TableRow key={m.id}>
                                    <TableCell className="text-slate-500">{formatDate(m.created_at)}</TableCell>
                                    <TableCell className="font-medium text-slate-700">{m.producto?.codigo || 'N/A'}</TableCell>
                                    <TableCell>{getTypeLabel(m.tipo_movimiento)}</TableCell>
                                    <TableCell className={m.tipo_movimiento === 'INGRESO' ? 'text-green-600 font-bold' : 'text-rose-600 font-bold'}>
                                        {formatCantidad(m)}
                                    </TableCell>
                                    <TableCell>{m.saldo}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
