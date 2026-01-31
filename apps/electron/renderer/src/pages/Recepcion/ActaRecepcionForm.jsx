import React, { useState, useEffect } from 'react';
import { actasService } from '../../services/actas.service';
import { ingresosService } from '../../services/ingresos.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export const ActaRecepcionForm = () => {
    const [ingresos, setIngresos] = useState([]);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        cargarIngresos();
    }, []);

    const cargarIngresos = async () => {
        try {
            const response = await ingresosService.listar({ estado: 'APROBADA' });
            setIngresos(response.data || []);
        } catch (error) {
            console.error('Error al cargar ingresos:', error);
        }
    };

    const handleSelectIngreso = async (ingresoId) => {
        try {
            const response = await ingresosService.obtener(ingresoId);
            setIngresoSeleccionado(response.data);
            // Mapear detalles del ingreso para pre-llenarlos
            const detallesMapeados = (response.data.detalles || []).map((d, idx) => ({
                ...d,
                cantidad_esperada: d.cantidad,
                cantidad_recibida: d.cantidad,
                diferencia: 0,
                id: `detalle-${idx}`
            }));
            setDetalles(detallesMapeados);
        } catch (error) {
            console.error('Error al cargar ingreso:', error);
        }
    };

    const handleCantidadRecibida = (index, valor) => {
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index].cantidad_recibida = parseInt(valor);
        nuevosDetalles[index].diferencia = nuevosDetalles[index].cantidad_recibida - nuevosDetalles[index].cantidad_esperada;
        setDetalles(nuevosDetalles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ingresoSeleccionado || detalles.length === 0) {
            setMensaje('Por favor completa todos los campos');
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
                    fecha_vencimiento: d.fecha_vencimiento,
                    cantidad_esperada: d.cantidad_esperada,
                    cantidad_recibida: d.cantidad_recibida
                }))
            };
            await actasService.crear(data);
            setMensaje('✅ Acta de recepción creada exitosamente');
            setIngresoSeleccionado(null);
            setDetalles([]);
        } catch (error) {
            setMensaje('❌ Error al crear acta de recepción');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2>Nueva Acta de Recepción</h2>

            {mensaje && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    backgroundColor: mensaje.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: mensaje.includes('✅') ? '#155724' : '#721c24'
                }}>
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label>Seleccionar Nota de Ingreso</label>
                    <select
                        onChange={(e) => handleSelectIngreso(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }}
                    >
                        <option value="">-- Seleccionar --</option>
                        {ingresos.map(ingreso => (
                            <option key={ingreso.id} value={ingreso.id}>
                                {ingreso.numero_ingreso} - {ingreso.proveedor} ({new Date(ingreso.fecha).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>

                {ingresoSeleccionado && detalles.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h3>Comparar Cantidades</h3>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Producto ID</TableHeader>
                                    <TableHeader>Lote</TableHeader>
                                    <TableHeader>Esperado</TableHeader>
                                    <TableHeader>Recibido</TableHeader>
                                    <TableHeader>Diferencia</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detalles.map((detalle, idx) => (
                                    <TableRow key={detalle.id}>
                                        <TableCell>{detalle.producto_id}</TableCell>
                                        <TableCell>{detalle.lote_numero}</TableCell>
                                        <TableCell>{detalle.cantidad_esperada}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={detalle.cantidad_recibida}
                                                onChange={(e) => handleCantidadRecibida(idx, e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        </TableCell>
                                        <TableCell style={{
                                            color: detalle.diferencia > 0 ? 'green' : detalle.diferencia < 0 ? 'red' : 'black',
                                            fontWeight: 'bold'
                                        }}>
                                            {detalle.diferencia > 0 ? '+' : ''}{detalle.diferencia}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="submit" disabled={loading || !ingresoSeleccionado}>
                        {loading ? 'Guardando...' : 'Guardar Acta de Recepción'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
