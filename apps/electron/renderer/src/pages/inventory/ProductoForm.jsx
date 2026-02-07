import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { productService } from '../../services/product.service';

export const ProductoForm = ({ productToEdit, onSuccess, onCancel }) => {
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: productToEdit || {
            codigo: '',
            descripcion: '',
            stock_actual: 0,
            proveedor: '',
            procedencia: '',
            categoria_ingreso: 'COMPRA_LOCAL',
            lote: '',
            fecha_vcto: ''
        }
    });

    const onSubmit = async (data) => {
        // Map empty strings to null/0 where appropriate
        const payload = {
            codigo: data.codigo,
            descripcion: data.descripcion,
            stock_actual: data.stock_actual ? Number(data.stock_actual) : 0,
            proveedor: data.proveedor,
            procedencia: data.procedencia,
            categoria_ingreso: data.categoria_ingreso,
            // Optional initial stock fields
            lote: data.lote || null,
            fecha_vcto: data.fecha_vcto || null
        };

        try {
            if (productToEdit?.id) {
                await productService.updateProduct(productToEdit.id, payload);
                alert('Producto actualizado correctamente');
            } else {
                await productService.createProduct(payload);
                alert('Producto creado correctamente');
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || error.message || 'Error al guardar el producto';
            alert(msg);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header Simplified */}
            <header className="bg-blue-700 text-white shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-wide">GESTIÓN DE PRODUCTO</h1>
                </div>
                <button onClick={onCancel} className="text-white hover:bg-blue-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>

            <main className="flex-grow p-6 flex justify-center">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Section 1: Basic Info */}
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Información Principal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Código de Producto *</label>
                                    <input 
                                        {...register('codigo', { required: 'El código es requerido' })}
                                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ej. PROD-001"
                                    />
                                    {errors.codigo && <span className="text-xs text-red-500">{errors.codigo.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Descripción *</label>
                                    <input 
                                        {...register('descripcion', { required: 'La descripción es requerida' })}
                                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Nombre del producto"
                                    />
                                    {errors.descripcion && <span className="text-xs text-red-500">{errors.descripcion.message}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Classification */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Clasificación</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                    <input 
                                        {...register('proveedor')}
                                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Procedencia</label>
                                    <input 
                                        {...register('procedencia')}
                                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select 
                                        {...register('categoria_ingreso')}
                                        className="w-full h-10 px-3 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="COMPRA_LOCAL">COMPRA_LOCAL</option>
                                        <option value="IMPORTACION">IMPORTACION</option>
                                        <option value="TRASLADO">TRASLADO</option>
                                        <option value="DEVOLUCION">DEVOLUCION</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Initial Inventory (Optional) */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">Inventario Inicial (Opcional)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Stock Inicial</label>
                                    <input 
                                        type="number"
                                        {...register('stock_actual')}
                                        className="w-full h-10 px-3 rounded border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-blue-600 mt-1">Si ingresa stock, debe completar lote y vencimiento.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Lote</label>
                                        <input 
                                            {...register('lote')}
                                            className="w-full h-10 px-3 rounded border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Lote..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-blue-900 mb-1">Vencimiento</label>
                                        <input 
                                            type="date"
                                            {...register('fecha_vcto')}
                                            className="w-full h-10 px-3 rounded border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : (productToEdit?.id ? 'Actualizar Producto' : 'Guardar Producto')}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
};
