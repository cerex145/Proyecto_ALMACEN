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
            const response = await kardexService.listar({ limit: 5 });
            setMovements(response.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type) => {
        const typeUpper = type?.toUpperCase() || '';
        switch (typeUpper) {
            case 'INGRESO': return <Badge variant="registrado">Ingreso</Badge>;
            case 'SALIDA': return <Badge variant="anulado">Salida</Badge>;
            case 'AJUSTE': return <Badge variant="observado">Ajuste</Badge>;
            default: return <Badge variant="secondary">{type}</Badge>;
        }
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
                                    <TableCell className="text-slate-500">{new Date(m.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium text-slate-700">{m.producto?.codigo || 'PROD'}</TableCell>
                                    <TableCell>{getTypeLabel(m.tipo_movimiento)}</TableCell>
                                    <TableCell className={m.tipo_movimiento?.toUpperCase() === 'INGRESO' ? 'text-green-600 font-bold' : 'text-rose-600 font-bold'}>
                                        {m.tipo_movimiento?.toUpperCase() === 'INGRESO' ? '+' : '-'}{m.cantidad}
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
