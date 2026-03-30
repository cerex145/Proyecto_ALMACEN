import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { API_ORIGIN } from '../../services/api';

import RegistrarIngreso from './RegistrarIngreso';
import { clientesService } from '../../services/clientes.service';

export const HistorialIngresosFuncional = () => {
    const [, setIngresos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [detalleRows, setDetalleRows] = useState([]);
    const [clientesMap, setClientesMap] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        cargarClientes();
    }, []);

    useEffect(() => {
        cargarIngresos();
    }, [filtro, clientesMap]);

    const cargarClientes = async () => {
        try {
            const clientsResponse = await clientesService.listar();
            const clientsArray = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse.data || []);
            const map = {};
            clientsArray.forEach((c) => {
                if (c.id != null) {
                    map[String(c.id)] = c.cuit || '';
                }
            });
            setClientesMap(map);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            setClientesMap({});
        }
    };

    const cargarIngresos = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filtro) params.set('numero_ingreso', filtro);
            params.set('include_detalles', 'true');
            const response = await fetch(`${API_ORIGIN}/api/ingresos?${params.toString()}`);
            const result = await response.json();
            const notas = result.data || [];
            setIngresos(notas);

            const rows = [];
            notas.forEach((nota) => {
                const fechaObj = new Date(nota.fecha);
                const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
                const dia = String(fechaObj.getDate()).padStart(2, '0');
                const anio = String(fechaObj.getFullYear());
                const ruc = clientesMap[String(nota.cliente_id)] || '-';
                const detalles = Array.isArray(nota?.detalles) ? nota.detalles : [];

                if (detalles.length === 0) {
                    rows.push({
                        key: `${nota.id}-empty`,
                        ingresoId: nota.id,
                        codigo: '-',
                        producto: '-',
                        lote: '-',
                        vencimiento: '-',
                        um: '-',
                        fabricante: '-',
                        temperatura: '-',
                        cantBulto: '-',
                        cantCajas: '-',
                        cantPorCaja: '-',
                        cantFraccion: '-',
                        cantTotal: '-',
                        fechaIngreso: new Date(nota.fecha).toLocaleDateString('es-PE'),
                        mes,
                        dia,
                        ruc,
                        anio
                    });
                    return;
                }

                const joinCampo = (mapper) => detalles
                    .map(mapper)
                    .filter((v) => v != null && String(v).trim() !== '')
                    .join(' | ');

                const sumCampo = (mapper) => detalles.reduce((acc, d) => {
                    const n = Number(mapper(d));
                    return acc + (Number.isFinite(n) ? n : 0);
                }, 0);

                rows.push({
                    key: `${nota.id}`,
                    ingresoId: nota.id,
                    codigo: joinCampo((d) => d.producto?.codigo || '-'),
                    producto: joinCampo((d) => d.producto?.descripcion || '-'),
                    lote: joinCampo((d) => d.lote_numero || '-'),
                    vencimiento: joinCampo((d) => d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-'),
                    um: joinCampo((d) => d.um || d.producto?.unidad_medida || '-'),
                    fabricante: joinCampo((d) => d.fabricante || d.producto?.fabricante || '-'),
                    temperatura: joinCampo((d) => {
                        const min = d.temperatura_min_c ?? d.producto?.temperatura_min_c;
                        const max = d.temperatura_max_c ?? d.producto?.temperatura_max_c;
                        return (min != null || max != null) ? `${min ?? '-'} a ${max ?? '-'}` : '-';
                    }),
                    cantBulto: sumCampo((d) => d.cantidad_bultos).toFixed(0),
                    cantCajas: sumCampo((d) => d.cantidad_cajas).toFixed(0),
                    cantPorCaja: sumCampo((d) => d.cantidad_por_caja).toFixed(0),
                    cantFraccion: sumCampo((d) => d.cantidad_fraccion).toFixed(0),
                    cantTotal: sumCampo((d) => d.cantidad_total ?? d.cantidad).toFixed(2),
                    fechaIngreso: new Date(nota.fecha).toLocaleDateString('es-PE'),
                    mes,
                    dia,
                    ruc,
                    anio
                });
            });

            setDetalleRows(rows);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
            setDetalleRows([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDescargarPdf = (ingresoId) => {
        if (!ingresoId) return;
        const pdfUrl = `${API_ORIGIN}/api/ingresos/${ingresoId}/pdf`;
        const opened = window.open(pdfUrl, '_blank');
        if (!opened) {
            alert('No se pudo abrir el PDF. Verifica bloqueadores de ventanas emergentes.');
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
                <Button onClick={() => navigate('/ingresos/nuevo')} className="bg-purple-600 hover:bg-purple-700 text-white">
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
                ) : detalleRows.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No hay registros de ingreso</div>
                ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Cod. Producto</th>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Lote</th>
                                        <th className="px-4 py-3">Fecha Vcto</th>
                                        <th className="px-4 py-3">UM</th>
                                        <th className="px-4 py-3">Fabr.</th>
                                        <th className="px-4 py-3">Temp.</th>
                                        <th className="px-4 py-3">Cant.Bulto</th>
                                        <th className="px-4 py-3">Cant.Cajas</th>
                                        <th className="px-4 py-3">Cant x Caja</th>
                                        <th className="px-4 py-3">Cant.Fracción</th>
                                        <th className="px-4 py-3">Cant.Total_Ingreso</th>
                                        <th className="px-4 py-3">Fecha de H_Ingreso</th>
                                        <th className="px-4 py-3">MES</th>
                                        <th className="px-4 py-3">DIA</th>
                                        <th className="px-4 py-3">RUC</th>
                                        <th className="px-4 py-3">AÑO</th>
                                        <th className="px-4 py-3 text-center">PDF</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {detalleRows.map((row) => (
                                        <tr key={row.key} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-2 font-mono text-xs">{row.codigo}</td>
                                            <td className="px-4 py-2 font-medium text-slate-700">{row.producto}</td>
                                            <td className="px-4 py-2">{row.lote}</td>
                                            <td className="px-4 py-2">{row.vencimiento}</td>
                                            <td className="px-4 py-2">{row.um}</td>
                                            <td className="px-4 py-2">{row.fabricante}</td>
                                            <td className="px-4 py-2">{row.temperatura}</td>
                                            <td className="px-4 py-2">{row.cantBulto}</td>
                                            <td className="px-4 py-2">{row.cantCajas}</td>
                                            <td className="px-4 py-2">{row.cantPorCaja}</td>
                                            <td className="px-4 py-2">{row.cantFraccion}</td>
                                            <td className="px-4 py-2 font-semibold text-blue-600">{row.cantTotal}</td>
                                            <td className="px-4 py-2">{row.fechaIngreso}</td>
                                            <td className="px-4 py-2">{row.mes}</td>
                                            <td className="px-4 py-2">{row.dia}</td>
                                            <td className="px-4 py-2">{row.ruc}</td>
                                            <td className="px-4 py-2">{row.anio}</td>
                                            <td className="px-4 py-2 text-center">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="text-xs"
                                                    onClick={() => handleDescargarPdf(row.ingresoId)}
                                                >
                                                    PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

