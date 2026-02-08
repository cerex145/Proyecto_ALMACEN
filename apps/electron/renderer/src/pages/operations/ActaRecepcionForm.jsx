import React, { useState, useEffect } from 'react';
import { actasService } from '../../services/actas.service';
import { ingresosService } from '../../services/ingresos.service';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const ActaRecepcionForm = () => {
    const [ingresos, setIngresos] = useState([]);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        cargarIngresosPendientes();
    }, []);

    const cargarIngresosPendientes = async () => {
        try {
            // FIX: Load REGISTRADA instead of APROBADA. 
            // The flow is: Ingreso (Registrada) -> Acta (Confirms it) -> Ingreso (Recibida)
            const response = await ingresosService.listar({ estado: 'REGISTRADA' });
            setIngresos(response.data || []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        }
    };

    const handleSelectIngreso = async (ingresoId) => {
        if (!ingresoId) {
            setIngresoSeleccionado(null);
            setDetalles([]);
            return;
        }

        try {
            const response = await ingresosService.obtener(ingresoId);
            setIngresoSeleccionado(response.data);

            // Map details for verification
            const detallesMapeados = (response.data.detalles || []).map((d, idx) => ({
                ...d,
                cantidad_esperada: d.cantidad,
                cantidad_recibida: d.cantidad, // Default to same quantity
                diferencia: 0,
                id: `detalle-${idx}` // Temp ID for UI key
            }));
            setDetalles(detallesMapeados);
        } catch (error) {
            console.error('Error al cargar ingreso:', error);
        }
    };

    const handleCantidadRecibida = (index, valor) => {
        const nuevosDetalles = [...detalles];
        const val = valor === '' ? 0 : parseFloat(valor);
        nuevosDetalles[index].cantidad_recibida = val;
        nuevosDetalles[index].diferencia = val - nuevosDetalles[index].cantidad_esperada;
        setDetalles(nuevosDetalles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ingresoSeleccionado || detalles.length === 0) {
            setMensaje({ type: 'error', text: 'Por favor completa todos los campos' });
            return;
        }

        try {
            setLoading(true);
            const data = {
                nota_ingreso_id: ingresoSeleccionado.id,
                fecha_recepcion: new Date().toISOString().split('T')[0],
                detalles: detalles.map(d => ({
                    producto_id: d.producto_id,
                    lote_numero: d.lote_numero,
                    cantidad_esperada: d.cantidad_esperada,
                    cantidad_recibida: d.cantidad_recibida,
                    observaciones: d.diferencia !== 0 ? 'Diferencia detectada' : 'Conforme'
                }))
            };

            await actasService.crear(data);
            setMensaje({ type: 'success', text: 'Acta de recepción creada exitosamente. Stock actualizado.' });

            // Cleanup
            setIngresoSeleccionado(null);
            setDetalles([]);
            cargarIngresosPendientes(); // Refresh list

        } catch (error) {
            setMensaje({ type: 'error', text: 'Error al crear acta: ' + error.message });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Control de Recepción (Calidad)</h2>
                <p className="text-slate-500">Verificación física contra Notas de Ingreso registradas</p>
            </div>

            {mensaje && (
                <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${mensaje.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {mensaje.text}
                </div>
            )}

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label-premium">Seleccionar Ingreso Pendiente</label>
                        <select
                            onChange={(e) => handleSelectIngreso(e.target.value)}
                            className="input-premium"
                        >
                            <option value="">-- Seleccione una Nota de Ingreso --</option>
                            {ingresos.map(ingreso => (
                                <option key={ingreso.id} value={ingreso.id}>
                                    {ingreso.numero_ingreso} — {ingreso.proveedor} ({new Date(ingreso.fecha).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                        {ingresos.length === 0 && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ No hay ingresos pendientes de recepción.</p>
                        )}
                    </div>

                    {ingresoSeleccionado && detalles.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">02</span>
                                Verificar Cantidades
                            </h3>

                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Producto</th>
                                            <th className="px-6 py-4">Lote</th>
                                            <th className="px-6 py-4 text-center">Esperado</th>
                                            <th className="px-6 py-4 text-center w-32">Recibido (Real)</th>
                                            <th className="px-6 py-4 text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {detalles.map((detalle, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-3 font-medium text-slate-700">
                                                    {detalle.producto?.descripcion || `ID: ${detalle.producto_id}`}
                                                </td>
                                                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{detalle.lote_numero}</td>
                                                <td className="px-6 py-3 text-center text-slate-600">{detalle.cantidad_esperada}</td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="number"
                                                        value={detalle.cantidad_recibida}
                                                        onChange={(e) => handleCantidadRecibida(idx, e.target.value)}
                                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    />
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {detalle.diferencia === 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Conforme
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                            {detalle.diferencia > 0 ? `+${detalle.diferencia} Sobrante` : `${detalle.diferencia} Faltante`}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading || !ingresoSeleccionado}
                            size="lg"
                            className="btn-gradient-primary shadow-lg shadow-blue-500/30"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Recepción y Actualizar Stock'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
