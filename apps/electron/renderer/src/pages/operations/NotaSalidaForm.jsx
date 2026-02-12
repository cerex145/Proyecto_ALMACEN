import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/common/Table';

export const NotaSalidaForm = () => {
    const OTHER_LOTE_OPTION = 'OTRO';
    const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            cliente_id: '',
            fecha: new Date().toISOString().split('T')[0],
            responsable_id: 1,
            tipo_documento: '',
            numero_documento: '',
            fecha_ingreso: new Date().toISOString().split('T')[0],
            motivo_salida: '',
            detalles: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'detalles'
    });

    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [clienteRuc, setClienteRuc] = useState('');
    const [clienteCodigo, setClienteCodigo] = useState('');

    const [selectedProduct, setSelectedProduct] = useState('');
    const [lotesDisponibles, setLotesDisponibles] = useState([]);
    const [selectedLoteOption, setSelectedLoteOption] = useState('');
    const [loteManual, setLoteManual] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');

    const [um, setUm] = useState('');
    const [bultos, setBultos] = useState('');
    const [cajas, setCajas] = useState('');
    const [unidadesCaja, setUnidadesCaja] = useState('');
    const [fraccion, setFraccion] = useState('');
    const [cantidadTotal, setCantidadTotal] = useState(0);
    const [lastSalidaId, setLastSalidaId] = useState(null);

    const normalizeDateInput = (value) => {
        if (!value) {
            return '';
        }
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return '';
        }
        return parsed.toISOString().split('T')[0];
    };

    useEffect(() => {
        loadClients();
        // Cargar productos iniciales (sin filtro o todos)
        loadProducts();
    }, []);

    useEffect(() => {
        if (!selectedClient) {
            setClienteRuc('');
            setClienteCodigo('');
            setValue('cliente_id', '', { shouldValidate: true });
            loadProducts(); // Cargar todos si no hay cliente
            return;
        }
        const client = clients.find(c => String(c.id) === String(selectedClient));
        if (client) {
            setClienteRuc(client.cuit || '');
            setClienteCodigo(client.codigo || '');
        }
        setValue('cliente_id', selectedClient, { shouldValidate: true });

        // Recargar productos filtrados por cliente
        loadProducts(selectedClient);

        // Limpiar selección de producto actual
        setSelectedProduct('');
        setLotesDisponibles([]);
    }, [selectedClient, clients, setValue]);

    useEffect(() => {
        if (!selectedProduct) {
            setLotesDisponibles([]);
            setSelectedLoteOption('');
            setLoteManual('');
            setFechaVencimiento('');
            setUm('');
            return;
        }
        const product = products.find(p => p.id === parseInt(selectedProduct));
        setUm(product?.um || '');

        const loadLotes = async () => {
            try {
                // Pasar cliente_id para filtrar lotes
                const lotes = await productService.getLotesByProduct(selectedProduct, selectedClient);
                const activos = Array.isArray(lotes)
                    ? lotes.filter(l => Number(l.cantidad_disponible) > 0)
                    : [];
                setLotesDisponibles(activos);
                const firstNumero = activos[0]?.numero_lote || '';
                setSelectedLoteOption(firstNumero);
                setLoteManual('');
                setFechaVencimiento(normalizeDateInput(activos[0]?.fecha_vencimiento));
            } catch (error) {
                console.error('Error cargando lotes:', error);
                setLotesDisponibles([]);
                setSelectedLoteOption('');
                setLoteManual('');
                setFechaVencimiento('');
            }
        };
        loadLotes();
    }, [selectedProduct, products, selectedClient]);

    // ... (rest of useEffects)

    const loadClients = async () => {
        try {
            const clientsResponse = await clientesService.listar();
            const clientsArray = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse.data || []);
            setClients(clientsArray);
        } catch (error) {
            console.error('Error loading clients:', error);
            alert('Error al cargar lista de Clientes.');
        }
    };

    const loadProducts = async (clienteId = null) => {
        try {
            const params = clienteId ? { cliente_id: clienteId } : {};
            const productsResponse = await productService.getProducts(params);
            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Error al cargar lista de Productos.');
        }
    };

    useEffect(() => {
        const c = parseFloat(cajas) || 0;
        const u = parseFloat(unidadesCaja) || 0;
        const f = parseFloat(fraccion) || 0;
        const total = (c * u) + f;
        setCantidadTotal(total);
    }, [cajas, unidadesCaja, fraccion]);

    const handleNumberInput = (setter) => (event) => {
        const raw = event.target.value;
        if (raw === '') {
            setter('');
            return;
        }
        const cleaned = raw.replace(/[^0-9.]/g, '');
        if (cleaned === '') {
            setter('');
            return;
        }
        const [whole, ...rest] = cleaned.split('.');
        const normalized = rest.length > 0 ? `${whole}.${rest.join('')}` : cleaned;
        setter(normalized);
    };

    // const loadData replaced by separated functions
    // loadData removed

    const handleAddLine = () => {
        const isOtro = selectedLoteOption === OTHER_LOTE_OPTION;
        const loteFinal = isOtro ? loteManual : selectedLoteOption;
        const hasLote = Boolean(loteFinal);
        if (!selectedProduct || !hasLote || Number(cantidadTotal) <= 0) {
            alert('Complete producto, lote y cantidad total');
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProduct));
        const lote = lotesDisponibles.find(l => String(l.numero_lote) === String(selectedLoteOption));
        const fechaFinal = normalizeDateInput(fechaVencimiento || lote?.fecha_vencimiento || '');
        const numeroFinal = loteFinal;
        const loteIdFinal = isOtro ? null : (lote?.id ? parseInt(lote.id) : null);

        append({
            producto_id: parseInt(selectedProduct),
            producto_codigo: product?.codigo || '',
            producto_nombre: product?.descripcion || '',
            lote_id: loteIdFinal,
            lote_numero: numeroFinal,
            fecha_vencimiento: fechaFinal,
            um: um || '',
            cant_bulto: parseFloat(bultos || 0),
            cant_caja: parseFloat(cajas || 0),
            cant_por_caja: parseFloat(unidadesCaja || 0),
            cant_fraccion: parseFloat(fraccion || 0),
            cant_total: parseFloat(cantidadTotal || 0),
            cantidad: parseFloat(cantidadTotal || 0)
        });

        setSelectedProduct('');
        setSelectedLoteOption('');
        setLoteManual('');
        setFechaVencimiento('');
        setUm('');
        setBultos('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setCantidadTotal(0);
    };

    const resetAllStates = () => {
        reset();
        setSelectedClient('');
        setClienteRuc('');
        setClienteCodigo('');
        setSelectedProduct('');
        setLotesDisponibles([]);
        setSelectedLoteOption('');
        setLoteManual('');
        setFechaVencimiento('');
        setUm('');
        setBultos('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setCantidadTotal(0);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                cliente_id: data.cliente_id,
                fecha: data.fecha,
                responsable_id: data.responsable_id,
                tipo_documento: data.tipo_documento || null,
                numero_documento: data.numero_documento || null,
                fecha_ingreso: data.fecha_ingreso || null,
                motivo_salida: data.motivo_salida || null,
                detalles: data.detalles
            };
            const created = await operationService.createSalida(payload);
            setLastSalidaId(created?.id || null);
            alert('✅ Nota de salida registrada correctamente');
            resetAllStates();
        } catch (error) {
            console.error(error);
            const mensaje = error?.response?.data?.error || error?.response?.data?.message || 'Verifique los datos.';
            alert(`❌ Error al registrar salida. ${mensaje}`);
        }
    };

    const handleExportPdf = async () => {
        if (!lastSalidaId) {
            alert('Primero guarda la nota de salida para exportar PDF.');
            return;
        }
        try {
            const pdfUrl = `http://localhost:3000/api/salidas/${lastSalidaId}/pdf`;
            if (window.electron?.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('open-external', pdfUrl);
            } else {
                const opened = window.open(pdfUrl, '_blank');
                if (!opened) {
                    alert('No se pudo abrir el PDF. Verifica los bloqueos de ventanas emergentes.');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Error al exportar PDF');
        }
    };

    const handleLimpiar = () => {
        resetAllStates();
        setLastSalidaId(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Registro de Nota de Salida</h2>
                    <p className="text-slate-500">Controles de Nota de Salida</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Nota de Salida Individual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Código de Cliente</label>
                            <select
                                value={selectedClient}
                                onChange={(e) => {
                                    setSelectedClient(e.target.value);
                                    const client = clients.find(c => String(c.id) === String(e.target.value));
                                    if (client) {
                                        setClienteRuc(client.cuit || '');
                                        setClienteCodigo(client.codigo || '');
                                    }
                                }}
                                className="input-premium"
                            >
                                <option value="">Seleccione cliente...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.codigo} - {client.razon_social}
                                    </option>
                                ))}
                            </select>
                            <input type="hidden" {...register('cliente_id', { required: 'Requerido' })} />
                            {errors.cliente_id && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div>
                            <label className="label-premium">RUC de Cliente</label>
                            <input value={clienteRuc} readOnly className="input-premium" />
                        </div>
                        <div>
                            <label className="label-premium">Código Cliente</label>
                            <input value={clienteCodigo} readOnly className="input-premium" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Datos del Documento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Tipo de Documento</label>
                            <input
                                {...register('tipo_documento')}
                                type="text"
                                className="input-premium"
                                placeholder="Guía..."
                            />
                        </div>
                        <div>
                            <label className="label-premium">Número de Documento</label>
                            <input
                                {...register('numero_documento')}
                                type="text"
                                className="input-premium"
                            />
                        </div>
                        <div>
                            <label className="label-premium">Fecha de Ingreso</label>
                            <input
                                {...register('fecha_ingreso')}
                                type="date"
                                className="input-premium"
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
                        <div className="md:col-span-2">
                            <label className="label-premium">Motivo de Salida</label>
                            <input
                                {...register('motivo_salida')}
                                type="text"
                                className="input-premium"
                                placeholder="Motivo de salida"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-blue-50/50 border-blue-100">
                    <div className="flex flex-wrap gap-2 justify-end mb-4">
                        <Button type="button" onClick={handleAddLine} variant="primary">
                            Ingresar
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => fields.length > 0 && remove(fields.length - 1)}>
                            Eliminar
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleLimpiar}>
                            Limpiar
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleExportPdf}>
                            PDF
                        </Button>
                    </div>

                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Detalle de Productos (Lotes)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                            <label className="label-premium">Producto</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="input-premium"
                            >
                                <option value="">Seleccione producto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.descripcion}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Lote</label>
                            <select
                                value={selectedLoteOption}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedLoteOption(value);
                                    if (value === OTHER_LOTE_OPTION) {
                                        setLoteManual('');
                                        setFechaVencimiento('');
                                        return;
                                    }
                                    const lote = lotesDisponibles.find(l => String(l.numero_lote) === String(value));
                                    setFechaVencimiento(normalizeDateInput(lote?.fecha_vencimiento));
                                }}
                                className="input-premium"
                                disabled={!selectedProduct}
                            >
                                <option value="">Seleccione lote...</option>
                                {lotesDisponibles.map(lote => (
                                    <option key={lote.id} value={lote.numero_lote}>
                                        {lote.numero_lote}
                                    </option>
                                ))}
                                <option value={OTHER_LOTE_OPTION}>OTRO</option>
                            </select>
                        </div>
                        {selectedLoteOption === OTHER_LOTE_OPTION && (
                            <div className="md:col-span-2">
                                <label className="label-premium">Agregue lote manualmente</label>
                                <input
                                    type="text"
                                    className="input-premium"
                                    value={loteManual}
                                    onChange={(e) => setLoteManual(e.target.value)}
                                    disabled={!selectedProduct}
                                    placeholder="Lote..."
                                />
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="label-premium">Vencimiento</label>
                            <input
                                type="date"
                                className="input-premium"
                                value={normalizeDateInput(fechaVencimiento)}
                                onChange={(e) => setFechaVencimiento(normalizeDateInput(e.target.value))}
                                disabled={!selectedProduct}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">UM</label>
                            <input
                                type="text"
                                className="input-premium"
                                value={um}
                                onChange={(e) => setUm(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-6 grid grid-cols-3 gap-2 p-2 bg-white rounded-lg border border-blue-200">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Bulto</label>
                                <input
                                    type="text"
                                    value={bultos}
                                    onChange={handleNumberInput(setBultos)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cajas</label>
                                <input
                                    type="text"
                                    value={cajas}
                                    onChange={handleNumberInput(setCajas)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Und/Caja</label>
                                <input
                                    type="text"
                                    value={unidadesCaja}
                                    onChange={handleNumberInput(setUnidadesCaja)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Fracción</label>
                                <input
                                    type="text"
                                    value={fraccion}
                                    onChange={handleNumberInput(setFraccion)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-3 flex justify-between items-center pt-1 border-t border-slate-100 mt-1">
                                <span className="text-xs text-slate-400 font-medium">Total Unidades:</span>
                                <span className="font-bold text-blue-600 text-lg">{cantidadTotal}</span>
                            </div>
                        </div>

                        <div className="md:col-span-12 flex justify-end">
                            <Button type="button" onClick={handleAddLine} variant="primary" className="w-full md:w-auto">
                                + Agregar Item
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Cod.Producto</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Lote</th>
                                <th className="px-6 py-4">Vencimiento</th>
                                <th className="px-6 py-4">UM</th>
                                <th className="px-6 py-4">Cant.Bulto</th>
                                <th className="px-6 py-4">Cant.Cajas</th>
                                <th className="px-6 py-4">Cant.x Caja</th>
                                <th className="px-6 py-4">Cant.Fracción</th>
                                <th className="px-6 py-4 text-right">Cant.Total</th>
                                <th className="px-6 py-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fields.map((field, index) => (
                                <tr key={field.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 font-mono text-xs">{field.producto_codigo || '-'}</td>
                                    <td className="px-6 py-3 font-medium text-slate-700">{field.producto_nombre}</td>
                                    <td className="px-6 py-3">{field.lote_numero}</td>
                                    <td className="px-6 py-3">
                                        {field.fecha_vencimiento ? new Date(field.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                                    </td>
                                    <td className="px-6 py-3">{field.um || '-'}</td>
                                    <td className="px-6 py-3">{field.cant_bulto ?? 0}</td>
                                    <td className="px-6 py-3">{field.cant_caja ?? 0}</td>
                                    <td className="px-6 py-3">{field.cant_por_caja ?? 0}</td>
                                    <td className="px-6 py-3">{field.cant_fraccion ?? 0}</td>
                                    <td className="px-6 py-3 text-right font-bold text-blue-600">{field.cant_total ?? field.cantidad}</td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 px-2 py-1 rounded-lg"
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fields.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="px-6 py-8 text-center text-slate-400 italic">
                                        No hay productos agregados a la nota.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleLimpiar}
                    >
                        Limpiar
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleExportPdf}
                    >
                        Exportar a PDF
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={fields.length === 0}
                        size="lg"
                        className="btn-gradient-primary shadow-lg shadow-blue-500/30"
                    >
                        Ingresar
                    </Button>
                </div>
            </form>
        </div>
    );
};
