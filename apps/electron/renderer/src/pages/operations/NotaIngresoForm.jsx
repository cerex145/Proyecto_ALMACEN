import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';

export const NotaIngresoForm = () => {
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            proveedor_id: '', // Using text for simplicity if no provider list
            fecha: new Date().toISOString().split('T')[0],
            numero_ingreso: '',
            responsable_id: 1, // Mock ID until Auth is implemented
            detalles: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "detalles"
    });

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products', error);
        }
    };

    const handleAddProduct = () => {
        if (!selectedProduct || !quantity) return;
        const product = products.find(p => p.id === parseInt(selectedProduct));
        append({
            producto_id: parseInt(selectedProduct),
            producto_nombre: product.descripcion,
            cantidad: parseFloat(quantity)
        });
        setSelectedProduct('');
        setQuantity('');
    };

    const onSubmit = async (data) => {
        try {
            await operationService.createIngreso(data);
            alert('Nota de Ingreso registrada con éxito');
            reset();
        } catch (error) {
            console.error(error);
            alert('Error al registrar ingreso');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: 'var(--primary-color)' }}>Registro de Nota de Ingreso</h2>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="Número de Ingreso"
                        register={register('numero_ingreso', { required: 'Requerido' })}
                        error={errors.numero_ingreso}
                    />
                    <Input
                        label="Fecha"
                        type="date"
                        register={register('fecha', { required: 'Requerido' })}
                        error={errors.fecha}
                    />
                </div>

                <Input
                    label="Proveedor (ID o Nombre)"
                    register={register('proveedor_id', { required: 'Requerido' })}
                    error={errors.proveedor_id}
                />

                <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', background: 'var(--light-bg)' }}>
                    <h4>Agregar Productos</h4>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>Producto</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            >
                                <option value="">Seleccione un producto</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.descripcion}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 500 }}>Cantidad</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                        <Button type="button" onClick={handleAddProduct}>Agregar</Button>
                    </div>
                </div>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeader>Producto</TableHeader>
                            <TableHeader>Cantidad</TableHeader>
                            <TableHeader>Acción</TableHeader>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>{field.producto_nombre}</TableCell>
                                <TableCell>{field.cantidad}</TableCell>
                                <TableCell>
                                    <Button variant="danger" size="small" onClick={() => remove(index)}>Quitar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {fields.length === 0 && (
                            <TableRow>
                                <TableCell colspan={3} style={{ textAlign: 'center', color: 'var(--secondary-color)' }}>
                                    No hay productos agregados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button type="submit" isLoading={isSubmitting} disabled={fields.length === 0}>
                        Guardar Nota de Ingreso
                    </Button>
                </div>
            </form>
        </div>
    );
};
