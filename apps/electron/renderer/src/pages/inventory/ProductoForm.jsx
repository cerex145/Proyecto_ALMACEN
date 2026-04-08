import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { clientesService } from '../../services/clientes.service';
import { productService } from '../../services/product.service';

export const ProductoForm = ({ productToEdit, onSuccess, onCancel }) => {
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm({
        defaultValues: productToEdit || {
            unidad: 'UND'
        }
    });

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mensajeFormulario, setMensajeFormulario] = useState('');

    const unidadSeleccionada = watch('unidad');

    const normalizarTexto = (valor = '') =>
        String(valor)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .toUpperCase();

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const pageSize = 200;
            let currentPage = 1;
            let totalPages = 1;
            const allClients = [];

            do {
                const response = await clientesService.listar({
                    page: currentPage,
                    limit: pageSize,
                    orderBy: 'razon_social',
                    order: 'ASC'
                });

                const data = response?.data || [];
                const pagination = response?.pagination || {};

                allClients.push(...data);
                totalPages = Number(pagination.totalPages || 1);
                currentPage += 1;
            } while (currentPage <= totalPages);

            setClients(allClients);
        } catch (error) {
            console.error("Error loading clients:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill client data when a client is selected
    const selectedClienteId = watch('cliente_id');
    useEffect(() => {
        if (!selectedClienteId) {
            setValue('ruc_cliente', '');
            setValue('razon_social', '');
            setValue('proveedor', '');
            return;
        }

        const client = clients.find(c => Number(c.id) === Number(selectedClienteId));
        if (client) {
            setValue('ruc_cliente', client.cuit || '');
            setValue('razon_social', client.razon_social || '');
            setValue('proveedor', client.razon_social || '');
        }
    }, [selectedClienteId, clients, setValue]);

    useEffect(() => {
        if (!productToEdit || clients.length === 0) return;

        const proveedorNormalizado = normalizarTexto(productToEdit.proveedor || '');
        if (!proveedorNormalizado) return;

        const clientMatch = clients.find(
            (c) => normalizarTexto(c.razon_social || '') === proveedorNormalizado
        );

        if (clientMatch) {
            setValue('cliente_id', String(clientMatch.id));
            setValue('ruc_cliente', clientMatch.cuit || '');
            setValue('razon_social', clientMatch.razon_social || '');
            setValue('proveedor', clientMatch.razon_social || '');
        }
    }, [productToEdit, clients, setValue]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
                proveedor: data.proveedor || data.razon_social || '',
                tipo_documento: data.tipo_documento || null,
                numero_documento: data.numero_documento || null,
                registro_sanitario: data.registro_sanitario || null,
                categoria_ingreso: data.categoria_ingreso || null,
                cliente_ruc: data.ruc_cliente || null,
                proveedor_ruc: data.proveedor_ruc || data.ruc_cliente || null,
                fecha_ingreso: data.fecha_ingreso || null,
                lote: data.lote || null,
                fabricante: data.fabricante || null,
                procedencia: data.procedencia || null,
                unidad: data.unidad || 'UND',
                unidad_otro: data.unidad === 'OTRO' ? (data.unidad_otro || null) : null,
                um: data.um ? data.um : null,
                temperatura: 25.0,
                observaciones: data.observaciones || null
            };
            // If editing
            if (productToEdit?.id) {
                await productService.updateProduct(productToEdit.id, payload);
            } else {
                await productService.createProduct(payload);
            }
            alert('Producto guardado correctamente');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            const mensaje = error?.response?.data?.error || error?.response?.data?.message || 'Error al guardar producto';
            alert(mensaje);
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
                                    <label className="block text-xs font-bold text-gray-700 mb-1">T. Documento</label>
                                    <select
                                        {...register('tipo_documento')}
                                        className="w-full h-9 rounded border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 border px-2"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Factura">Factura</option>
                                        <option value="Invoice">Invoice</option>
                                        <option value="Boleta de Venta">Boleta de Venta</option>
                                        <option value="Guía de Remisión Remitente">Guía de Remisión Remitente</option>
                                        <option value="Guía de Remisión Transportista">Guía de Remisión Transportista</option>
                                        <option value="Orden de Compra">Orden de Compra</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Documento</label>
                                    <input {...register('numero_documento')} className="w-full h-9 rounded border-gray-300 bg-white text-sm border px-2" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Cliente *</label>
                                    <select
                                        {...register('cliente_id', {
                                            validate: (value) => {
                                                if (productToEdit?.id) return true;
                                                return value ? true : 'Cliente requerido';
                                            }
                                        })}
                                        className="w-full h-9 rounded border-gray-300 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 border px-2"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.razon_social} ({client.cuit || 'Sin RUC'})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.cliente_id && <span className="text-red-500 text-xs">{errors.cliente_id.message || 'Cliente requerido'}</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Razón Social</label>
                                    <input {...register('razon_social')} readOnly className="w-full h-9 rounded border-gray-300 bg-gray-50 text-sm border px-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">RUC/CUIT</label>
                                    <input {...register('ruc_cliente')} readOnly className="w-full h-9 rounded border-gray-300 bg-gray-50 text-sm border px-2" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
                                    <input {...register('proveedor')} readOnly className="w-full h-9 rounded border-gray-300 bg-gray-50 text-sm border px-2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER/RIGHT COLUMN: Product Details */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Detalle de Producto</h3>

                            {mensajeFormulario ? (
                                <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    {mensajeFormulario}
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Código de Producto *</label>
                                    <input
                                        {...register('codigo', { required: true })}
                                        className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500"
                                        placeholder="Ej: PROD001"
                                    />
                                    {errors.codigo && <span className="text-red-500 text-xs">Requerido</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Producto *</label>
                                    <input
                                        {...register('descripcion', { required: true })}
                                        className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500"
                                        placeholder="Descripción del producto"
                                    />
                                    {errors.descripcion && <span className="text-red-500 text-xs">Requerido</span>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Ingreso</label>
                                    <input {...register('fecha_ingreso')} type="date" className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Lote</label>
                                    <input
                                        {...register('lote')}
                                        className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Fabricante</label>
                                    <input {...register('fabricante')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm" />
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
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Unidad</label>
                                    <select {...register('unidad')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm">
                                        <option value="UND">UND</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                                {unidadSeleccionada === 'OTRO' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de unidad</label>
                                        <input {...register('unidad_otro')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">UM</label>
                                    <select {...register('um')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm">
                                        <option value=""></option>
                                        <option value="AMP">AMP</option>
                                        <option value="FRS">FRS</option>
                                        <option value="BLT">BLT</option>
                                        <option value="TUB">TUB</option>
                                        <option value="SOB">SOB</option>
                                        <option value="CJ">CJ</option>
                                        <option value="KG">KG</option>
                                        <option value="G">G</option>
                                        <option value="UND">UND</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Temperatura (°C)</label>
                                    <input value="25" readOnly className="w-full h-9 rounded border-gray-300 bg-gray-50 border px-2 text-sm text-gray-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones</label>
                                    <textarea {...register('observaciones')} rows={2} className="w-full rounded border-gray-300 border px-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Registro Sanitario</label>
                                    <input {...register('registro_sanitario')} className="w-full h-9 rounded border-gray-300 border px-2 text-sm focus:border-blue-500" />
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
