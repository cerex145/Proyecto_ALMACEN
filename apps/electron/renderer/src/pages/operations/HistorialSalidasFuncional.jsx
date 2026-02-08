import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const HistorialSalidasFuncional = () => {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        cargarSalidas();
    }, [filtro]);

    const cargarSalidas = async () => {
        try {
            setLoading(true);
            const params = filtro ? `?numero_salida=${filtro}` : '';
            const response = await fetch(`http://localhost:3000/api/salidas${params}`);
            const result = await response.json();
            setSalidas(result.data || []);
        } catch (error) {
            console.error('Error al cargar salidas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (id) => {
        window.open(`http://localhost:3000/api/salidas/${id}/pdf`, '_blank');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'REGISTRADA': return <Badge variant="registrado">Registrada</Badge>;
            case 'ENTREGADO': return <Badge variant="observado">Entregado</Badge>;
            case 'ANULADO': return <Badge variant="anulado">Anulado</Badge>;
            default: return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📦 Historial de Salidas</h1>
                    <p className="text-slate-500">Consulta y descarga de movimientos de salida</p>
                </div>
            </div>

            <Card className="p-6">
                <div className="flex gap-4 items-end mb-6">
                    <div className="flex-1">
                        <label className="label-premium">Buscar por Número de Salida</label>
                        <Input
                            placeholder="Ej: SAL-2026-001"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="input-premium"
                        />
                    </div>
                    <Button onClick={() => setFiltro('')} variant="secondary">Limpiar</Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Cargando salidas...</div>
                ) : salidas.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No hay registros de salida</div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nº Salida</TableHeader>
                                <TableHeader>Fecha</TableHeader>
                                <TableHeader>Cliente</TableHeader>
                                <TableHeader>Responsable</TableHeader>
                                <TableHeader>Estado</TableHeader>
                                <TableHeader>Items</TableHeader>
                                <TableHeader>Acciones</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salidas.map(salida => (
                                <TableRow key={salida.id}>
                                    <TableCell><span className="font-semibold text-slate-700">{salida.numero_salida}</span></TableCell>
                                    <TableCell>{new Date(salida.fecha_salida || salida.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{salida.cliente?.razon_social || 'N/A'}</TableCell>
                                    <TableCell>{salida.responsable?.usuario || 'N/A'}</TableCell>
                                    <TableCell>{getEstadoBadge(salida.estado)}</TableCell>
                                    <TableCell>
                                        <span className="text-xs text-slate-500">{salida.detalle_salida?.length || 0} items</span>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="text-xs"
                                            onClick={() => handleDownloadPDF(salida.id)}
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
