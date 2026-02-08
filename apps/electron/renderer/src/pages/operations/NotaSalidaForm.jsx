import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { Button } from '../../components/common/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { SelectorLote } from './SelectorLote';
import { Card } from '../../components/common/Card';

import { clientesService } from '../../services/clientes.service';

export const NotaSalidaForm = () => {
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            cliente_id: '',
            fecha: new Date().toISOString().split('T')[0],
            responsable_id: 1, // Mock ID
            detalles: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles"
    });

    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);

    // Temporary state for adding a product line
    const [addItem, setAddItem] = useState({
        productId: '',
        quantity: '',
        selections: {} // { loteId: quantity }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load Products
        try {
            const productsResponse = await productService.getProducts();
            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Error al cargar lista de Productos.');
        }

        // Load Clients
        try {
            const clientsResponse = await clientesService.listar();
            const clientsArray = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse.data || []);
            setClients(clientsArray);
        } catch (error) {
            console.error('Error loading clients:', error);
            alert('Error al cargar lista de Clientes.');
        }
    };

    const handleLoteSelection = (selections) => {
        setAddItem(prev => ({ ...prev, selections }));
    };

    const handleAddLine = () => {
        const { productId, quantity, selections } = addItem;
        if (!productId || !quantity || Object.keys(selections).length === 0) {
            alert("Complete la selección de producto y lotes");
            return;
        }

        const totalSelected = Object.values(selections).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.abs(totalSelected - parseFloat(quantity)) > 0.01) {
            alert("La suma de lotes seleccionados debe ser igual a la cantidad total");
            return;
        }

        const product = products.find(p => p.id === parseInt(productId));

        // Create a flat list of details (one row per LOT used)
        Object.entries(selections).forEach(([loteId, qty]) => {
            if (qty > 0) {
                append({
                    producto_id: parseInt(productId),
                    producto_nombre: product.descripcion,
                    lote_id: parseInt(loteId),
                    cantidad: parseFloat(qty)
                });
            }
        });

        // Reset add form
        setAddItem({ productId: '', quantity: '', selections: {} });
    };

    const onSubmit = async (data) => {
        // Data contains 'detalles' which is already a list of { producto_id, lote_id, cantidad }
        // This matches the backend expectation for bulk insert or transaction
        try {
            await operationService.createSalida(data);
            alert('Salida registrada correctamente');
            reset();
        } catch (error) {
            console.error(error);
            alert('Error al registrar salida');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Registro de Salida</h2>
                    <p className="text-slate-500">Venta, Traslado o Baja de Mercadería</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Datos Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Número de Salida</label>
                            <input
                                type="text"
                                className="input-premium bg-slate-50"
                                placeholder="Se genera automáticamente"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="label-premium">Fecha</label>
                            <input
                                {...register('fecha', { required: 'Requerido' })}
                                type="date"
                                className="input-premium"
                            />
                        </div>
                        <div>
                            <label className="label-premium">Cliente / Destino</label>
                            <select
                                {...register('cliente_id', { required: 'Requerido' })}
                                className="input-premium"
                            >
                                <option value="">Seleccione cliente...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.razon_social} (RUC: {client.cuit})
                                    </option>
                                ))}
                            </select>
                            {errors.cliente_id && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                    </div>
                </Card>

                {/* Add Product Section */}
                <Card className="p-6 bg-orange-50/50 border-orange-100">
                    <h4 className="text-lg font-semibold text-orange-800 mb-4">Selección de Producto y Lotes (FEFO)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                        <div className="md:col-span-2">
                            <label className="label-premium">Producto</label>
                            <select
                                value={addItem.productId}
                                onChange={(e) => setAddItem({ ...addItem, productId: e.target.value, selections: {} })}
                                className="input-premium"
                            >
                                <option value="">Seleccione...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.descripcion} (Stock: {p.stock_actual})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Cantidad Total</label>
                            <input
                                type="number"
                                value={addItem.quantity}
                                onChange={(e) => setAddItem({ ...addItem, quantity: e.target.value })}
                                className="input-premium"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Selector Component - Shows only when product & qty are present */}
                    {addItem.productId && addItem.quantity > 0 && (
                        <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm mb-4">
                            <SelectorLote
                                productId={addItem.productId}
                                quantityRequired={parseFloat(addItem.quantity)}
                                onSelectionChange={handleLoteSelection}
                            />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="button" onClick={handleAddLine} disabled={!addItem.productId} variant="primary">
                            + Agregar a la Lista
                        </Button>
                    </div>
                </Card>

                {/* List of items to save */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Producto</TableHeader>
                                <TableHeader>Lote ID</TableHeader>
                                <TableHeader>Cantidad</TableHeader>
                                <TableHeader>Acción</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id}>
                                    <TableCell>{field.producto_nombre}</TableCell>
                                    <TableCell><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{field.lote_id}</span></TableCell>
                                    <TableCell><strong>{field.cantidad}</strong></TableCell>
                                    <TableCell>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700 font-medium text-xs"
                                        >
                                            Quitar
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {fields.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                                        No hay productos seleccionados para salida.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                    <Button type="submit" isLoading={isSubmitting} disabled={fields.length === 0} size="lg" className="btn-gradient-primary">
                        Procesar Salida
                    </Button>
                </div>
            </form>
        </div>
    );
};
