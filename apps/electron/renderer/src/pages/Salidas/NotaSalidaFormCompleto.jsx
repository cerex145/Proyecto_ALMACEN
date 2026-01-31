import React, { useState, useEffect } from 'react';
import { salidasService } from '../../services/salidas.service';
import { product } from '../../services/product.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export const NotaSalidaFormCompleto = () => {
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [detalles, setDetalles] = useState([]);
    const [detalleActual, setDetalleActual] = useState({
        producto_id: '',
        cantidad: ''
    });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        cargarClientes();
        cargarProductos();
    }, []);

    const cargarClientes = async () => {
        try {
            // Asumir que existe un servicio de clientes
            // const response = await clientesService.listar();
            // setClientes(response.data || []);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    const cargarProductos = async () => {
        try {
            // const response = await product.listar();
            // setProductos(response.data || []);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    };

    const agregarDetalle = () => {
        if (!detalleActual.producto_id || !detalleActual.cantidad) {
            setMensaje('Por favor completa los campos requeridos');
            return;
        }
        setDetalles(prev => [...prev, { ...detalleActual, id: Date.now() }]);
        setDetalleActual({ producto_id: '', cantidad: '' });
    };

    const eliminarDetalle = (id) => {
        setDetalles(prev => prev.filter(d => d.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clienteSeleccionado || detalles.length === 0) {
            setMensaje('Por favor completa todos los campos requeridos');
            return;
        }

        try {
            setLoading(true);
            const data = {
                cliente_id: clienteSeleccionado,
                fecha: new Date().toISOString().split('T')[0],
                detalles: detalles.map(d => ({
                    producto_id: parseInt(d.producto_id),
                    cantidad: parseInt(d.cantidad)
                }))
            };
            await salidasService.crear(data);
            setMensaje('✅ Nota de salida creada exitosamente');
            setClienteSeleccionado('');
            setDetalles([]);
        } catch (error) {
            setMensaje('❌ Error al crear nota de salida. ' + (error.response?.data?.message || ''));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2>Nueva Nota de Salida</h2>

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
                    <label>Cliente</label>
                    <select
                        value={clienteSeleccionado}
                        onChange={(e) => setClienteSeleccionado(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', marginTop: '5px' }}
                        required
                    >
                        <option value="">-- Seleccionar Cliente --</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.razon_social} ({cliente.codigo})
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h3>Agregar Productos</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                            <label>Producto</label>
                            <select
                                value={detalleActual.producto_id}
                                onChange={(e) => setDetalleActual({ ...detalleActual, producto_id: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="">-- Seleccionar --</option>
                                {productos.map(producto => (
                                    <option key={producto.id} value={producto.id}>
                                        {producto.descripcion} (Stock: {producto.stock_actual})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Cantidad</label>
                            <Input
                                type="number"
                                placeholder="Cantidad"
                                value={detalleActual.cantidad}
                                onChange={(e) => setDetalleActual({ ...detalleActual, cantidad: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button type="button" onClick={agregarDetalle} variant="secondary">
                                + Agregar
                            </Button>
                        </div>
                    </div>

                    {detalles.length > 0 && (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Producto ID</TableHeader>
                                    <TableHeader>Cantidad</TableHeader>
                                    <TableHeader>Acción</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detalles.map((detalle) => (
                                    <TableRow key={detalle.id}>
                                        <TableCell>{detalle.producto_id}</TableCell>
                                        <TableCell>{detalle.cantidad}</TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => eliminarDetalle(detalle.id)}
                                            >
                                                Eliminar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Salida'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
