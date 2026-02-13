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

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'detalles'
    });

    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [clienteRuc, setClienteRuc] = useState('');
    const [clienteCodigo, setClienteCodigo] = useState('');

    // Estados para notas de ingreso
    const [notasIngreso, setNotasIngreso] = useState([]);
    const [mostrarNotasIngreso, setMostrarNotasIngreso] = useState(false);
    const [selectedProductosFromNota, setSelectedProductosFromNota] = useState({});

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

    const getDetalleDisponible = (detalle) => {
        const totalRaw = Number(detalle?.cantidad_total ?? detalle?.cantidad ?? 0);
        const disponibleRaw = Number(detalle?.cantidad_disponible ?? totalRaw);
        if (Number.isNaN(disponibleRaw)) {
            return 0;
        }
        return Math.max(0, Math.min(disponibleRaw, totalRaw || disponibleRaw));
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

        // Cargar notas de ingreso del cliente
        loadNotasIngreso(selectedClient);

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

    const loadNotasIngreso = async (clienteId) => {
        if (!clienteId) {
            setNotasIngreso([]);
            return;
        }
        try {
            const client = clients.find(c => String(c.id) === String(clienteId));
            if (!client) return;

            // Buscar las notas de ingreso del cliente por proveedor (razon_social)
            const response = await fetch(`http://127.0.0.1:3000/api/ingresos?proveedor=${encodeURIComponent(client.razon_social)}`);
            const result = await response.json();
            const notas = result.data || [];

            // Cargar detalles de cada nota
            const notasConDetalles = await Promise.all(
                notas.map(async (nota) => {
                    try {
                        const detRes = await fetch(`http://127.0.0.1:3000/api/ingresos/${nota.id}`);
                        const detJson = await detRes.json();
                        const detallesRaw = detJson?.data?.detalles || [];
                        const detallesFiltrados = detallesRaw.filter((detalle) => getDetalleDisponible(detalle) > 0);
                        return { ...nota, detalles: detallesFiltrados };
                    } catch (err) {
                        console.error('Error al cargar detalles:', err);
                        return { ...nota, detalles: [] };
                    }
                })
            );

            const notasConSaldo = notasConDetalles.filter((nota) => (nota.detalles || []).length > 0);
            setNotasIngreso(notasConSaldo);
        } catch (error) {
            console.error('Error loading notas de ingreso:', error);
            setNotasIngreso([]);
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

    const handleSelectTodaNota = (notaId) => {
        const nota = notasIngreso.find(n => n.id === notaId);
        if (!nota || !nota.detalles || nota.detalles.length === 0) {
            alert('Esta nota no tiene productos');
            return;
        }

        // Agregar todos los productos de la nota
        const disponibles = nota.detalles.filter((detalle) => getDetalleDisponible(detalle) > 0);
        disponibles.forEach(detalle => {
            if (detalle.producto_id) {
                handleAgregarProductoDesdeNota(notaId, detalle);
            }
        });

        alert(`✅ Se agregaron ${disponibles.length} productos de la nota de ingreso`);
    };

    const handleAgregarProductoDesdeNota = (notaId, detalle) => {
        const key = `${notaId}-${detalle.id}`;
        const disponible = getDetalleDisponible(detalle);
        if (disponible <= 0) {
            alert('Este detalle ya no tiene saldo disponible');
            return;
        }
        
        // Verificar si ya existe este producto con el mismo lote
        const existingIndex = fields.findIndex(
            f => Number(f.producto_id) === Number(detalle.producto_id) && 
                 f.lote_numero === detalle.lote_numero
        );

        if (existingIndex >= 0) {
            alert('Este detalle ya fue agregado a la nota de salida');
        } else {
            // Agregar nuevo producto
            append({
                producto_id: Number(detalle.producto_id),
                producto_codigo: detalle.producto?.codigo || '',
                producto_nombre: detalle.producto?.descripcion || '',
                lote_id: detalle.lote_id ? Number(detalle.lote_id) : null,
                lote_numero: detalle.lote_numero || '',
                fecha_vencimiento: detalle.fecha_vencimiento || '',
                um: detalle.um || detalle.producto?.um || detalle.producto?.unidad || '',
                fabricante: detalle.fabricante || detalle.producto?.fabricante || '',
                temperatura_min: detalle.temperatura_min_c || detalle.producto?.temperatura_min_c || '',
                temperatura_max: detalle.temperatura_max_c || detalle.producto?.temperatura_max_c || '',
                cant_bulto: Number(detalle.cantidad_bultos || 0),
                cant_caja: Number(detalle.cantidad_cajas || 0),
                cant_por_caja: Number(detalle.cantidad_por_caja || 0),
                cant_fraccion: Number(detalle.cantidad_fraccion || 0),
                cant_total: disponible,
                cantidad: disponible,
                cantidad_disponible: disponible
            });
        }
    };

    const handleToggleProductoFromNota = (notaId, detalle) => {
        const key = `${notaId}-${detalle.id}`;
        const isSelected = selectedProductosFromNota[key];
        const disponible = getDetalleDisponible(detalle);

        if (!isSelected && disponible <= 0) {
            alert('Este detalle ya no tiene saldo disponible');
            return;
        }

        if (isSelected) {
            // Deseleccionar
            setSelectedProductosFromNota(prev => {
                const newSelected = { ...prev };
                delete newSelected[key];
                return newSelected;
            });
        } else {
            // Seleccionar y agregar
            setSelectedProductosFromNota(prev => ({ ...prev, [key]: true }));
            handleAgregarProductoDesdeNota(notaId, detalle);
        }
    };

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
        const disponible = lote?.cantidad_disponible != null ? Number(lote.cantidad_disponible) : null;
        if (disponible != null && Number(cantidadTotal) > disponible) {
            alert(`La cantidad supera el disponible del lote (${disponible})`);
            return;
        }
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
            cantidad: parseFloat(cantidadTotal || 0),
            cantidad_disponible: disponible
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
            // Validación robusta de detalles
            if (!data.detalles || data.detalles.length === 0) {
                alert('❌ Debe agregar al menos un producto a la nota');
                return;
            }

            // Validar que cada detalle tiene datos válidos
            for (let i = 0; i < data.detalles.length; i++) {
                const det = data.detalles[i];
                if (!det.producto_id || Number.isNaN(Number(det.producto_id))) {
                    alert(`❌ Detalle ${i + 1}: Producto no válido`);
                    return;
                }
                if (!det.cantidad || Number.isNaN(Number(det.cantidad))) {
                    alert(`❌ Detalle ${i + 1}: Cantidad no es un número`);
                    return;
                }
                if (Number(det.cantidad) <= 0) {
                    alert(`❌ Detalle ${i + 1}: Cantidad debe ser mayor a 0`);
                    return;
                }
                if (det.cantidad_disponible != null && Number(det.cantidad) > Number(det.cantidad_disponible)) {
                    alert(`❌ Detalle ${i + 1}: Cantidad supera el disponible (${det.cantidad_disponible})`);
                    return;
                }
            }

            const payload = {
                cliente_id: data.cliente_id,
                fecha: data.fecha,
                responsable_id: data.responsable_id,
                tipo_documento: data.tipo_documento || null,
                numero_documento: data.numero_documento || null,
                fecha_ingreso: data.fecha_ingreso || null,
                motivo_salida: data.motivo_salida || null,
                detalles: data.detalles.map(det => ({
                    producto_id: Number(det.producto_id),
                    lote_id: det.lote_id ? Number(det.lote_id) : null,
                    cantidad: Number(det.cantidad),
                    precio_unitario: det.precio_unitario ? Number(det.precio_unitario) : null
                }))
            };
            
            console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2));
            const created = await operationService.createSalida(payload);
            setLastSalidaId(created?.id || null);
            alert('✅ Nota de salida registrada correctamente');
            resetAllStates();
        } catch (error) {
            console.error(error);
            const mensaje = error?.response?.data?.error || error?.message || 'Verifique los datos.';
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

                {/* Sección de Notas de Ingreso */}
                {selectedClient && (
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-purple-800">📦 Notas de Ingreso del Cliente</h3>
                            <Button
                                type="button"
                                onClick={() => setMostrarNotasIngreso(!mostrarNotasIngreso)}
                                variant="secondary"
                                className="text-sm"
                            >
                                {mostrarNotasIngreso ? '▼ Ocultar' : '▶ Mostrar'}
                            </Button>
                        </div>

                        {mostrarNotasIngreso && (
                            <div className="space-y-4">
                                {notasIngreso.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No hay notas de ingreso para este cliente
                                    </div>
                                ) : (
                                    notasIngreso.map(nota => (
                                        <Card key={nota.id} className="p-4 bg-white border-purple-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-700">
                                                        Nota: {nota.numero_ingreso} - Fecha: {new Date(nota.fecha).toLocaleDateString('es-PE')}
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        {nota.detalles?.length || 0} productos
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleSelectTodaNota(nota.id)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                                                >
                                                    ✓ Seleccionar Todo
                                                </Button>
                                            </div>

                                            {nota.detalles && nota.detalles.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-slate-50">
                                                            <tr>
                                                                <th className="px-2 py-2 text-left">Sel.</th>
                                                                <th className="px-2 py-2 text-left">Código</th>
                                                                <th className="px-2 py-2 text-left">Producto</th>
                                                                <th className="px-2 py-2 text-left">Lote</th>
                                                                <th className="px-2 py-2 text-left">Vencimiento</th>
                                                                <th className="px-2 py-2 text-left">UM</th>
                                                                <th className="px-2 py-2 text-right">Disponible</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {nota.detalles.map(detalle => {
                                                                const key = `${nota.id}-${detalle.id}`;
                                                                const isSelected = selectedProductosFromNota[key];
                                                                const disponible = getDetalleDisponible(detalle);
                                                                const total = Number(detalle.cantidad_total || detalle.cantidad || 0);
                                                                return (
                                                                    <tr key={detalle.id} className={isSelected ? 'bg-purple-50' : 'hover:bg-slate-50'}>
                                                                        <td className="px-2 py-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected || false}
                                                                                onChange={() => handleToggleProductoFromNota(nota.id, detalle)}
                                                                                disabled={disponible <= 0}
                                                                                className="w-4 h-4 text-purple-600 rounded"
                                                                            />
                                                                        </td>
                                                                        <td className="px-2 py-2 font-mono">{detalle.producto?.codigo || '-'}</td>
                                                                        <td className="px-2 py-2 font-medium">{detalle.producto?.descripcion || '-'}</td>
                                                                        <td className="px-2 py-2">{detalle.lote_numero || '-'}</td>
                                                                        <td className="px-2 py-2">
                                                                            {detalle.fecha_vencimiento ? new Date(detalle.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                                                                        </td>
                                                                        <td className="px-2 py-2">{detalle.um || detalle.producto?.um || '-'}</td>
                                                                        <td className="px-2 py-2 text-right font-semibold text-blue-600">
                                                                            {disponible} / {total}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}
                    </Card>
                )}

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
                        <Button type="button" onClick={handleAddLine} variant="primary" className="bg-green-600 hover:bg-green-700">
                            ➕ Agregar Producto
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => fields.length > 0 && remove(fields.length - 1)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            disabled={fields.length === 0}
                            title="Eliminar el último producto agregado"
                        >
                            ➖ Quitar Último
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleLimpiar}>
                            🗑️ Limpiar Todo
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleExportPdf}>
                            📄 PDF
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

                        <div className="md:col-span-12 flex justify-end gap-3">
                            <Button 
                                type="button" 
                                onClick={() => fields.length > 0 && remove(fields.length - 1)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold w-full md:w-auto"
                                disabled={fields.length === 0}
                            >
                                ➖ Quitar Último Producto
                            </Button>
                            <Button type="button" onClick={handleAddLine} variant="primary" className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                                ➕ Agregar Producto
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
                                <th className="px-6 py-4 text-right">Cant.Salida</th>
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
                                    <td className="px-6 py-3 text-right">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={field.cantidad ?? 0}
                                            onChange={(event) => {
                                                const raw = Number(event.target.value);
                                                const max = field.cantidad_disponible != null
                                                    ? Number(field.cantidad_disponible)
                                                    : null;
                                                const next = Number.isNaN(raw)
                                                    ? 0
                                                    : (max != null ? Math.min(raw, max) : raw);
                                                update(index, {
                                                    ...field,
                                                    cantidad: next,
                                                    cant_total: next
                                                });
                                            }}
                                            className="input-premium w-28 text-right"
                                        />
                                        {field.cantidad_disponible != null && (
                                            <div className="text-[10px] text-slate-400">Disp: {field.cantidad_disponible}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md text-sm flex items-center gap-1 mx-auto"
                                            title="Eliminar este producto de la lista"
                                        >
                                            <span className="text-lg">×</span> Quitar
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
                        onClick={() => fields.length > 0 && remove(fields.length - 1)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={fields.length === 0}
                    >
                        ➖ Quitar Último Producto
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleLimpiar}
                    >
                        🗑️ Limpiar Todo
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleExportPdf}
                    >
                        📄 Exportar a PDF
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        disabled={fields.length === 0}
                        size="lg"
                        className="btn-gradient-primary shadow-lg shadow-blue-500/30"
                    >
                        💾 Guardar Nota de Salida
                    </Button>
                </div>
            </form>
        </div>
    );
};
