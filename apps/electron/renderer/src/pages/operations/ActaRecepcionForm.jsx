import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const ActaRecepcionForm = () => {
    const { register, control, handleSubmit, reset, setValue, getValues, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            tipo_documento: '',
            numero_documento: '',
            cliente_id: '',
            proveedor: '',
            tipo_operacion: '',
            tipo_conteo: '',
            observaciones: '',
            responsable_recepcion: '',
            responsable_entrega: '',
            jefe_almacen: '',
            detalles: []
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'detalles'
    });

    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [clienteRuc, setClienteRuc] = useState('');
    const [proveedorNombre, setProveedorNombre] = useState('');

    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [showAllProducts, setShowAllProducts] = useState(false);

    const [lotesDisponibles, setLotesDisponibles] = useState([]);
    const [selectedLoteId, setSelectedLoteId] = useState('');

    // Estados del formulario de producto
    const [lote, setLote] = useState('');
    const [vencimiento, setVencimiento] = useState('');
    const [um, setUm] = useState('');
    const [fabricante, setFabricante] = useState('');
    const [temperaturaMin, setTemperaturaMin] = useState('');
    const [temperaturaMax, setTemperaturaMax] = useState('');
    const [cantidadSolicitada, setCantidadSolicitada] = useState('');
    const [cantidadRecibida, setCantidadRecibida] = useState('');
    const [aspecto, setAspecto] = useState('EMB');

    const [bultos, setBultos] = useState('');
    const [cajas, setCajas] = useState('');
    const [unidadesCaja, setUnidadesCaja] = useState('');
    const [fraccion, setFraccion] = useState('');

    const [lastActaId, setLastActaId] = useState(null);

    // Estados para documentos de notas de ingreso
    const [notasIngresoDocs, setNotasIngresoDocs] = useState([]);

    const selectedTipoDocumento = watch('tipo_documento');
    const numeroDocumentoActual = watch('numero_documento');

    const [numeroDocumentoSeleccion, setNumeroDocumentoSeleccion] = useState('');
    const [numeroDocumentoManual, setNumeroDocumentoManual] = useState('');

    const tipoDocumentoOptions = useMemo(() => {
        const extraOptions = new Set();

        notasIngresoDocs.forEach((nota) => {
            const value = String(nota?.tipo_documento || '').trim();
            if (value) extraOptions.add(value);
        });

        return Array.from(extraOptions);
    }, [notasIngresoDocs]);

    const numeroDocumentoOptions = useMemo(() => {
        const options = new Set();
        const selected = String(selectedTipoDocumento || '').trim();

        notasIngresoDocs.forEach((nota) => {
            const tipo = String(nota?.tipo_documento || '').trim();
            const numero = String(nota?.numero_documento || '').trim();
            if (!numero) return;
            if (selected && tipo !== selected) return;
            options.add(numero);
        });

        return Array.from(options);
    }, [notasIngresoDocs, selectedTipoDocumento]);

    useEffect(() => {
        loadClients();
        loadNotasIngresoDocumentos();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            const filters = showAllProducts ? {} : { cliente_id: selectedClient };
            loadProducts(filters);
        } else {
            setProducts([]);
        }
    }, [selectedClient, showAllProducts]);

    useEffect(() => {
        if (selectedClient && selectedProduct) {
            loadLotes();
        } else {
            setLotesDisponibles([]);
        }
    }, [selectedProduct, selectedClient]);

    useEffect(() => {
        if (!selectedTipoDocumento) return;
        const currentNumero = String(getValues('numero_documento') || '').trim();
        if (currentNumero && !numeroDocumentoOptions.includes(currentNumero)) {
            setValue('numero_documento', '');
            setNumeroDocumentoSeleccion('');
            setNumeroDocumentoManual('');
        }
    }, [selectedTipoDocumento, numeroDocumentoOptions, getValues, setValue]);

    useEffect(() => {
        const currentNumero = String(numeroDocumentoActual || '').trim();
        if (!currentNumero) {
            if (numeroDocumentoSeleccion) setNumeroDocumentoSeleccion('');
            if (numeroDocumentoManual) setNumeroDocumentoManual('');
            return;
        }

        if (numeroDocumentoOptions.includes(currentNumero)) {
            if (numeroDocumentoSeleccion !== currentNumero) {
                setNumeroDocumentoSeleccion(currentNumero);
            }
            if (numeroDocumentoManual) setNumeroDocumentoManual('');
            return;
        }

        if (numeroDocumentoSeleccion !== 'OTRO') {
            setNumeroDocumentoSeleccion('OTRO');
        }
        if (numeroDocumentoManual !== currentNumero) {
            setNumeroDocumentoManual(currentNumero);
        }
    }, [numeroDocumentoActual, numeroDocumentoOptions, numeroDocumentoSeleccion, numeroDocumentoManual]);

    // Auto-fill producto
    useEffect(() => {
        if (!selectedProduct) {
            setUm('');
            setFabricante('');
            setTemperaturaMin('');
            setTemperaturaMax('');
            setLote('');
            setVencimiento('');
            setBultos('');
            setCajas('');
            setUnidadesCaja('');
            setFraccion('');
            setCantidadSolicitada('');
            setCantidadRecibida('');
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProduct));
        if (product) {
            setUm(product.um || product.unidad || '');
            setFabricante(product.fabricante || '');
            setTemperaturaMin(product.temperatura_min_c || '');
            setTemperaturaMax(product.temperatura_max_c || '');
            setBultos(product.cantidad_bultos || '');
            setCajas(product.cantidad_cajas || '');
            setUnidadesCaja(product.cantidad_por_caja || '');
            setFraccion(product.cantidad_fraccion || '');

            const currentTipoDoc = getValues('tipo_documento');
            if (product.tipo_documento && !currentTipoDoc) {
                setValue('tipo_documento', product.tipo_documento);
            }
            const currentNumDoc = getValues('numero_documento');
            if (product.numero_documento && !currentNumDoc) {
                setValue('numero_documento', product.numero_documento);
            }
        }
    }, [selectedProduct, products]);

    // Auto-fill lote
    useEffect(() => {
        if (!selectedLoteId || selectedLoteId === 'OTRO') return;

        const loteData = lotesDisponibles.find(l => l.id === parseInt(selectedLoteId));
        if (!loteData) return;

        setLote(loteData.numero_lote || '');
        setVencimiento(loteData.fecha_vencimiento || '');
        setCantidadSolicitada(loteData.cantidad_disponible || '');
        setCantidadRecibida(loteData.cantidad_disponible || '');

        if (loteData.producto) {
            setUm(loteData.producto.um || loteData.producto.unidad || um);
            setFabricante(loteData.producto.fabricante || fabricante);
            setTemperaturaMin(loteData.producto.temperatura_min_c || temperaturaMin);
            setTemperaturaMax(loteData.producto.temperatura_max_c || temperaturaMax);
        }
    }, [selectedLoteId, lotesDisponibles]);

    // Auto-cargar Nota de Ingreso cuando se ingresa el número de documento
    const numeroDocumento = watch('numero_documento');
    useEffect(() => {
        const buscarYCargarNotaIngreso = async () => {
            const numeroDoc = String(numeroDocumento || '').trim();
            if (!numeroDoc) return;

            try {
                // Buscar nota de ingreso por número de documento
                const tipoDoc = String(getValues('tipo_documento') || '').trim();
                const queryParams = new URLSearchParams({ numero_documento: numeroDoc });
                if (tipoDoc) queryParams.set('tipo_documento', tipoDoc);

                const response = await fetch(`http://127.0.0.1:3000/api/ingresos?${queryParams.toString()}`);
                if (!response.ok) return;

                const result = await response.json();
                const notas = result.data || [];

                if (notas.length === 0) return;

                // Tomar la primera nota que coincida
                let nota = notas[0];
                if (nota && (!nota.detalles || nota.detalles.length === 0)) {
                    const notaResponse = await fetch(`http://127.0.0.1:3000/api/ingresos/${nota.id}`);
                    if (notaResponse.ok) {
                        const notaDetalleResult = await notaResponse.json();
                        nota = notaDetalleResult.data || notaDetalleResult;
                    }
                }

                const proveedorNota = String(nota.proveedor || '').trim();
                if (proveedorNota) {
                    setProveedorNombre(proveedorNota);
                    setValue('proveedor', proveedorNota);

                    const proveedorKey = proveedorNota.toLowerCase();
                    const clientMatch = clients.find((client) => {
                        const razon = String(client.razon_social || '').trim().toLowerCase();
                        return razon && razon === proveedorKey;
                    });

                    if (clientMatch) {
                        const clientId = String(clientMatch.id);
                        if (selectedClient !== clientId) {
                            setSelectedClient(clientId);
                        }
                        setClienteRuc(clientMatch.cuit || '');
                        setProveedorNombre(clientMatch.razon_social || proveedorNota);
                        setValue('cliente_id', clientId);
                        setValue('proveedor', clientMatch.razon_social || proveedorNota);
                    } else if (!selectedClient) {
                        setClienteRuc('');
                        setValue('cliente_id', '');
                    }
                }

                // Auto-llenar campos del documento
                if (nota.tipo_documento) setValue('tipo_documento', nota.tipo_documento);
                if (nota.numero_documento) setValue('numero_documento', nota.numero_documento);
                if (nota.fecha) setValue('fecha', nota.fecha.split('T')[0]);

                if (nota.observaciones) {
                    const currentObs = String(getValues('observaciones') || '').trim();
                    if (!currentObs) setValue('observaciones', nota.observaciones);
                }

                // Limpiar productos actuales solo si hay productos en la nota
                if (nota.detalles && nota.detalles.length > 0) {
                    while (fields.length > 0) {
                        remove(0);
                    }

                    // Cargar todos los productos de la nota
                    for (const detalle of nota.detalles) {
                        append({
                            producto_id: detalle.producto_id,
                            producto_codigo: detalle.producto?.codigo || '',
                            producto_nombre: detalle.producto?.descripcion || '',
                            fabricante: detalle.fabricante || detalle.producto?.fabricante || '',
                            lote_numero: detalle.lote_numero || detalle.numero_lote || '',
                            fecha_vencimiento: detalle.fecha_vencimiento,
                            um: detalle.um || detalle.producto?.um || detalle.producto?.unidad || '',
                            temperatura_min: detalle.temperatura_min_c || detalle.producto?.temperatura_min_c || '',
                            temperatura_max: detalle.temperatura_max_c || detalle.producto?.temperatura_max_c || '',
                            cantidad_solicitada: parseFloat(detalle.cantidad_total || 0),
                            cantidad_recibida: parseFloat(detalle.cantidad_total || 0),
                            cantidad_bultos: parseFloat(detalle.cantidad_bultos || 0),
                            cantidad_cajas: parseFloat(detalle.cantidad_cajas || 0),
                            cantidad_por_caja: parseFloat(detalle.cantidad_por_caja || 0),
                            cantidad_fraccion: parseFloat(detalle.cantidad_fraccion || 0),
                            aspecto: 'EMB'
                        });
                    }
                }
            } catch (error) {
                console.error('Error al buscar nota de ingreso:', error);
            }
        };

        // Debounce para evitar múltiples llamadas
        const timeoutId = setTimeout(buscarYCargarNotaIngreso, 500);
        return () => clearTimeout(timeoutId);
    }, [numeroDocumento, clients, selectedClient]);

    // Auto-cálculo de cantidad recibida
    useEffect(() => {
        const c = parseFloat(cajas) || 0;
        const u = parseFloat(unidadesCaja) || 0;
        const f = parseFloat(fraccion) || 0;
        const total = (c * u) + f;

        if (total > 0) {
            setCantidadRecibida(total.toString());
        }
    }, [cajas, unidadesCaja, fraccion]);

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

    const loadProducts = async (filters = {}) => {
        try {
            const productsResponse = await productService.getProducts(filters);
            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
        }
    };

    const loadLotes = async () => {
        try {
            const filters = { producto_id: selectedProduct };
            if (selectedClient && !showAllProducts) {
                filters.cliente_id = selectedClient;
            }
            const lotes = await productService.getLotes(filters);
            const lotesArray = Array.isArray(lotes) ? lotes : [];
            setLotesDisponibles(lotesArray);

            // Auto-seleccionar primer lote
            if (lotesArray.length > 0) {
                setSelectedLoteId(lotesArray[0].id);
            }
        } catch (error) {
            console.error('Error loading lotes:', error);
            setLotesDisponibles([]);
        }
    };

    const loadNotasIngresoDocumentos = async () => {
        try {
            const limit = 200;
            let page = 1;
            let totalPages = 1;
            const allNotas = [];

            while (page <= totalPages) {
                const response = await fetch(`http://127.0.0.1:3000/api/ingresos?page=${page}&limit=${limit}`);
                if (!response.ok) throw new Error('Error al cargar notas de ingreso');

                const result = await response.json();
                const notas = result.data || [];
                const pagination = result.pagination || {};

                allNotas.push(...notas);
                totalPages = Number(pagination.totalPages || 1);
                page += 1;
            }

            setNotasIngresoDocs(allNotas);
        } catch (error) {
            console.error('Error loading documentos de notas ingreso:', error);
            setNotasIngresoDocs([]);
        }
    };

    const handleAddProducto = () => {
        if (!selectedProduct) {
            alert('Seleccione un producto');
            return;
        }
        if (!lote) {
            alert('Ingrese un lote');
            return;
        }
        if (!cantidadSolicitada || parseFloat(cantidadSolicitada) <= 0) {
            alert('Ingrese una cantidad solicitada válida');
            return;
        }
        if (!cantidadRecibida || parseFloat(cantidadRecibida) < 0) {
            alert('Ingrese una cantidad recibida válida');
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProduct));

        append({
            producto_id: parseInt(selectedProduct),
            producto_codigo: product?.codigo || '',
            producto_nombre: product?.descripcion || '',
            fabricante: fabricante || '',
            lote_numero: lote,
            fecha_vencimiento: vencimiento,
            um: um || '',
            temperatura_min: temperaturaMin || '',
            temperatura_max: temperaturaMax || '',
            cantidad_solicitada: parseFloat(cantidadSolicitada),
            cantidad_recibida: parseFloat(cantidadRecibida),
            cantidad_bultos: parseFloat(bultos || 0),
            cantidad_cajas: parseFloat(cajas || 0),
            cantidad_por_caja: parseFloat(unidadesCaja || 0),
            cantidad_fraccion: parseFloat(fraccion || 0),
            aspecto: aspecto
        });

        // Limpiar campos
        setSelectedProduct('');
        setSelectedLoteId('');
        setLote('');
        setVencimiento('');
        setUm('');
        setFabricante('');
        setTemperaturaMin('');
        setTemperaturaMax('');
        setBultos('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setCantidadSolicitada('');
        setCantidadRecibida('');
        setAspecto('EMB');
    };

    const normalizeNullable = (value) => {
        if (value === '' || value === undefined || value === null) return null;
        return value;
    };

    const toNullableNumber = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const toNumberOrZero = (value) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
    };

    const onSubmit = async (data) => {
        try {
            if (!selectedClient) {
                alert('Seleccione un cliente');
                return;
            }
            if (!data.detalles || data.detalles.length === 0) {
                alert('Agregue al menos un producto');
                return;
            }

            const detallesFuente = fields.length > 0 ? fields : (data.detalles || []);
            const detallesNormalizados = detallesFuente.map((detalle, index) => {
                const { id, ...detalleData } = detalle || {};
                const loteNumero = String(detalleData.lote_numero || '').trim();
                if (!loteNumero) {
                    throw new Error(`Producto #${index + 1}: cada producto debe tener un lote válido`);
                }

                return {
                    ...detalleData,
                    producto_id: Number(detalleData.producto_id),
                    lote_numero: loteNumero,
                    fecha_vencimiento: normalizeNullable(detalleData.fecha_vencimiento),
                    um: normalizeNullable(detalleData.um),
                    fabricante: normalizeNullable(detalleData.fabricante),
                    temperatura_min: toNullableNumber(detalleData.temperatura_min),
                    temperatura_max: toNullableNumber(detalleData.temperatura_max),
                    cantidad_solicitada: toNumberOrZero(detalleData.cantidad_solicitada),
                    cantidad_recibida: toNumberOrZero(detalleData.cantidad_recibida),
                    cantidad_bultos: toNumberOrZero(detalleData.cantidad_bultos),
                    cantidad_cajas: toNumberOrZero(detalleData.cantidad_cajas),
                    cantidad_por_caja: toNumberOrZero(detalleData.cantidad_por_caja),
                    cantidad_fraccion: toNumberOrZero(detalleData.cantidad_fraccion),
                    aspecto: detalleData.aspecto || 'EMB',
                    observaciones: normalizeNullable(detalleData.observaciones)
                };
            });

            const payload = {
                fecha: data.fecha,
                tipo_documento: data.tipo_documento,
                numero_documento: data.numero_documento,
                cliente_id: Number(selectedClient),
                proveedor: normalizeNullable(proveedorNombre || clienteRuc),
                tipo_operacion: normalizeNullable(data.tipo_operacion),
                tipo_conteo: normalizeNullable(data.tipo_conteo),
                observaciones: normalizeNullable(data.observaciones),
                responsable_recepcion: normalizeNullable(data.responsable_recepcion),
                responsable_entrega: normalizeNullable(data.responsable_entrega),
                jefe_almacen: normalizeNullable(data.jefe_almacen),
                detalles: detallesNormalizados
            };

            console.log('Payload a enviar:', payload);

            // Aquí se conectaría con el backend
            const response = await fetch('http://127.0.0.1:3000/api/actas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error al crear acta');
            }

            const result = await response.json();
            setLastActaId(result.data?.id || null);

            alert('✅ Acta de Recepción creada exitosamente');
            handleLimpiar();
        } catch (error) {
            console.error(error);
            alert('❌ Error al crear acta: ' + (error.message || 'Verifique los datos'));
        }
    };

    const handleLimpiar = () => {
        reset();
        setSelectedClient('');
        setClienteRuc('');
        setProveedorNombre('');
        setSelectedProduct('');
        setSelectedLoteId('');
        setProducts([]);
        setLotesDisponibles([]);
        setNumeroDocumentoSeleccion('');
        setNumeroDocumentoManual('');
        setLote('');
        setVencimiento('');
        setUm('');
        setFabricante('');
        setTemperaturaMin('');
        setTemperaturaMax('');
        setBultos('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setCantidadSolicitada('');
        setCantidadRecibida('');
        setAspecto('EMB');
    };

    const handleExportPdf = async () => {
        if (!lastActaId) {
            alert('Primero guarde el acta para exportar a PDF');
            return;
        }
        try {
            const pdfUrl = `http://localhost:3000/api/actas/${lastActaId}/pdf`;
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.error(error);
            alert('Error al exportar PDF');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">📋 Acta de Recepción</h1>
                <p className="text-slate-500">Control de calidad y verificación de mercadería recibida</p>
            </div>

            {/* Aviso informativo */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="text-blue-600 text-2xl">ℹ️</div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg mb-1">Importante: Este documento NO modifica el inventario</h3>
                        <p className="text-blue-800 text-sm leading-relaxed">
                            Las <strong>Actas de Recepción</strong> son documentos de control de calidad que verifican la mercadería recibida.
                            <br />
                            <strong>No generan aumentos ni disminuciones en el stock del almacén.</strong> Solo se utilizan para documentar el proceso de inspección y recepción.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Información del Documento */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">📄 Información del Documento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Tipo de Documento *</label>
                            <select {...register('tipo_documento', { required: true })} className="input-premium">
                                <option value="">Seleccione...</option>
                                {tipoDocumentoOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {errors.tipo_documento && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div>
                            <label className="label-premium">Número de Documento *</label>
                            <select
                                value={numeroDocumentoSeleccion}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setNumeroDocumentoSeleccion(value);

                                    if (value === 'OTRO') {
                                        setNumeroDocumentoManual('');
                                        setValue('numero_documento', '');
                                        return;
                                    }

                                    setNumeroDocumentoManual('');
                                    setValue('numero_documento', value);
                                }}
                                className="input-premium"
                            >
                                <option value="">Seleccione...</option>
                                {numeroDocumentoOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                                <option value="OTRO">Otro</option>
                            </select>
                            {numeroDocumentoSeleccion === 'OTRO' && (
                                <input
                                    value={numeroDocumentoManual}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setNumeroDocumentoManual(value);
                                        setValue('numero_documento', value);
                                    }}
                                    className="input-premium mt-2"
                                    placeholder="Ingrese numero de documento"
                                />
                            )}
                            <input type="hidden" {...register('numero_documento', { required: true })} />
                            {errors.numero_documento && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div>
                            <label className="label-premium">Fecha *</label>
                            <input {...register('fecha', { required: true })} type="date" className="input-premium" />
                            {errors.fecha && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                    </div>
                </Card>

                {/* Cliente y Proveedor */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">👥 Cliente y Proveedor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Cliente *</label>
                            <select
                                value={selectedClient}
                                onChange={(e) => {
                                    const clientId = e.target.value;
                                    setSelectedClient(clientId);
                                    const client = clients.find(c => String(c.id) === String(clientId));
                                    if (client) {
                                        setClienteRuc(client.cuit || '');
                                        setProveedorNombre(client.razon_social || '');
                                        setValue('cliente_id', clientId);
                                        setValue('proveedor', client.razon_social);
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
                            {!selectedClient && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div>
                            <label className="label-premium">RUC/CUIT</label>
                            <input value={clienteRuc} readOnly className="input-premium bg-slate-50" />
                        </div>
                        <div>
                            <label className="label-premium">Proveedor</label>
                            <input value={proveedorNombre} readOnly className="input-premium bg-slate-50" />
                        </div>
                    </div>
                </Card>

                {/* Tipo de Operación y Conteo */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">📦 Tipo de Operación y Conteo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label-premium">Tipo de Operación *</label>
                            <select {...register('tipo_operacion', { required: true })} className="input-premium">
                                <option value="">Seleccione...</option>
                                <option value="Importación">Importación</option>
                                <option value="Compra Local">Compra Local</option>
                                <option value="Traslado">Traslado</option>
                                <option value="Devolución">Devolución</option>
                            </select>
                            {errors.tipo_operacion && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div>
                            <label className="label-premium">Tipo de Conteo *</label>
                            <select {...register('tipo_conteo', { required: true })} className="input-premium">
                                <option value="">Seleccione...</option>
                                <option value="Conteo al 100%">Conteo al 100%</option>
                                <option value="Conteo por Muestreo">Conteo por Muestreo</option>
                                <option value="Conteo sin Apertura de Caja">Conteo sin Apertura de Caja</option>
                                <option value="Conteo de ALMT por Temperatura">Conteo de ALMT por Temperatura</option>
                            </select>
                            {errors.tipo_conteo && <span className="text-xs text-red-500">Requerido</span>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Responsable de Recepción (Auxiliar)</label>
                            <input {...register('responsable_recepcion')} className="input-premium" placeholder="Nombre del auxiliar de recepción" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="label-premium">Responsable de Entrega</label>
                            <input {...register('responsable_entrega')} className="input-premium" placeholder="Nombre del responsable" />
                        </div>
                        <div className="md:col-span-1">
                            <label className="label-premium">Jefe de Almacén</label>
                            <input {...register('jefe_almacen')} className="input-premium" placeholder="Nombre del jefe de almacén" />
                        </div>
                    </div>
                </Card>

                {/* Detalle de Productos */}
                <Card className="p-6 bg-blue-50/50 border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">📦 Detalle de Productos</h3>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={showAllProducts}
                                    onChange={(e) => setShowAllProducts(e.target.checked)}
                                    className="rounded"
                                />
                                Mostrar todos
                            </label>
                        </div>
                        <div className="md:col-span-5">
                            <label className="label-premium">Producto</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="input-premium"
                                disabled={!selectedClient}
                            >
                                <option value="">Seleccione producto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.descripcion}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="label-premium">Lote Disponible</label>
                            <select
                                value={selectedLoteId}
                                onChange={(e) => setSelectedLoteId(e.target.value)}
                                className="input-premium"
                                disabled={!selectedProduct}
                            >
                                <option value="">Seleccione lote...</option>
                                {lotesDisponibles.map(lote => (
                                    <option key={lote.id} value={lote.id}>
                                        {lote.numero_lote} (Disp: {lote.cantidad_disponible})
                                    </option>
                                ))}
                                <option value="OTRO">Otro (manual)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Lote/Serie</label>
                            <input
                                type="text"
                                value={lote}
                                onChange={(e) => setLote(e.target.value)}
                                className="input-premium"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-premium">Vencimiento</label>
                            <input
                                type="date"
                                value={vencimiento}
                                onChange={(e) => setVencimiento(e.target.value)}
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">UM</label>
                            <input
                                type="text"
                                value={um}
                                onChange={(e) => setUm(e.target.value)}
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="label-premium">Fabricante</label>
                            <input
                                type="text"
                                value={fabricante}
                                onChange={(e) => setFabricante(e.target.value)}
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Temp Min °C</label>
                            <input
                                type="text"
                                value={temperaturaMin}
                                onChange={(e) => setTemperaturaMin(e.target.value)}
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Temp Max °C</label>
                            <input
                                type="text"
                                value={temperaturaMax}
                                onChange={(e) => setTemperaturaMax(e.target.value)}
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="label-premium">Aspecto</label>
                            <select
                                value={aspecto}
                                onChange={(e) => setAspecto(e.target.value)}
                                className="input-premium"
                            >
                                <option value="EMB">EMB</option>
                                <option value="ENB">ENB</option>
                            </select>
                        </div>

                        {/* Cantidades */}
                        <div className="md:col-span-6 grid grid-cols-2 gap-2 p-3 bg-white rounded-lg border-2 border-blue-300">
                            <div>
                                <label className="text-xs font-bold text-slate-600">Bultos</label>
                                <input
                                    type="number"
                                    value={bultos}
                                    onChange={(e) => setBultos(e.target.value)}
                                    className="input-premium h-9"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Cajas</label>
                                <input
                                    type="number"
                                    value={cajas}
                                    onChange={(e) => setCajas(e.target.value)}
                                    className="input-premium h-9"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Und/Caja</label>
                                <input
                                    type="number"
                                    value={unidadesCaja}
                                    onChange={(e) => setUnidadesCaja(e.target.value)}
                                    className="input-premium h-9"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600">Fracción</label>
                                <input
                                    type="number"
                                    value={fraccion}
                                    onChange={(e) => setFraccion(e.target.value)}
                                    className="input-premium h-9"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-3 grid grid-cols-2 gap-2">
                            <div>
                                <label className="label-premium text-orange-600">Cant. Solicitada</label>
                                <input
                                    type="number"
                                    value={cantidadSolicitada}
                                    onChange={(e) => setCantidadSolicitada(e.target.value)}
                                    className="input-premium border-orange-300"
                                />
                            </div>
                            <div>
                                <label className="label-premium text-green-600">Cant. Recibida</label>
                                <input
                                    type="number"
                                    value={cantidadRecibida}
                                    onChange={(e) => setCantidadRecibida(e.target.value)}
                                    className="input-premium border-green-300 font-bold"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-12 flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => fields.length > 0 && remove(fields.length - 1)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={fields.length === 0}
                            >
                                ➖ Quitar Último
                            </Button>
                            <Button
                                type="button"
                                onClick={handleAddProducto}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                ➕ Agregar Producto
                            </Button>
                        </div>
                    </div>

                    {/* Tabla de productos agregados */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Fabricante</th>
                                    <th className="px-4 py-3">Lote</th>
                                    <th className="px-4 py-3">Vencimiento</th>
                                    <th className="px-4 py-3">UM</th>
                                    <th className="px-4 py-3 text-right">Solicitada</th>
                                    <th className="px-4 py-3 text-right">Recibida</th>
                                    <th className="px-4 py-3 text-center">Aspecto</th>
                                    <th className="px-4 py-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {fields.map((field, index) => (
                                    <tr key={field.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{field.producto_codigo}</td>
                                        <td className="px-4 py-3 font-medium">{field.producto_nombre}</td>
                                        <td className="px-4 py-3 text-xs">{field.fabricante || '-'}</td>
                                        <td className="px-4 py-3">{field.lote_numero}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {field.fecha_vencimiento ? new Date(field.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                                        </td>
                                        <td className="px-4 py-3">{field.um}</td>
                                        <td className="px-4 py-3 text-right text-orange-600 font-semibold">{field.cantidad_solicitada}</td>
                                        <td className="px-4 py-3 text-right text-green-600 font-bold">{field.cantidad_recibida}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${field.aspecto === 'EMB' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {field.aspecto}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold"
                                            >
                                                × Quitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {fields.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-8 text-center text-slate-400 italic">
                                            No hay productos agregados al acta
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Observaciones */}
                <Card className="p-6">
                    <label className="label-premium">Observaciones</label>
                    <textarea
                        {...register('observaciones')}
                        className="input-premium min-h-[100px]"
                        placeholder="Observaciones generales del acta de recepción..."
                    />
                </Card>

                {/* Botones de acción */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
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
                        💾 Guardar Acta de Recepción
                    </Button>
                </div>
            </form>
        </div>
    );
};
