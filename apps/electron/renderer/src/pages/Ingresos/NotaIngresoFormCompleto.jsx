import React, { useState, useRef } from 'react';
import { ingresosService } from '../../services/ingresos.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/ui/Table';

export const NotaIngresoForm = () => {
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        proveedor: '',
        detalles: []
    });
    const [detalleActual, setDetalleActual] = useState({
        producto_id: '',
        lote_numero: '',
        fecha_vencimiento: '',
        cantidad: '',
        precio_unitario: ''
    });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetalleChange = (e) => {
        const { name, value } = e.target;
        setDetalleActual(prev => ({ ...prev, [name]: value }));
    };

    const agregarDetalle = () => {
        if (!detalleActual.producto_id || !detalleActual.cantidad) {
            setMensaje('Por favor completa los campos requeridos');
            return;
        }
        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, { ...detalleActual, id: Date.now() }]
        }));
        setDetalleActual({
            producto_id: '',
            lote_numero: '',
            fecha_vencimiento: '',
            cantidad: '',
            precio_unitario: ''
        });
    };

    const eliminarDetalle = (id) => {
        setFormData(prev => ({
            ...prev,
            detalles: prev.detalles.filter(d => d.id !== id)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.proveedor || formData.detalles.length === 0) {
            setMensaje('Por favor completa todos los campos requeridos');
            return;
        }

        try {
            setLoading(true);
            await ingresosService.crear(formData);
            setMensaje('✅ Nota de ingreso creada exitosamente');
            setFormData({
                fecha: new Date().toISOString().split('T')[0],
                proveedor: '',
                detalles: []
            });
        } catch (error) {
            setMensaje('❌ Error al crear la nota de ingreso');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImportar = async (e) => {
        const archivo = e.target.files?.[0];
        if (!archivo) return;

        try {
            setLoading(true);
            const response = await ingresosService.importar(archivo);
            setMensaje('✅ Archivo importado correctamente');
            // Aquí podrías procesar la respuesta
        } catch (error) {
            setMensaje('❌ Error al importar archivo');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDescargarPlantilla = async () => {
        try {
            const blob = await ingresosService.descargarPlantilla();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantilla_ingresos.xlsx';
            a.click();
        } catch (error) {
            console.error('Error al descargar plantilla:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2>Nueva Nota de Ingreso</h2>

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
                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label>Fecha</label>
                        <Input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Proveedor</label>
                        <Input
                            name="proveedor"
                            placeholder="Nombre del proveedor"
                            value={formData.proveedor}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h3>Agregar Productos</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        <div>
                            <label>Producto ID</label>
                            <Input
                                name="producto_id"
                                type="number"
                                placeholder="ID del producto"
                                value={detalleActual.producto_id}
                                onChange={handleDetalleChange}
                            />
                        </div>
                        <div>
                            <label>Lote</label>
                            <Input
                                name="lote_numero"
                                placeholder="Número de lote"
                                value={detalleActual.lote_numero}
                                onChange={handleDetalleChange}
                            />
                        </div>
                        <div>
                            <label>Fecha Vencimiento</label>
                            <Input
                                name="fecha_vencimiento"
                                type="date"
                                value={detalleActual.fecha_vencimiento}
                                onChange={handleDetalleChange}
                            />
                        </div>
                        <div>
                            <label>Cantidad</label>
                            <Input
                                name="cantidad"
                                type="number"
                                placeholder="Cantidad"
                                value={detalleActual.cantidad}
                                onChange={handleDetalleChange}
                            />
                        </div>
                        <div>
                            <label>Precio Unitario</label>
                            <Input
                                name="precio_unitario"
                                type="number"
                                step="0.01"
                                placeholder="Precio"
                                value={detalleActual.precio_unitario}
                                onChange={handleDetalleChange}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button type="button" onClick={agregarDetalle} variant="secondary">
                                + Agregar
                            </Button>
                        </div>
                    </div>

                    {formData.detalles.length > 0 && (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Producto ID</TableHeader>
                                    <TableHeader>Lote</TableHeader>
                                    <TableHeader>Vencimiento</TableHeader>
                                    <TableHeader>Cantidad</TableHeader>
                                    <TableHeader>Precio</TableHeader>
                                    <TableHeader>Acción</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formData.detalles.map((detalle) => (
                                    <TableRow key={detalle.id}>
                                        <TableCell>{detalle.producto_id}</TableCell>
                                        <TableCell>{detalle.lote_numero}</TableCell>
                                        <TableCell>{detalle.fecha_vencimiento}</TableCell>
                                        <TableCell>{detalle.cantidad}</TableCell>
                                        <TableCell>${parseFloat(detalle.precio_unitario).toFixed(2)}</TableCell>
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

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Ingreso'}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Importar desde Excel
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleDescargarPlantilla}
                    >
                        Descargar Plantilla
                    </Button>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleImportar}
                />
            </form>
        </div>
    );
};
