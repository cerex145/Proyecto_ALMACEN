import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

import RegistrarIngreso from './RegistrarIngreso';

export const HistorialIngresosFuncional = () => {
    const [ingresos, setIngresos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!showForm) {
            cargarIngresos();
        }
    }, [filtro, showForm]);

    const cargarIngresos = async () => {
        try {
            setLoading(true);
            const params = filtro ? `?numero_ingreso=${filtro}` : '';
            const response = await fetch(`http://127.0.0.1:3000/api/ingresos${params}`);
            const result = await response.json();
            setIngresos(result.data || []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (id) => {
        window.open(`http://127.0.0.1:3000/api/ingresos/${id}/pdf`, '_blank');
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'REGISTRADO': return <Badge variant="registrado">Registrado</Badge>;
            case 'RECIBIDO': return <Badge variant="observado">Recibido</Badge>;
            case 'ANULADO': return <Badge variant="anulado">Anulado</Badge>;
            default: return <Badge variant="secondary">{estado}</Badge>;
        }
    };

    if (showForm) {
        return (
            <div className="max-w-7xl mx-auto">
                <RegistrarIngreso
                    onCancel={() => setShowForm(false)}
                    onSuccess={() => setShowForm(false)}
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📋 Historial de Ingresos</h1>
                    <p className="text-slate-500">Consulta y descarga de notas de ingreso</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                    + Nuevo Ingreso
                </Button>
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
                                    <TableCell>{new Date(ingreso.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{ingreso.proveedor || 'N/A'}</TableCell>
                                    <TableCell>{ingreso.responsable_id || 'N/A'}</TableCell>
                                    <TableCell>{getEstadoBadge(ingreso.estado)}</TableCell>
                                    <TableCell>
                                        <span className="text-xs text-slate-500">{ingreso.nota_ingreso_detalles?.length || 0} items</span>
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
