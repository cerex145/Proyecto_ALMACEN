import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { API_ORIGIN } from '../../services/api';

export const HistorialSalidasFuncional = () => {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [detalleRows, setDetalleRows] = useState([]);
    const requestSeqRef = useRef(0);
    const activeControllerRef = useRef(null);
    const navigate = useNavigate();

    const formatearFecha = (valor) => {
        if (!valor) return '-';
        const texto = String(valor);
        const fechaSolo = texto.slice(0, 10);
        const m = fechaSolo.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            const [, y, mo, d] = m;
            return `${d}/${mo}/${y}`;
        }
        const fecha = new Date(valor);
        return Number.isNaN(fecha.getTime()) ? '-' : fecha.toLocaleDateString('es-PE');
    };

    useEffect(() => {
        cargarSalidas();
    }, [filtro]);

    useEffect(() => {
        return () => {
            if (activeControllerRef.current) {
                activeControllerRef.current.abort();
            }
        };
    }, []);

    const cargarSalidas = async () => {
        const requestId = ++requestSeqRef.current;
        if (activeControllerRef.current) {
            activeControllerRef.current.abort();
        }
        const controller = new AbortController();
        activeControllerRef.current = controller;

        try {
            setLoading(true);
            const query = new URLSearchParams({ limit: '8000' });
            if (filtro) query.set('q', filtro);
            const params = `?${query.toString()}`;
            const response = await fetch(`${API_ORIGIN}/api/salidas/historial${params}`, {
                cache: 'no-store',
                signal: controller.signal
            });
            const result = await response.json();
            if (requestId !== requestSeqRef.current) return;
            const filas = result.data || [];
            setSalidas([]);

            const rows = [];
            filas.forEach((fila, index) => {
                const fechaObj = new Date(fila.fecha);
                const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
                const dia = String(fechaObj.getDate()).padStart(2, '0');
                const anio = String(fechaObj.getFullYear());
                const fmt = (v) => (v == null || v === '') ? '-' : parseFloat(v).toFixed(2);
                rows.push({
                    key: `${fila.nota_id}-${fila.detalle_id}-${index}`,
                    notaId: fila.nota_id,
                    numeroSalida: fila.numero_salida || '-',
                    codigo: fila.producto_codigo || '-',
                    producto: fila.producto_descripcion || '-',
                    lote: fila.lote_numero || '-',
                    vencimiento: formatearFecha(fila.fecha_vencimiento),
                    um: fila.um || fila.producto_unidad_medida || '-',
                    cantBulto: fmt(fila.cant_bulto),
                    cantCajas: fmt(fila.cant_caja),
                    cantPorCaja: fmt(fila.cant_x_caja),
                    cantFraccion: fmt(fila.cant_fraccion),
                    cantTotal: fmt(fila.cantidad_total ?? fila.cantidad),
                    fechaSalida: formatearFecha(fila.fecha),
                    mes,
                    dia,
                    ruc: fila.cliente_ruc || '-',
                    anio
                });
            });
            setDetalleRows(rows);
        } catch (error) {
            if (error?.name === 'AbortError') return;
            if (requestId !== requestSeqRef.current) return;
            console.error('Error al cargar salidas:', error);
            setDetalleRows([]);
        } finally {
            if (requestId !== requestSeqRef.current) return;
            setLoading(false);
        }
    };

    const handleDescargarPdf = async (notaId) => {
        if (!notaId) return;
        const pdfUrl = `${API_ORIGIN}/api/salidas/${notaId}/pdf`;
        try {
            if (window.electron?.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('open-external', pdfUrl);
            } else {
                const opened = window.open(pdfUrl, '_blank');
                if (!opened) {
                    alert('No se pudo abrir el PDF. Verifica bloqueadores de ventanas emergentes.');
                }
            }
        } catch (error) {
            console.error('Error al abrir PDF de salida:', error);
            alert('Error al abrir PDF de salida.');
        }
    };

    const handleEditarSalida = (notaId) => {
        if (!notaId) return;
        navigate(`/salidas/editar/${notaId}`);
    };

    const handleCancelarSalida = async (notaId) => {
        if (!notaId) return;
        
        const confirmacion = window.confirm(
            '¿Está seguro de que desea cancelar esta nota de salida?\n\nEsta acción revertirá todos los cambios en la base de datos (Kardex, lotes, stock).'
        );
        
        if (!confirmacion) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_ORIGIN}/api/salidas/${notaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert('✅ ' + (data.message || 'Nota de salida cancelada exitosamente'));
                cargarSalidas();
            } else {
                const error = await response.json();
                alert('❌ Error: ' + (error.error || 'Error al cancelar la nota'));
            }
        } catch (error) {
            console.error('Error al cancelar salida:', error);
            alert('❌ Error de conexión al cancelar la nota');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">📦 Historial de Salidas</h1>
                    <p className="text-slate-500">Consulta y descarga de movimientos de salida</p>
                </div>
                <Button onClick={() => navigate('/salidas/nuevo')} className="bg-purple-600 hover:bg-purple-700 text-white">
                    + Nueva Nota de Salida
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex gap-4 items-end mb-6">
                    <div className="flex-1">
                        <label className="label-premium">Buscar por N° salida / Documento / Código / Producto / Lote / Cliente / RUC</label>
                        <Input
                            placeholder="Ej: 53610002, F001-000123, OB0810T, LOTE-01, 00000059"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="input-premium"
                        />
                    </div>
                    <Button onClick={() => setFiltro('')} variant="secondary">Limpiar</Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Cargando salidas...</div>
                ) : detalleRows.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No hay registros de salida</div>
                ) : (
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                        <div className="table-scroll-top">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Cod. Producto</th>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Lote</th>
                                        <th className="px-4 py-3">Fecha Vcto</th>
                                        <th className="px-4 py-3">UM</th>
                                        <th className="px-4 py-3">Cant.Bulto</th>
                                        <th className="px-4 py-3">Cant.Cajas</th>
                                        <th className="px-4 py-3">Cant x Caja</th>
                                        <th className="px-4 py-3">Cant.Fracción</th>
                                        <th className="px-4 py-3">Cant.Total_Salida</th>
                                        <th className="px-4 py-3">Fecha de H_Salida</th>
                                        <th className="px-4 py-3">MES</th>
                                        <th className="px-4 py-3">DIA</th>
                                        <th className="px-4 py-3">RUC</th>
                                        <th className="px-4 py-3">AÑO</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
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
                                            <td className="px-4 py-2">{row.cantBulto}</td>
                                            <td className="px-4 py-2">{row.cantCajas}</td>
                                            <td className="px-4 py-2">{row.cantPorCaja}</td>
                                            <td className="px-4 py-2">{row.cantFraccion}</td>
                                            <td className="px-4 py-2 font-semibold text-blue-600">{row.cantTotal}</td>
                                            <td className="px-4 py-2">{row.fechaSalida}</td>
                                            <td className="px-4 py-2">{row.mes}</td>
                                            <td className="px-4 py-2">{row.dia}</td>
                                            <td className="px-4 py-2">{row.ruc}</td>
                                            <td className="px-4 py-2">{row.anio}</td>
                                            <td className="px-4 py-2 text-center flex gap-2 justify-center">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleDescargarPdf(row.notaId)}
                                                >
                                                    PDF
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => handleEditarSalida(row.notaId)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                    onClick={() => handleCancelarSalida(row.notaId)}
                                                >
                                                    Cancelar
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
