import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';
import { SelectorLote } from './SelectorLote';

export const NotaSalidaForm = () => {
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            cliente_id: '',
            fecha: new Date().toISOString().split('T')[0],
            numero_salida: '',
            responsable_id: 1, // Mock ID
            detalles: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles"
    });

    const [products, setProducts] = useState([]);
    // Temporary state for adding a product line
    const [addItem, setAddItem] = useState({
        productId: '',
        quantity: '',
        selections: {} // { loteId: quantity }
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
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
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Registro de Salida (Venta/Traslado)</h2>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="Número de Salida"
                        register={register('numero_salida', { required: 'Requerido' })}
                        error={errors.numero_salida}
                    />
                    <Input
                        label="Fecha"
                        type="date"
                        register={register('fecha', { required: 'Requerido' })}
                        error={errors.fecha}
                    />
                </div>

                <Input
                    label="Cliente / Destino (ID)"
                    register={register('cliente_id', { required: 'Requerido' })}
                    error={errors.cliente_id}
                />

                {/* Add Product Section */}
                <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '8px', background: 'var(--surface-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ marginTop: 0 }}>Agregar Producto</h4>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>Producto</label>
                            <select
                                value={addItem.productId}
                                onChange={(e) => setAddItem({ ...addItem, productId: e.target.value, selections: {} })}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Seleccione...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.descripcion} (Stock: {p.stock_actual})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>Cantidad Total</label>
                            <input
                                type="number"
                                value={addItem.quantity}
                                onChange={(e) => setAddItem({ ...addItem, quantity: e.target.value })}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                    </div>

                    {/* Selector Component - Shows only when product & qty are present */}
                    {addItem.productId && addItem.quantity > 0 && (
                        <SelectorLote
                            productId={addItem.productId}
                            quantityRequired={parseFloat(addItem.quantity)}
                            onSelectionChange={handleLoteSelection}
                        />
                    )}

                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                        <Button type="button" onClick={handleAddLine} disabled={!addItem.productId}>
                            Agregar a la Lista
                        </Button>
                    </div>
                </div>

                {/* List of items to save */}
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
                                <TableCell>{field.lote_id}</TableCell>
                                <TableCell>{field.cantidad}</TableCell>
                                <TableCell>
                                    <Button variant="danger" size="small" onClick={() => remove(index)}>Quitar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button type="submit" isLoading={isSubmitting} disabled={fields.length === 0}>
                        Procesar Salida
                    </Button>
                </div>
            </form>
        </div>
    );
};
