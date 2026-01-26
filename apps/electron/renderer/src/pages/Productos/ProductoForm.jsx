import React from 'react';
import { useForm } from 'react-hook-form';
import { productService } from '../../services/product.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ProductoForm = ({ productToEdit, onSuccess, onCancel }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: productToEdit || {}
    });

    const onSubmit = async (data) => {
        try {
            if (productToEdit) {
                await productService.updateProduct(productToEdit.id, data);
            } else {
                await productService.createProduct(data);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '600px', padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3>{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h3>

            <Input
                label="Código"
                register={register('codigo', { required: 'El código es obligatorio' })}
                error={errors.codigo}
            />

            <Input
                label="Descripción"
                register={register('descripcion', { required: 'La descripción es obligatoria' })}
                error={errors.descripcion}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                    label="Unidad de Medida"
                    register={register('unidad_medida', { required: 'Requerido' })}
                    error={errors.unidad_medida}
                />
                <Input
                    label="Stock Mínimo"
                    type="number"
                    step="0.01"
                    register={register('stock_minimo', { required: 'Requerido', min: 0 })}
                    error={errors.stock_minimo}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                    {productToEdit ? 'Actualizar' : 'Crear Producto'}
                </Button>
            </div>
        </form>
    );
};
