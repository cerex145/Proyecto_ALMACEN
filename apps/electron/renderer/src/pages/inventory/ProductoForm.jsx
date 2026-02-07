import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { clienteService } from '../../services/clientes.service';

export const ProductoForm = ({ productToEdit, onSuccess, onCancel }) => {
    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: productToEdit || {}
    });

    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(false);

    // Watch for client selection
    const selectedClienteCode = watch('codigo_cliente');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoadingClients(true);
            const response = await clienteService.getClientes();
            // Handle response structure (response.data or response)
            const clientList = response.data || response || [];
            if (Array.isArray(clientList)) {
                setClients(clientList);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
        } finally {
            setLoadingClients(false);
        }
    };

    // Auto-fill client data when 'codigo_cliente' changes
    useEffect(() => {
        if (selectedClienteCode) {
            const cliente = clients.find(c => c.codigo === selectedClienteCode);
            if (cliente) {
                setValue('ruc_cliente', cliente.cuit || cliente.numero_ruc || '');
                setValue('razon_social', cliente.razon_social || '');
                // Attempt to fill address/contact if fields exist
                // setValue('direccion', cliente.direccion || '');
            }
        }
    }, [selectedClienteCode, clients, setValue]);

    const onSubmit = (data) => {
        console.log("Processing...", data);
        if (onSuccess) onSuccess();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header Bar */}
            <header className="bg-blue-700 text-white shadow-md">
                <div className="container mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Icon */}
                        <div className="bg-white/10 p-2 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-wide">CONTROL DE EXISTENCIA</h1>
                    </div>
                    <button onClick={onCancel} className="text-white hover:bg-blue-600 p-2 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-6 overflow-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT COLUMN: Client / ID Data */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Datos de Origen</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">RUC del Cliente</label>
                                        <input {...register('ruc_cliente')} type="text" className="w-full h-9 rounded border-gray-300 bg-gray-50 text-sm focus:border-blue-500 focus:ring-blue-500 border px-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Código Cliente</label>
                                        <select {...register('codigo_cliente')} className="w-full h-9 rounded border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 border px-2">
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
                                        <input {...register('razon_social')} type="text" className="w-full h-9 rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 border px-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">T. Documento</label>
                                        <input {...register('tipo_documento')} type="text" className="w-full h-9 rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 border px-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">N° de Documento</label>
                                        <input {...register('num_documento')} type="text" className="w-full h-9 rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 border px-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Registro Sanitario</label>
                                        <input {...register('registro_sanitario')} type="text" className="w-full h-9 rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 border px-2" />
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-center">
                                    <button type="button" className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all w-full text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-blue-500">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        <span className="font-bold text-sm">Limpiar Datos</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CENTER/RIGHT COLUMN: Product Details */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Detalle de Producto</h3>

                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-gray-700 bg-gray-200 p-2 rounded-l border border-r-0 border-gray-300">Proveedor</label>
                                        <input {...register('proveedor')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-white bg-gray-600 p-2 rounded-l border border-r-0 border-gray-600">Cod. Producto</label>
                                        <input {...register('cod_producto')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-black bg-yellow-400 p-2 rounded-l border border-r-0 border-yellow-500">Producto</label>
                                        <input {...register('producto')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-white bg-gray-600 p-2 rounded-l border border-r-0 border-gray-600">Lote</label>
                                        <input {...register('lote')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-gray-700 bg-gray-200 p-2 rounded-l border border-r-0 border-gray-400">Fabricante</label>
                                        <input {...register('fabricante')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-gray-700 bg-gray-200 p-2 rounded-l border border-r-0 border-gray-400">Procedencia</label>
                                        <input {...register('procedencia')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-gray-700 bg-gray-200 p-2 rounded-l border border-r-0 border-gray-400">Fecha Vcto</label>
                                        <input {...register('fecha_vcto')} type="date" className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-gray-700 bg-gray-200 p-2 rounded-l border border-r-0 border-gray-400">Unidad (UND)</label>
                                        <input {...register('unidad')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-white bg-blue-300 p-2 rounded-l border border-r-0 border-blue-400">UM</label>
                                        <input {...register('um')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="w-32 text-xs font-bold text-white bg-blue-400 p-2 rounded-l border border-r-0 border-blue-500">Temp.</label>
                                        <input {...register('temp')} className="flex-1 h-9 rounded-r border-gray-300 border p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                    </div>
                                    {/* Cantidades Group */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-600 mb-1">Cant. Bulto</label>
                                            <input {...register('cant_bulto')} className="h-9 rounded border-gray-300 border p-2 text-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-600 mb-1">Cant. Cajas</label>
                                            <input {...register('cant_cajas')} className="h-9 rounded border-gray-300 border p-2 text-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-600 mb-1">Cant. x Caja</label>
                                            <input {...register('cant_x_caja')} className="h-9 rounded border-gray-300 border p-2 text-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-gray-600 mb-1">Cant. Fracción</label>
                                            <input {...register('cant_fraccion')} className="h-9 rounded border-gray-300 border p-2 text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col mt-2">
                                        <label className="text-xs font-bold text-gray-600 mb-1">Observaciones</label>
                                        <textarea {...register('observaciones')} rows="2" className="rounded border-gray-300 border p-2 text-sm"></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAR RIGHT: Actions */}
                        <div className="lg:col-span-3">
                            <div className="bg-blue-100/50 rounded-lg border border-blue-200 p-4 text-center h-full">
                                <h3 className="text-sm font-bold text-blue-900 border-b-2 border-blue-300 pb-2 mb-6">INVENTARIO</h3>

                                <div className="space-y-4">
                                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-transform hover:scale-105">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                        <span className="font-bold text-lg">INGRESAR</span>
                                    </button>

                                    <button type="button" onClick={onCancel} className="w-full bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-transform hover:scale-105">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                        <span className="font-bold text-lg">ELIMINAR / CANCELAR</span>
                                    </button>
                                </div>

                                <div className="mt-8">
                                    <div className="p-4 bg-white rounded border border-blue-100 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-2">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                            <line x1="8" y1="21" x2="16" y2="21"></line>
                                            <line x1="12" y1="17" x2="12" y2="21"></line>
                                        </svg>
                                        <p className="text-xs text-gray-500">Sistema Conectado</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </main>
        </div>
    );
};
