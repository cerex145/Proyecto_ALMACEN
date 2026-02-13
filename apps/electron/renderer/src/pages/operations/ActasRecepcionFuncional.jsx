import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const ActasRecepcionFuncional = () => {
    const [actas, setActas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedActa, setSelectedActa] = useState(null);

    useEffect(() => {
        cargarActas();
    }, []);

    const cargarActas = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/actas');
            const result = await response.json();
            setActas(result.data || []);
        } catch (error) {
            console.error('Error al cargar actas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (id) => {
        try {
            const url = `http://localhost:3000/api/actas/${id}/pdf`;
            if (window.electron?.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('open-external', url);
            } else {
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert('❌ Error al descargar PDF');
        }
    };

    if (selectedActa) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <Button onClick={() => setSelectedActa(null)} variant="secondary">← Volver</Button>

                <Card className="p-8">
                    <div className="flex justify-between items-start mb-8 border-b pb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Acta Nº {selectedActa.id}</h2>
                            <p className="text-slate-500 mt-1">Detalle de recepción de mercadería</p>
                        </div>
                        <Button onClick={() => handleDownloadPDF(selectedActa.id)} className="btn-gradient-primary">
                            ⬇ Descargar PDF
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-xl">
                        <div className="space-y-3">
                            <p className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="font-semibold text-slate-600">Cliente:</span>
                                <span className="font-mono text-blue-600">
                                    {selectedActa.cliente?.razon_social || '—'}
                                </span>
                            </p>
                            <p className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="font-semibold text-slate-600">Fecha Recepción:</span>
                                <span>{new Date(selectedActa.fecha).toLocaleDateString()}</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="font-semibold text-slate-600">Documento:</span>
                                <span>
                                    {(selectedActa.tipo_documento || 'Documento')}
                                    {selectedActa.numero_documento ? ` - ${selectedActa.numero_documento}` : ''}
                                </span>
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="font-semibold text-slate-600">Total Items:</span>
                                <span className="font-bold text-slate-800">{selectedActa.detalles?.length || 0}</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="font-semibold text-slate-600">Proveedor:</span>
                                <span>{selectedActa.proveedor || '—'}</span>
                            </p>
                        </div>
                    </div>

                    <h3 className="font-bold text-lg text-slate-700 mb-4">Detalle de Productos</h3>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Producto</TableHeader>
                                    <TableHeader>Lote</TableHeader>
                                    <TableHeader>Vencimiento</TableHeader>
                                    <TableHeader>Esperado</TableHeader>
                                    <TableHeader>Recibido</TableHeader>
                                    <TableHeader>Diferencia</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedActa.detalles?.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50">
                                        <TableCell>{item.producto?.descripcion || item.producto_nombre}</TableCell>
                                        <TableCell>{item.lote_numero}</TableCell>
                                        <TableCell>{item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : '—'}</TableCell>
                                        <TableCell>{item.cantidad_solicitada}</TableCell>
                                        <TableCell><strong className="text-blue-700">{item.cantidad_recibida}</strong></TableCell>
                                        <TableCell>
                                            {(() => {
                                                const solicitado = Number(item.cantidad_solicitada || 0);
                                                const recibido = Number(item.cantidad_recibida || 0);
                                                const diferencia = recibido - solicitado;
                                                return (
                                            <span
                                                className={`font-mono font-bold ${diferencia === 0 ? 'text-green-500' : 'text-red-500'}`}
                                            >
                                                {diferencia > 0 ? '+' : ''}{diferencia}
                                            </span>
                                                );
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {selectedActa.observaciones && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-800 text-sm">
                            <strong className="block mb-1 text-yellow-900">Observaciones:</strong>
                            <p>{selectedActa.observaciones}</p>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📄 Actas de Recepción</h1>
                    <p className="text-slate-500">Histórico de recepciones y conformidades</p>
                </div>
            </div>

            <Card className="p-6">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Cargando actas...</div>
                ) : actas.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No hay actas de recepción registradas</div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nº Acta</TableHeader>
                                <TableHeader>Cliente</TableHeader>
                                <TableHeader>Documento</TableHeader>
                                <TableHeader>Fecha</TableHeader>
                                <TableHeader>Items</TableHeader>
                                <TableHeader>Acción</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {actas.map(acta => (
                                <TableRow key={acta.id}>
                                    <TableCell><span className="font-semibold">{acta.id}</span></TableCell>
                                    <TableCell>{acta.cliente?.razon_social || '—'}</TableCell>
                                    <TableCell>
                                        {(acta.tipo_documento || 'Documento')}
                                        {acta.numero_documento ? ` - ${acta.numero_documento}` : ''}
                                    </TableCell>
                                    <TableCell>{new Date(acta.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{acta.detalles?.length || 0}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => setSelectedActa(acta)}>
                                                Ver Detalles
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadPDF(acta.id);
                                                }}
                                            >
                                                📄
                                            </Button>
                                        </div>
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
