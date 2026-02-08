import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const HistorialIngresosFuncional = () => {
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        cargarIngresos();
    }, [filtro]);

    const cargarIngresos = async () => {
        try {
            setLoading(true);
            const params = filtro ? `?numero_ingreso=${filtro}` : '';
            const response = await fetch(`http://localhost:3000/api/ingresos${params}`);
            const result = await response.json();
            setIngresos(result.data || []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (id) => {
        window.open(`http://localhost:3000/api/ingresos/${id}/pdf`, '_blank');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'REGISTRADO': return <Badge variant="registrado">Registrado</Badge>;
            case 'RECIBIDO': return <Badge variant="observado">Recibido</Badge>;
            case 'ANULADO': return <Badge variant="anulado">Anulado</Badge>;
            default: return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📋 Historial de Ingresos</h1>
                    <p className="text-slate-500">Consulta y descarga de notas de ingreso</p>
                </div>
            </div>

            <Card className="p-6">
                <div className="flex gap-4 items-end mb-6">
                    <div className="flex-1">
                        <label className="label-premium">Buscar por Número de Ingreso</label>
                        <Input
                            placeholder="Ej: ING-2026-001"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="input-premium"
                        />
                    </div>
                    <Button onClick={() => setFiltro('')} variant="secondary">Limpiar</Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Cargando ingresos...</div>
                ) : ingresos.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No hay registros de ingreso</div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nº Ingreso</TableHeader>
                                <TableHeader>Fecha</TableHeader>
                                <TableHeader>Proveedor</TableHeader>
                                <TableHeader>Responsable</TableHeader>
                                <TableHeader>Estado</TableHeader>
                                <TableHeader>Detalles</TableHeader>
                                <TableHeader>Acciones</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ingresos.map(ingreso => (
                                <TableRow key={ingreso.id}>
                                    <TableCell><span className="font-semibold text-slate-700">{ingreso.numero_ingreso}</span></TableCell>
                                    <TableCell>{new Date(ingreso.fecha_ingreso).toLocaleDateString()}</TableCell>
                                    <TableCell>{ingreso.proveedor?.nombre || 'N/A'}</TableCell>
                                    <TableCell>{ingreso.responsable?.usuario || 'N/A'}</TableCell>
                                    <TableCell>{getEstadoBadge(ingreso.estado)}</TableCell>
                                    <TableCell>
                                        <span className="text-xs text-slate-500">{ingreso.detalle_ingreso?.length || 0} items</span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-xs"
                                            onClick={() => handleDownloadPDF(ingreso.id)}
                                        >
                                            📄 PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};
