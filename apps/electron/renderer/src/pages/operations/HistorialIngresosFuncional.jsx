import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { API_ORIGIN } from '../../services/api';

import RegistrarIngreso from './RegistrarIngreso';
import { clientesService } from '../../services/clientes.service';

const getDetalleProductoNombre = (detalle) => (
    (() => {
        const descripcion = String(
            detalle?.producto_nombre
            || detalle?.producto?.descripcion
            || detalle?.producto?.nombre
            || ''
        ).trim();
        const codigo = String(detalle?.producto?.codigo || detalle?.producto_codigo || '').trim();

        if (descripcion && codigo && descripcion.toUpperCase() === codigo.toUpperCase()) {
            return 'Sin descripcion';
        }

        return descripcion || codigo || '-';
    })()
);

const getDetalleProductoCodigo = (detalle) => (
    detalle?.producto?.codigo
    || detalle?.producto_codigo
    || '-'
);

const getDetalleLote = (detalle) => (
    detalle?.lote_numero
    || detalle?.lote?.numero_lote
    || detalle?.lote_numero_texto
    || '-'
);

const getDetalleVencimiento = (detalle) => {
    const fecha = detalle?.fecha_vencimiento || detalle?.lote?.fecha_vencimiento;
    return fecha ? new Date(fecha).toLocaleDateString('es-PE') : '-';
};

const getDetalleFabricante = (detalle) => (
    detalle?.fabricante
    || detalle?.producto?.fabricante
    || '-'
);

const getDetalleUm = (detalle) => (
    detalle?.um
    || detalle?.producto?.unidad_medida
    || detalle?.producto?.um
    || 'UND'
);

const toNumberSafe = (value, fallback = 0) => {
    const normalized = String(value ?? '').replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const HistorialIngresosFuncional = () => {
    const [, setIngresos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [detalleRows, setDetalleRows] = useState([]);
    const [clientesMap, setClientesMap] = useState({});
    const requestSeqRef = useRef(0);
    const activeControllerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        cargarClientes();
    }, []);

    useEffect(() => {
        cargarIngresos();
    }, [filtro, clientesMap]);

    useEffect(() => {
        return () => {
            if (activeControllerRef.current) {
                activeControllerRef.current.abort();
            }
        };
    }, []);

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
        const requestId = ++requestSeqRef.current;
        if (activeControllerRef.current) {
            activeControllerRef.current.abort();
        }
        const controller = new AbortController();
        activeControllerRef.current = controller;

        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filtro) params.set('numero_ingreso', filtro);
            params.set('include_detalles', 'true');
            params.set('limit', '8000');
            const response = await fetch(`${API_ORIGIN}/api/ingresos?${params.toString()}`, {
                cache: 'no-store',
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}`);
            }
            const result = await response.json();
            if (requestId !== requestSeqRef.current) return;
            const notas = result.data || [];
            setIngresos(notas);

            const rows = [];
            notas.forEach((nota) => {
                const fechaObj = new Date(nota.fecha);
                const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
                const dia = String(fechaObj.getDate()).padStart(2, '0');
                const anio = String(fechaObj.getFullYear());
                const ruc = nota.cliente_ruc || clientesMap[String(nota.cliente_id)] || '-';
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

                detalles.forEach((d, index) => {
                    const min = d.temperatura_min_c ?? d.producto?.temperatura_min_c;
                    const max = d.temperatura_max_c ?? d.producto?.temperatura_max_c;

                    rows.push({
                        key: `${nota.id}-${d.id ?? index}`,
                        ingresoId: nota.id,
                        codigo: getDetalleProductoCodigo(d),
                        producto: getDetalleProductoNombre(d),
                        lote: getDetalleLote(d),
                        vencimiento: getDetalleVencimiento(d),
                        um: getDetalleUm(d),
                        fabricante: getDetalleFabricante(d),
                        temperatura: (min != null || max != null) ? `${min ?? '-'} a ${max ?? '-'}` : '-',
                        cantBulto: toNumberSafe(d.cantidad_bultos).toFixed(0),
                        cantCajas: toNumberSafe(d.cantidad_cajas).toFixed(0),
                        cantPorCaja: toNumberSafe(d.cantidad_por_caja).toFixed(0),
                        cantFraccion: toNumberSafe(d.cantidad_fraccion).toFixed(0),
                        cantTotal: toNumberSafe(d.cantidad_total ?? d.cantidad ?? d.cantidad_inicial ?? d.cantidad_disponible).toFixed(2),
                        fechaIngreso: new Date(nota.fecha).toLocaleDateString('es-PE'),
                        mes,
                        dia,
                        ruc,
                        anio
                    });
                });
            });

            setDetalleRows(rows);
        } catch (error) {
            if (error?.name === 'AbortError') return;
            if (requestId !== requestSeqRef.current) return;
            console.error('Error al cargar ingresos:', error);
            setDetalleRows([]);
        } finally {
            if (requestId !== requestSeqRef.current) return;
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

