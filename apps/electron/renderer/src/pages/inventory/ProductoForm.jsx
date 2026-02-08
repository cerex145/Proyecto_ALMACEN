import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { clientesService } from '../../services/clientes.service';
import { productService } from '../../services/product.service';

export const ProductoForm = ({ productToEdit, onSuccess, onCancel }) => {
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: productToEdit || {}
    });

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientesService.listar(); // Fetches all clients
            // If data.data exists (paginated), use it, else usage data directly
            setClients(data.data || data || []);
        } catch (error) {
            console.error("Error loading clients:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill client data when a client code is selected
    const selectedClientCode = watch('codigo_cliente');
    useEffect(() => {
        if (selectedClientCode) {
            const client = clients.find(c => c.codigo === selectedClientCode);
            if (client) {
                setValue('ruc_cliente', client.cuit || '');
                setValue('razon_social', client.razon_social || '');
                setValue('direccion', client.direccion || '');
                // Map other fields if necessary
            }
        }
    }, [selectedClientCode, clients, setValue]);


    const onSubmit = async (data) => {
        try {
            // If editing
            if (productToEdit?.id) {
                await productService.updateProduct(productToEdit.id, data);
            } else {
                await productService.createProduct(data);
            }
            alert('Producto guardado correctamente');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert('Error al guardar producto');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <header className="bg-blue-700 text-white shadow-md">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold tracking-wide">CONTROL DE EXISTENCIA - PRODUCTO</h1>
                    <button onClick={onCancel} className="text-white hover:bg-blue-600 p-2 rounded-full">
                        ✕ Cerrar
                    </button>
                </div>
            </header>

            <main className="flex-grow p-6 overflow-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Client / Provider Data */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Datos de Proveedor</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Código Cliente/Proveedor</label>
                                    <select
                                        {...register('codigo_cliente')}
                                        className="w-full h-9 rounded border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 border px-2"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.codigo}>
                                                {client.codigo} - {client.razon_social}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Razón Social</label>
                                    <input {...register('razon_social')} readOnly className="w-full h-9 rounded border-gray-300 bg-gray-50 text-sm border px-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">RUC/CUIT</label>
                                    <input {...register('ruc_cliente')} readOnly className="w-full h-9 rounded border-gray-300 bg-gray-50 text-sm border px-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER/RIGHT COLUMN: Product Details */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Detalle de Producto</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Código Producto *</label>
                                    <input
                                        {...register('codigo', { required: true })}
                                        className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500"
                                        placeholder="Ej: PROD001"
                                    />
                                    {errors.codigo && <span className="text-red-500 text-xs">Requerido</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Descripción *</label>
                                    <input
                                        {...register('descripcion', { required: true })}
                                        className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500"
                                        placeholder="Descripción del producto"
                                    />
                                    {errors.descripcion && <span className="text-red-500 text-xs">Requerido</span>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Stock Actual</label>
                                    <input
                                        {...register('stock_actual')}
                                        type="number"
                                        className="w-full h-9 rounded border-gray-300 border px-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Categoría Ingreso</label>
                                    <select {...register('categoria_ingreso')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm">
                                        <option value="">Seleccione...</option>
                                        <option value="IMPORTACION">IMPORTACIÓN</option>
                                        <option value="COMPRA_LOCAL">COMPRA LOCAL</option>
                                        <option value="TRASLADO">TRASLADO</option>
                                        <option value="DEVOLUCION">DEVOLUCIÓN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Procedencia</label>
                                    <input {...register('procedencia')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold transition-colors"
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                            </button>
                        </div>
                    </div>

                </form>
            </main>
        </div>
    );
};
