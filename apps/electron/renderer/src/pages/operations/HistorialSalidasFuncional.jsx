import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { clientesService } from '../../services/clientes.service';

export const HistorialSalidasFuncional = () => {
    const [salidas, setSalidas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [detalleRows, setDetalleRows] = useState([]);
    const [clientesMap, setClientesMap] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        cargarClientes();
    }, []);

    useEffect(() => {
        cargarSalidas();
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

    const cargarSalidas = async () => {
        try {
            setLoading(true);
            const params = filtro ? `?numero_salida=${filtro}` : '';
            const response = await fetch(`http://localhost:3000/api/salidas${params}`);
            const result = await response.json();
            const notas = result.data || [];
            setSalidas(notas);

            const detallesResponses = await Promise.all(
                notas.map(async (nota) => {
                    try {
                        const detRes = await fetch(`http://localhost:3000/api/salidas/${nota.id}`);
                        const detJson = await detRes.json();
                        return detJson?.data || { detalles: [], cliente: null };
                    } catch (err) {
                        console.error('Error al cargar detalles:', err);
                        return { detalles: [], cliente: null };
                    }
                })
            );

            const rows = [];
            detallesResponses.forEach((data, idx) => {
                const nota = notas[idx];
                const fechaObj = new Date(nota.fecha);
                const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
                const dia = String(fechaObj.getDate()).padStart(2, '0');
                const anio = String(fechaObj.getFullYear());
                const ruc = clientesMap[String(nota.cliente_id)] || data?.cliente?.cuit || '-';
                const detalles = data?.detalles || [];

                if (detalles.length === 0) {
                    rows.push({
                        key: `${nota.id}-empty`,
                        codigo: '-',
                        producto: '-',
                        lote: '-',
                        vencimiento: '-',
                        um: '-',
                        cantBulto: '-',
                        cantCajas: '-',
                        cantPorCaja: '-',
                        cantFraccion: '-',
                        cantTotal: '-',
                        fechaSalida: new Date(nota.fecha).toLocaleDateString('es-PE'),
                        mes,
                        dia,
                        ruc,
                        anio
                    });
                    return;
                }

                detalles.forEach((d, index) => {
                    const fmt = (v) => (v != null && Number(v) !== 0) ? parseFloat(v).toFixed(2) : '-';
                    rows.push({
                        key: `${nota.id}-${index}`,
                        codigo: d.producto?.codigo || '-',
                        producto: d.producto?.descripcion || '-',
                        lote: d.lote_numero || '-',
                        vencimiento: d.fecha_vencimiento ? new Date(d.fecha_vencimiento).toLocaleDateString('es-PE') : '-',
                        um: d.um || d.producto?.um || '-',
                        cantBulto: fmt(d.cantidad_bultos),
                        cantCajas: fmt(d.cantidad_cajas),
                        cantPorCaja: fmt(d.cantidad_por_caja),
                        cantFraccion: fmt(d.cantidad_fraccion),
                        cantTotal: d.cantidad_total ?? d.cantidad ?? '-',
                        fechaSalida: new Date(nota.fecha).toLocaleDateString('es-PE'),
                        mes,
                        dia,
                        ruc,
                        anio
                    });
                });
            });

            setDetalleRows(rows);
        } catch (error) {
            console.error('Error al cargar salidas:', error);
            setDetalleRows([]);
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
                ) : detalleRows.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No hay registros de salida</div>
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
