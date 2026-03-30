import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { API_ORIGIN } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
    buildDetalleCalculo,
    coincideCodigoProducto,
    esRucValido,
    getProductFilters,
    normalizarCodigoProducto,
    normalizarFechaInput,
    normalizarRuc,
    normalizarTexto,
    obtenerLoteProducto,
    parseCSVDocument,
    parseCSVLine,
    parseNumber
} from './notaIngreso.utils';

export const NotaIngresoForm = () => {
    const { register, control, handleSubmit, reset, setValue, getValues, formState: { isSubmitting } } = useForm({
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            numero_ingreso: '',
            tipo_documento: '',
            numero_documento: '',
            responsable_id: 1,
            detalles: []
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "detalles"
    });

    const [selectedDetalleIds, setSelectedDetalleIds] = useState({});

    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [clienteRuc, setClienteRuc] = useState('');
    const [proveedorNombre, setProveedorNombre] = useState('');
    const [showAllProducts, setShowAllProducts] = useState(true);
    const [lotesDisponibles, setLotesDisponibles] = useState([]);
    const [selectedLoteId, setSelectedLoteId] = useState('');
    const [lastIngresoId, setLastIngresoId] = useState(null);

    // Calculator State
    const [cajas, setCajas] = useState('');
    const [unidadesCaja, setUnidadesCaja] = useState('');
    const [fraccion, setFraccion] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [quantityManual, setQuantityManual] = useState(false);

    const [bultos, setBultos] = useState('');
    const [um, setUm] = useState('');
    const [fabricante, setFabricante] = useState('');
    const [temperatura, setTemperatura] = useState('25');

    const [lote, setLote] = useState('');
    const [vencimiento, setVencimiento] = useState('');

    // Estados para importación CSV
    const [mostrarModalImportacion, setMostrarModalImportacion] = useState(false);
    const [erroresImportacion, setErroresImportacion] = useState([]);
    const [pendientesResolucionCSV, setPendientesResolucionCSV] = useState([]);
    const [indicePendienteCSV, setIndicePendienteCSV] = useState(0);
    const [mostrarModalResolucionCSV, setMostrarModalResolucionCSV] = useState(false);

    // Estados para selector masivo de productos
    const [filtroProductosMasivos, setFiltroProductosMasivos] = useState('');
    const [productosBusquedaModal, setProductosBusquedaModal] = useState([]);
    const [buscandoProductos, setBuscandoProductos] = useState(false);
    const [modoSeleccionProducto, setModoSeleccionProducto] = useState('masivo');
    const [productoDetalleModal, setProductoDetalleModal] = useState(null);
    const [mostrarModalDetalleProducto, setMostrarModalDetalleProducto] = useState(false);
    const [detalleProductoDraft, setDetalleProductoDraft] = useState({
        lote_numero: '',
        fecha_vencimiento: '',
        um: '',
        fabricante: '',
        temperatura: '25',
        cantidad_bultos: 0,
        cantidad_cajas: 0,
        cantidad_por_caja: 0,
        cantidad_fraccion: 0,
        cantidad_total: 0
    });
    const [mostrarModalMasivo, setMostrarModalMasivo] = useState(false);
    const [uiError, setUiError] = useState('');
    const [uiSuccess, setUiSuccess] = useState('');
    const selectedClientRuc = normalizarRuc(clienteRuc);

    const showError = (message) => {
        setUiSuccess('');
        setUiError(message);
    };

    const showSuccess = (message) => {
        setUiError('');
        setUiSuccess(message);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [selectedClient, selectedClientRuc, showAllProducts]);

    useEffect(() => {
        if (!mostrarModalMasivo) {
            setProductosBusquedaModal([]);
            return;
        }

        const termino = filtroProductosMasivos.trim();
        if (termino.length < 2) {
            setProductosBusquedaModal([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setBuscandoProductos(true);
                const filtros = {
                    busqueda: termino,
                    page: 1,
                    limit: 100
                };

                if (!showAllProducts && selectedClient) {
                    if (selectedClientRuc) {
                        filtros.cliente_ruc = selectedClientRuc;
                    } else {
                        filtros.cliente_id = Number(selectedClient);
                    }
                }

                const response = await productService.getProducts(filtros);
                setProductosBusquedaModal(Array.isArray(response) ? response : []);
            } catch (error) {
                console.error('Error buscando productos:', error);
                setProductosBusquedaModal([]);
                showError('No se pudo buscar productos. Intente nuevamente.');
            } finally {
                setBuscandoProductos(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [mostrarModalMasivo, filtroProductosMasivos, showAllProducts, selectedClient, selectedClientRuc]);

    useEffect(() => {
        if (!selectedClient) {
            setClienteRuc('');
            setProveedorNombre('');
            return;
        }
        const client = clients.find(c => String(c.id) === String(selectedClient));
        if (client) {
            setClienteRuc(client.cuit || '');
            setProveedorNombre(client.razon_social || '');
        }
    }, [selectedClient, clients]);

    useEffect(() => {
        if (!selectedProduct) {
            setLotesDisponibles([]);
            setSelectedLoteId('');
            return;
        }
        const product = products.find(p => p.id === parseInt(selectedProduct));
        setSelectedLoteId(product?.lote ? 'PRODUCTO_LOTE' : '');
        setUm(product?.um || '');
        setFabricante(product?.fabricante || '');
        setTemperatura(String(product?.temperatura ?? product?.temperatura_min_c ?? 25));
        setLote(product?.lote || '');
        setVencimiento(normalizarFechaInput(product?.fecha_vencimiento));
        setBultos(product?.cantidad_bultos ?? '');
        setCajas(product?.cantidad_cajas ?? '');
        setUnidadesCaja(product?.cantidad_por_caja ?? '');
        setFraccion(product?.cantidad_fraccion ?? '');
        setQuantityManual(false);
        setQuantity(0);
        const currentTipo = getValues('tipo_documento');
        const currentNumero = getValues('numero_documento');
        if (!currentTipo && product?.tipo_documento) {
            setValue('tipo_documento', product.tipo_documento);
        }
        if (!currentNumero && product?.numero_documento) {
            setValue('numero_documento', product.numero_documento);
        }
    }, [selectedProduct, products]);

    useEffect(() => {
        const loadLotes = async () => {
            if (!selectedProduct) {
                return;
            }
            try {
                const filters = {
                    producto_id: Number(selectedProduct)
                };
                if (!showAllProducts && selectedClient) {
                    if (selectedClientRuc) {
                        filters.cliente_ruc = selectedClientRuc;
                    } else {
                        filters.cliente_id = Number(selectedClient);
                    }
                }
                const lotes = await productService.getLotes(filters);
                const product = products.find(p => p.id === parseInt(selectedProduct));
                const normalized = Array.isArray(lotes) ? lotes : [];
                if (product?.lote) {
                    const exists = normalized.some(l => String(l.numero_lote) === String(product.lote));
                    if (!exists) {
                        normalized.unshift({
                            id: 'PRODUCTO_LOTE',
                            numero_lote: product.lote,
                            fecha_vencimiento: product.fecha_vencimiento || null,
                            cantidad_ingresada: product.cantidad_total ?? null,
                            cantidad_disponible: product.stock_actual ?? null
                        });
                    }
                }
                setLotesDisponibles(normalized);
            } catch (error) {
                console.error('Error cargando lotes:', error);
                setLotesDisponibles([]);
            }
        };

        loadLotes();
    }, [selectedProduct, selectedClient, showAllProducts, selectedClientRuc]);

    const loadData = async () => {
        // Load Clients
        try {
            const clientsResponse = await clientesService.listar();
            console.log('Clientes cargados:', clientsResponse);
            // Handle both array (direct) or object { success, data } formats
            const clientsArray = Array.isArray(clientsResponse) ? clientsResponse : (clientsResponse.data || []);
            setClients(clientsArray);
        } catch (error) {
            console.error('Error cargando clientes:', error);
            showError('Error al cargar la lista de proveedores. Verifique la conexión con el servidor.');
        }
    };

    const loadProducts = async () => {
        try {
            const filters = getProductFilters({
                showAllProducts,
                selectedClient,
                selectedClientRuc
            });
            if (!filters) {
                setProducts([]);
                return;
            }
            const productsResponse = await productService.getProducts(filters);
            console.log('Productos cargados:', productsResponse);
            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        } catch (error) {
            console.error('Error cargando productos:', error);
            showError('Error al cargar la lista de productos. Verifique la conexión con el servidor.');
        }
    };

    // Auto-calculate quantity
    useEffect(() => {
        if (quantityManual) {
            return;
        }
        const c = parseInt(cajas) || 0;
        const u = parseInt(unidadesCaja) || 0;
        const f = parseInt(fraccion) || 0;
        const total = (c * u) + f;
        setQuantity(total);
    }, [cajas, unidadesCaja, fraccion, quantityManual]);

    const handleCalcChange = (setter) => (e) => {
        setter(e.target.value);
        setQuantityManual(false);
    };

    const handleSelectLote = (value) => {
        setSelectedLoteId(value);
        if (value === 'OTRO' || value === '') {
            if (value === 'OTRO') {
                setLote('');
            }
            return;
        }

        const loteInfo = lotesDisponibles.find(l => String(l.id) === String(value));
        if (loteInfo) {
            setLote(loteInfo.numero_lote || '');
            setVencimiento(normalizarFechaInput(loteInfo.fecha_vencimiento));
            const productoDetalle = loteInfo.producto || products.find(p => p.id === Number(selectedProduct));
            if (productoDetalle) {
                setUm(productoDetalle.um || '');
                setFabricante(productoDetalle.fabricante || '');
                setTemperatura(String(productoDetalle.temperatura ?? productoDetalle.temperatura_min_c ?? 25));
                setBultos(productoDetalle.cantidad_bultos ?? '');
                setCajas(productoDetalle.cantidad_cajas ?? '');
                setUnidadesCaja(productoDetalle.cantidad_por_caja ?? '');
                setFraccion(productoDetalle.cantidad_fraccion ?? '');
                const currentTipo = getValues('tipo_documento');
                const currentNumero = getValues('numero_documento');
                if (!currentTipo && productoDetalle.tipo_documento) {
                    setValue('tipo_documento', productoDetalle.tipo_documento);
                }
                if (!currentNumero && productoDetalle.numero_documento) {
                    setValue('numero_documento', productoDetalle.numero_documento);
                }
            }
            setQuantity(0);
            setQuantityManual(false);
        }
    };

    const handleAddProduct = () => {
        const loteFinal = lote;
        if (!selectedProduct || !quantity || !loteFinal) {
            showError('Seleccione producto, lote y cantidad para agregar el ítem.');
            return;
        }

        if (Number(quantity) <= 0) {
            showError('La cantidad debe ser mayor a 0.');
            return;
        }

        if (vencimiento) {
            const fechaVenc = new Date(vencimiento);
            if (Number.isNaN(fechaVenc.getTime())) {
                showError('La fecha de vencimiento no es válida.');
                return;
            }
        }

        const product = products.find(p => p.id === parseInt(selectedProduct));
        if (!product) {
            showError('El producto seleccionado ya no está disponible. Vuelva a seleccionarlo.');
            return;
        }

        const existingIndex = fields.findIndex(
            field => Number(field.producto_id) === Number(selectedProduct) && field.lote_numero === loteFinal
        );

        if (existingIndex >= 0) {
            const existing = fields[existingIndex];
            update(existingIndex, {
                ...existing,
                cantidad: Number(existing.cantidad || 0) + Number(quantity),
                cantidad_total: Number(existing.cantidad_total || existing.cantidad || 0) + Number(quantity),
                cantidad_bultos: Number(existing.cantidad_bultos || 0) + Number(bultos || 0),
                cantidad_cajas: Number(existing.cantidad_cajas || 0) + Number(cajas || 0),
                cantidad_por_caja: Number(existing.cantidad_por_caja || 0) + Number(unidadesCaja || 0),
                cantidad_fraccion: Number(existing.cantidad_fraccion || 0) + Number(fraccion || 0),
                fecha_vencimiento: vencimiento || existing.fecha_vencimiento,
                um: um || existing.um,
                fabricante: fabricante || existing.fabricante,
                temperatura_min: Number(temperatura || existing.temperatura_min || 25),
                temperatura_max: Number(temperatura || existing.temperatura_max || 25)
            });
        } else {
            append({
                producto_id: parseInt(selectedProduct),
                producto_codigo: product?.codigo || '',
                producto_nombre: product.descripcion,
                cantidad: parseFloat(quantity),
                lote_numero: loteFinal,
                fecha_vencimiento: vencimiento || null,
                um: um || '',
                fabricante: fabricante || '',
                temperatura_min: Number(temperatura || 25),
                temperatura_max: Number(temperatura || 25),
                cantidad_bultos: parseFloat(bultos || 0),
                cantidad_cajas: parseFloat(cajas || 0),
                cantidad_por_caja: parseFloat(unidadesCaja || 0),
                cantidad_fraccion: parseFloat(fraccion || 0),
                cantidad_total: parseFloat(quantity || 0),
                detalle_calculo: buildDetalleCalculo({
                    cantidad_bultos: bultos,
                    cantidad_cajas: cajas,
                    cantidad_por_caja: unidadesCaja,
                    cantidad_fraccion: fraccion
                })
            });
        }

        // Reset fields
        setSelectedProduct('');
        setSelectedLoteId('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setQuantity(0);
        setQuantityManual(false);
        setBultos('');
        setUm('');
        setFabricante('');
        setTemperatura('25');
        setLote('');
        setVencimiento('');
        showSuccess('Producto agregado al detalle con éxito.');
    };

    const agregarDetalleProducto = (producto, detalle) => {
        const loteFinal = String(detalle.lote_numero || '').trim();
        const cantidadTotal = Number(detalle.cantidad_total || 0);

        if (!loteFinal || cantidadTotal <= 0) {
            showError('Complete lote y cantidad total mayor a 0.');
            return false;
        }

        const existingIndex = fields.findIndex(
            field => Number(field.producto_id) === Number(producto.id) && String(field.lote_numero) === loteFinal
        );

        const payload = {
            producto_id: Number(producto.id),
            producto_codigo: producto.codigo || '',
            producto_nombre: producto.descripcion || '',
            cantidad: cantidadTotal,
            lote_numero: loteFinal,
            fecha_vencimiento: normalizarFechaInput(detalle.fecha_vencimiento) || null,
            um: detalle.um || producto.um || producto.unidad || '',
            fabricante: detalle.fabricante || producto.fabricante || '',
            temperatura_min: Number(detalle.temperatura || 25),
            temperatura_max: Number(detalle.temperatura || 25),
            cantidad_bultos: Number(detalle.cantidad_bultos || 0),
            cantidad_cajas: Number(detalle.cantidad_cajas || 0),
            cantidad_por_caja: Number(detalle.cantidad_por_caja || 0),
            cantidad_fraccion: Number(detalle.cantidad_fraccion || 0),
            cantidad_total: cantidadTotal,
            detalle_calculo: buildDetalleCalculo(detalle)
        };

        if (existingIndex >= 0) {
            const existing = fields[existingIndex];
            update(existingIndex, {
                ...existing,
                cantidad: Number(existing.cantidad || 0) + payload.cantidad,
                cantidad_total: Number(existing.cantidad_total || 0) + payload.cantidad_total,
                cantidad_bultos: Number(existing.cantidad_bultos || 0) + payload.cantidad_bultos,
                cantidad_cajas: Number(existing.cantidad_cajas || 0) + payload.cantidad_cajas,
                cantidad_por_caja: Number(existing.cantidad_por_caja || 0) + payload.cantidad_por_caja,
                cantidad_fraccion: Number(existing.cantidad_fraccion || 0) + payload.cantidad_fraccion,
                um: payload.um || existing.um,
                fabricante: payload.fabricante || existing.fabricante,
                temperatura_min: payload.temperatura_min,
                temperatura_max: payload.temperatura_max,
                fecha_vencimiento: payload.fecha_vencimiento || existing.fecha_vencimiento
            });
        } else {
            append(payload);
        }

        return true;
    };

    const abrirModalDetalleProducto = (producto) => {
        setProductoDetalleModal(producto);
        setDetalleProductoDraft({
            lote_numero: producto.lote || '',
            fecha_vencimiento: normalizarFechaInput(producto.fecha_vencimiento),
            um: producto.um || producto.unidad || '',
            fabricante: producto.fabricante || '',
            temperatura: String(producto.temperatura ?? producto.temperatura_min_c ?? 25),
            cantidad_bultos: Number(producto.cantidad_bultos || 0),
            cantidad_cajas: Number(producto.cantidad_cajas || 0),
            cantidad_por_caja: Number(producto.cantidad_por_caja || 0),
            cantidad_fraccion: Number(producto.cantidad_fraccion || 0),
            cantidad_total: 0
        });
        setMostrarModalDetalleProducto(true);
    };

    const handleDetalleDraftChange = (field, value) => {
        setDetalleProductoDraft((prev) => {
            const next = {
                ...prev,
                [field]: value
            };

            if (['cantidad_cajas', 'cantidad_por_caja', 'cantidad_fraccion'].includes(field)) {
                const total = (Number(next.cantidad_cajas) || 0) * (Number(next.cantidad_por_caja) || 0)
                    + (Number(next.cantidad_fraccion) || 0);
                next.cantidad_total = total;
            }

            return next;
        });
    };

    const handleGuardarDetalleProductoModal = () => {
        if (!productoDetalleModal) {
            return;
        }

        const agregado = agregarDetalleProducto(productoDetalleModal, detalleProductoDraft);
        if (!agregado) {
            return;
        }

        setMostrarModalDetalleProducto(false);
        setProductoDetalleModal(null);
        showSuccess('Producto guardado con éxito.');
    };

    const productosSeleccionablesModal = filtroProductosMasivos.trim().length >= 2
        ? productosBusquedaModal
        : [];

    const productoSeleccionado = products.find((p) => String(p.id) === String(selectedProduct));

    const abrirModalBusquedaProductos = (modo = 'masivo') => {
        setModoSeleccionProducto(modo);
        setFiltroProductosMasivos('');
        setProductosBusquedaModal([]);
        setMostrarModalMasivo(true);
    };

    const seleccionarProductoDesdeModal = (producto) => {
        setProducts((prev) => {
            const existe = prev.some((p) => Number(p.id) === Number(producto.id));
            if (existe) {
                return prev;
            }
            return [...prev, producto];
        });
        setSelectedProduct(String(producto.id));
        setMostrarModalMasivo(false);
        showSuccess(`Producto seleccionado: ${producto.codigo} - ${producto.descripcion}`);
    };

    const handleToggleDetalle = (id) => {
        setSelectedDetalleIds((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleRemoveSelected = () => {
        const indices = fields.reduce((acc, field, index) => {
            if (selectedDetalleIds[field.id]) {
                acc.push(index);
            }
            return acc;
        }, []);

        if (indices.length === 0) {
            showError('Seleccione al menos un producto para quitar.');
            return;
        }

        remove(indices);
        setSelectedDetalleIds({});
        showSuccess('Producto(s) retirado(s) del detalle.');
    };

    const onSubmit = async (data) => {
        try {
            if (!selectedClient) {
                showError('Seleccione un cliente antes de guardar.');
                return;
            }

            const detallesSanitizados = (data.detalles || []).map((d) => ({
                ...d,
                lote_numero: String(d.lote_numero || '').trim(),
                fecha_vencimiento: normalizarFechaInput(d.fecha_vencimiento) || null,
                cantidad: Number(d.cantidad_total || d.cantidad || 0),
                cantidad_total: Number(d.cantidad_total || d.cantidad || 0),
                cantidad_bultos: Number(d.cantidad_bultos || 0),
                cantidad_cajas: Number(d.cantidad_cajas || 0),
                cantidad_por_caja: Number(d.cantidad_por_caja || 0),
                cantidad_fraccion: Number(d.cantidad_fraccion || 0)
            })).filter((d) => d.producto_id && d.lote_numero && Number(d.cantidad) > 0);

            if (detallesSanitizados.length === 0) {
                showError('No hay detalles válidos para guardar. Verifica lote y cantidad mayor a 0.');
                return;
            }

            const payload = {
                fecha: data.fecha,
                ruc_cliente: clienteRuc,
                proveedor: proveedorNombre || clienteRuc || String(selectedClient),
                tipo_documento: data.tipo_documento || null,
                numero_documento: data.numero_documento || null,
                responsable_id: data.responsable_id,
                detalles: detallesSanitizados,
                observaciones: data.numero_ingreso ? `Documento: ${data.numero_ingreso}` : undefined
            };
            const created = await operationService.createIngreso(payload);
            setLastIngresoId(created?.id || null);
            showSuccess('Nota de ingreso registrada con éxito.');
            reset();
            setSelectedProduct('');
            setSelectedLoteId('');
            setLote('');
            setVencimiento('');
            setBultos('');
            setCajas('');
            setUnidadesCaja('');
            setFraccion('');
            setUm('');
            setFabricante('');
            setTemperatura('25');
            setQuantity(0);
            setQuantityManual(false);
        } catch (error) {
            console.error(error);
            if (error?.code === 'ECONNABORTED') {
                showError('La carga tardó demasiado y superó el tiempo de espera. Intenta con menos filas por archivo o aumenta el timeout del frontend.');
                return;
            }
            const mensaje = error?.response?.data?.error || error?.response?.data?.message || 'Verifique los datos.';
            showError(`Error al registrar ingreso. ${mensaje}`);
        }
    };

    const handleExportPdf = async () => {
        if (!lastIngresoId) {
            showError('Primero guarda la nota de ingreso para exportar PDF.');
            return;
        }
        try {
            const pdfUrl = `${API_ORIGIN}/api/ingresos/${lastIngresoId}/pdf`;
            const opened = window.open(pdfUrl, '_blank');
            if (!opened) {
                showError('No se pudo abrir el PDF. Verifica los bloqueos de ventanas emergentes.');
            }
        } catch (error) {
            console.error(error);
            showError('Error al exportar PDF.');
        }
    };

    const handleLimpiar = () => {
        reset();
        setSelectedProduct('');
        setSelectedClient('');
        setClienteRuc('');
        setProveedorNombre('');
        setSelectedLoteId('');
        setLote('');
        setVencimiento('');
        setCajas('');
        setUnidadesCaja('');
        setFraccion('');
        setQuantity(0);
        setQuantityManual(false);
        setBultos('');
        setUm('');
        setFabricante('');
        setTemperatura('25');
        setLastIngresoId(null);
        setSelectedDetalleIds({});
        setFiltroProductosMasivos('');
        setMostrarModalMasivo(false);
        setMostrarModalDetalleProducto(false);
        setProductoDetalleModal(null);
        setUiError('');
        setUiSuccess('');
    };

    const handleUpdateDetalle = (index, field, value) => {
        const detalleActual = fields[index];
        if (!detalleActual) {
            return;
        }

        const next = {
            ...detalleActual,
            [field]: value
        };

        if (['cantidad_bultos', 'cantidad_cajas', 'cantidad_por_caja', 'cantidad_fraccion', 'cantidad_total'].includes(field)) {
            next[field] = value === '' ? 0 : Number(value);
        }

        if (['cantidad_cajas', 'cantidad_por_caja', 'cantidad_fraccion'].includes(field)) {
            const total = (Number(next.cantidad_cajas) || 0) * (Number(next.cantidad_por_caja) || 0)
                + (Number(next.cantidad_fraccion) || 0);
            next.cantidad_total = total;
            next.cantidad = total;
        }

        if (field === 'cantidad_total') {
            next.cantidad = Number(next.cantidad_total || 0);
        }

        if (field === 'temperatura') {
            const t = Number(value || 25);
            next.temperatura_min = t;
            next.temperatura_max = t;
        }

        update(index, next);
    };

    const buscarClientePorRuc = (ruc) => {
        const normalized = normalizarRuc(ruc);
        if (!normalized) return null;

        return clients.find((client) => {
            const candidato = normalizarRuc(client.cuit || client.ruc || client.ruc_cliente || '');
            return candidato === normalized;
        }) || null;
    };

    const construirDetalleDesdeCSV = (producto, row) => {
        const temperatura = parseNumber(
            row.temperatura || row.temperatura_min || row.temperatura_max || producto.temperatura || producto.temperatura_min_c || 25,
            25
        );
        const cantidadTotal = parseNumber(row.cantidad_total, 0);

        return {
            producto_id: producto.id,
            producto_nombre: producto.descripcion,
            producto_codigo: producto.codigo,
            lote_numero: row.lote,
            fecha_vencimiento: normalizarFechaInput(row.fecha_vencimiento) || null,
            cantidad_bultos: parseNumber(row.cantidad_bultos, 0),
            cantidad_cajas: parseNumber(row.cantidad_cajas, 0),
            cantidad_por_caja: parseNumber(row.cantidad_por_caja, 0),
            cantidad_fraccion: parseNumber(row.cantidad_fraccion, 0),
            cantidad_total: cantidadTotal,
            cantidad: cantidadTotal,
            um: row.um || producto.um || producto.unidad || '',
            fabricante: row.fabricante || producto.fabricante || '',
            temperatura_min: temperatura,
            temperatura_max: temperatura,
            temperatura_min_c: temperatura,
            temperatura_max_c: temperatura,
            detalle_calculo: buildDetalleCalculo({
                cantidad_bultos: row.cantidad_bultos,
                cantidad_cajas: row.cantidad_cajas,
                cantidad_por_caja: row.cantidad_por_caja,
                cantidad_fraccion: row.cantidad_fraccion
            })
        };
    };

    const agregarDetalleImportado = (detalle) => {
        const loteFinal = String(detalle.lote_numero || '').trim();
        const detallesActuales = getValues('detalles') || [];
        const existingIndex = detallesActuales.findIndex(
            (field) => Number(field.producto_id) === Number(detalle.producto_id)
                && String(field.lote_numero || '').trim() === loteFinal
        );

        if (existingIndex >= 0) {
            const existing = detallesActuales[existingIndex];
            update(existingIndex, {
                ...existing,
                cantidad: Number(existing.cantidad || 0) + Number(detalle.cantidad || 0),
                cantidad_total: Number(existing.cantidad_total || 0) + Number(detalle.cantidad_total || 0),
                cantidad_bultos: Number(existing.cantidad_bultos || 0) + Number(detalle.cantidad_bultos || 0),
                cantidad_cajas: Number(existing.cantidad_cajas || 0) + Number(detalle.cantidad_cajas || 0),
                cantidad_por_caja: Number(existing.cantidad_por_caja || 0) + Number(detalle.cantidad_por_caja || 0),
                cantidad_fraccion: Number(existing.cantidad_fraccion || 0) + Number(detalle.cantidad_fraccion || 0),
                um: detalle.um || existing.um,
                fabricante: detalle.fabricante || existing.fabricante,
                fecha_vencimiento: detalle.fecha_vencimiento || existing.fecha_vencimiento,
                temperatura_min: Number(detalle.temperatura_min ?? existing.temperatura_min ?? 25),
                temperatura_max: Number(detalle.temperatura_max ?? existing.temperatura_max ?? 25)
            });
            return;
        }

        append(detalle);
    };

    const handleImportarCSV = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setErroresImportacion([]);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = String(e.target.result || '').replace(/^\uFEFF/, '');
                const { delimiter, rows } = parseCSVDocument(text);

                if (rows.length < 2) {
                    showError('El archivo CSV está vacío o no tiene datos.');
                    return;
                }

                // Parsear encabezados
                const headers = rows[0].map((h) => String(h || '').trim().toLowerCase());
                const errores = [];
                const productosImportados = [];
                const pendientes = [];

                // Validar encabezados requeridos
                const requeridos = ['ruc_cliente', 'codigo_producto', 'lote', 'cantidad_total'];
                const faltantes = requeridos.filter(r => !headers.includes(r));

                if (faltantes.length > 0) {
                    showError(`Faltan columnas requeridas: ${faltantes.join(', ')}`);
                    setErroresImportacion([`Columnas faltantes: ${faltantes.join(', ')}`]);
                    return;
                }

                let rucDetectado = '';

                // Procesar cada fila
                for (let i = 1; i < rows.length; i++) {
                    let values = Array.isArray(rows[i]) ? [...rows[i]] : [];

                    // Algunas exportaciones mezclan delimitador por fila.
                    const altDelimiter = delimiter === ',' ? ';' : ',';
                    const rawLine = values.join(delimiter);
                    if ((values.length <= 1 || values.length < headers.length) && rawLine.includes(altDelimiter)) {
                        const altValues = parseCSVLine(rawLine, altDelimiter);
                        if (altValues.length > values.length) {
                            values = altValues;
                        }
                    }

                    values = values.map((value) => String(value || '').trim());

                    // Si falta ruc_cliente en filas posteriores, se asume el detectado.
                    if (rucDetectado && values.length === headers.length - 1) {
                        values = [rucDetectado, ...values];
                    }

                    const row = {};

                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });

                    let rucFila = String(row.ruc_cliente || '').trim();

                    if ((!rucFila || !esRucValido(rucFila)) && rucDetectado && esRucValido(rucDetectado)) {
                        row.ruc_cliente = rucDetectado;
                        rucFila = rucDetectado;
                    }

                    if ((!rucFila || !esRucValido(rucFila)) && !rucDetectado && clients.length === 1) {
                        const clienteUnico = clients[0] || {};
                        const rucClienteUnico = String(
                            clienteUnico.cuit || clienteUnico.ruc || clienteUnico.ruc_cliente || ''
                        ).trim();
                        if (esRucValido(rucClienteUnico)) {
                            row.ruc_cliente = rucClienteUnico;
                            rucFila = rucClienteUnico;
                        }
                    }

                    if (!rucFila || !esRucValido(rucFila)) {
                        errores.push(`Fila ${i + 1}: Falta ruc_cliente`);
                        continue;
                    }

                    if (!rucDetectado) {
                        rucDetectado = rucFila;
                    } else if (normalizarRuc(rucDetectado) !== normalizarRuc(rucFila)) {
                        errores.push(`Fila ${i + 1}: El ruc_cliente no coincide con el resto del archivo (${rucFila})`);
                        continue;
                    }

                    try {
                        const codigoBuscado = normalizarCodigoProducto(row.codigo_producto);
                        const loteBuscado = normalizarTexto(row.lote);
                        const candidatosCodigo = products.filter(
                            (p) => coincideCodigoProducto(p, codigoBuscado)
                        );

                        if (candidatosCodigo.length === 0) {
                            errores.push(`Fila ${i + 1}: Producto con código "${row.codigo_producto}" no encontrado`);
                            continue;
                        }

                        const candidatosPorLote = loteBuscado
                            ? candidatosCodigo.filter((p) => normalizarTexto(obtenerLoteProducto(p)) === loteBuscado)
                            : candidatosCodigo;

                        let productoSeleccionado = null;
                        if (candidatosPorLote.length === 1) {
                            productoSeleccionado = candidatosPorLote[0];
                        } else if (candidatosCodigo.length === 1) {
                            productoSeleccionado = candidatosCodigo[0];
                        }

                        let cantidadTotal = parseNumber(row.cantidad_total, NaN);
                        if (!Number.isFinite(cantidadTotal) || cantidadTotal <= 0) {
                            const posiblesCantidades = [
                                row.cantidad,
                                row.cant_total,
                                row.cantidad_ingreso,
                                row.cant_total_ingreso,
                                row['cant.total_ingreso'],
                                values[values.length - 1]
                            ];

                            for (const posible of posiblesCantidades) {
                                const parsed = parseNumber(posible, NaN);
                                if (Number.isFinite(parsed) && parsed > 0) {
                                    cantidadTotal = parsed;
                                    row.cantidad_total = String(posible);
                                    break;
                                }
                            }
                        }

                        // Validar cantidad_total
                        if (!Number.isFinite(cantidadTotal) || cantidadTotal <= 0) {
                            errores.push(`Fila ${i + 1}: Cantidad total inválida`);
                            continue;
                        }

                        if (!productoSeleccionado) {
                            pendientes.push({
                                row,
                                rowNumber: i + 1,
                                opciones: candidatosPorLote.length > 1 ? candidatosPorLote : candidatosCodigo
                            });
                            continue;
                        }

                        const detalle = construirDetalleDesdeCSV(productoSeleccionado, row);
                        productosImportados.push(detalle);
                    } catch (error) {
                        errores.push(`Fila ${i + 1}: Error al procesar - ${error.message}`);
                    }
                }

                if (!rucDetectado) {
                    showError('No se pudo identificar ruc_cliente en el CSV.');
                    setErroresImportacion((prev) => [...prev, 'No se encontró ruc_cliente válido en las filas.']);
                    event.target.value = '';
                    return;
                }

                const clienteDetectado = buscarClientePorRuc(rucDetectado);
                if (!clienteDetectado) {
                    showError(`No existe un cliente con RUC ${rucDetectado} en el sistema.`);
                    setErroresImportacion((prev) => [...prev, `RUC no encontrado en clientes: ${rucDetectado}`]);
                    event.target.value = '';
                    return;
                }

                setSelectedClient(String(clienteDetectado.id));
                setClienteRuc(clienteDetectado.cuit || clienteDetectado.ruc || rucDetectado);
                setProveedorNombre(clienteDetectado.razon_social || '');

                // Agregar productos importados al formulario
                if (productosImportados.length > 0) {
                    productosImportados.forEach((producto) => agregarDetalleImportado(producto));
                    showSuccess(`${productosImportados.length} productos importados correctamente.`);
                }

                if (pendientes.length > 0) {
                    setPendientesResolucionCSV(pendientes);
                    setIndicePendienteCSV(0);
                    setMostrarModalResolucionCSV(true);
                    showError(`Hay ${pendientes.length} fila(s) con múltiples coincidencias de código. Seleccione la opción correcta para cada una.`);
                }

                // Mostrar errores si existen
                if (errores.length > 0) {
                    setErroresImportacion(errores);
                    console.error('Errores de importación:', errores);
                }

                if (pendientes.length === 0) {
                    setMostrarModalImportacion(false);
                }
                event.target.value = ''; // Limpiar input file
            } catch (error) {
                console.error('Error al procesar CSV:', error);
                showError('Error al procesar el archivo CSV: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    const descargarPlantillaCSV = () => {
        const headers = [
            'ruc_cliente',
            'codigo_producto',
            'lote',
            'fecha_vencimiento',
            'cantidad_bultos',
            'cantidad_cajas',
            'cantidad_por_caja',
            'cantidad_fraccion',
            'cantidad_total',
            'um',
            'fabricante',
            'temperatura'
        ];

        // Usar códigos reales del sistema
        const ejemplos = [
            ['20123456789', 'MED-003', 'LOTE-2024-001', '2025-12-31', '2', '10', '50', '5', '505', 'UND', 'Laboratorio ABC', '25'],
            ['20123456789', 'MED-007', 'LOTE-2024-002', '2026-06-15', '1', '5', '100', '0', '500', 'UND', 'Farmacia XYZ', '25'],
            ['20123456789', 'INS-004', 'LOTE-2024-003', '2027-03-20', '3', '8', '25', '10', '210', 'UND', 'Insumos Med', '25']
        ];

        const csvContent = headers.join(',') + '\n' + ejemplos.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'plantilla_nota_ingreso.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const resolverPendienteCSV = (productoSeleccionado) => {
        const pendiente = pendientesResolucionCSV[indicePendienteCSV];
        if (!pendiente || !productoSeleccionado) {
            return;
        }

        const detalle = construirDetalleDesdeCSV(productoSeleccionado, pendiente.row);
        agregarDetalleImportado(detalle);

        const siguiente = indicePendienteCSV + 1;
        if (siguiente >= pendientesResolucionCSV.length) {
            setMostrarModalResolucionCSV(false);
            setPendientesResolucionCSV([]);
            setIndicePendienteCSV(0);
            setMostrarModalImportacion(false);
            showSuccess('Se completó la resolución de productos ambiguos y se agregaron al detalle.');
            return;
        }

        setIndicePendienteCSV(siguiente);
    };

    const resolverTodosConPrimeraOpcionCSV = () => {
        const pendientes = pendientesResolucionCSV.slice(indicePendienteCSV);
        if (pendientes.length === 0) {
            return;
        }

        let importados = 0;
        let omitidos = 0;

        pendientes.forEach((pendiente) => {
            const primeraOpcion = (pendiente.opciones || [])[0];
            if (!primeraOpcion) {
                omitidos += 1;
                setErroresImportacion((prev) => [
                    ...prev,
                    `Fila ${pendiente.rowNumber}: sin opciones para selección automática (código ${pendiente.row.codigo_producto || 'N/A'})`
                ]);
                return;
            }

            const detalle = construirDetalleDesdeCSV(primeraOpcion, pendiente.row);
            agregarDetalleImportado(detalle);
            importados += 1;
        });

        setMostrarModalResolucionCSV(false);
        setPendientesResolucionCSV([]);
        setIndicePendienteCSV(0);
        setMostrarModalImportacion(false);

        if (omitidos > 0) {
            showSuccess(`Se importaron ${importados} fila(s) con la primera opción automática. ${omitidos} fila(s) quedaron omitidas.`);
            return;
        }

        showSuccess(`Se importaron ${importados} fila(s) usando la primera opción automática.`);
    };

    const omitirPendienteCSV = () => {
        const pendiente = pendientesResolucionCSV[indicePendienteCSV];
        if (pendiente) {
            setErroresImportacion((prev) => [
                ...prev,
                `Fila ${pendiente.rowNumber}: omitida por selección manual del usuario (código ${pendiente.row.codigo_producto || 'N/A'})`
            ]);
        }

        const siguiente = indicePendienteCSV + 1;
        if (siguiente >= pendientesResolucionCSV.length) {
            setMostrarModalResolucionCSV(false);
            setPendientesResolucionCSV([]);
            setIndicePendienteCSV(0);
            setMostrarModalImportacion(false);
            showSuccess('Resolución finalizada. Se importaron las filas válidas y se omitieron las no seleccionadas.');
            return;
        }

        setIndicePendienteCSV(siguiente);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">📥 Registro de Ingreso</h2>
                    <p className="text-slate-500">Recepción de mercadería y alta de lotes</p>
                </div>
            </div>

            {uiError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {uiError}
                </div>
            )}

            {uiSuccess && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {uiSuccess}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Datos Generales */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Ingreso Individual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Código de Cliente</label>
                            <select
                                value={selectedClient}
                                onChange={(e) => {
                                    setSelectedClient(e.target.value);
                                    setSelectedProduct('');
                                    setSelectedLoteId('');
                                    setLote('');
                                    setVencimiento('');
                                    const client = clients.find(c => String(c.id) === String(e.target.value));
                                    if (client) {
                                        setProveedorNombre(client.razon_social || '');
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
                        </div>
                        <div>
                            <label className="label-premium">RUC de Cliente</label>
                            <input value={clienteRuc} readOnly className="input-premium" />
                        </div>
                        <div>
                            <label className="label-premium">Mostrar productos</label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="showAllProducts"
                                    type="checkbox"
                                    checked={showAllProducts}
                                    onChange={(e) => setShowAllProducts(e.target.checked)}
                                />
                                <label htmlFor="showAllProducts" className="text-sm text-slate-600">
                                    Mostrar todos
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="label-premium">Producto</label>
                            <div className="space-y-2">
                                <input
                                    value={productoSeleccionado ? `${productoSeleccionado.codigo} - ${productoSeleccionado.descripcion}` : ''}
                                    readOnly
                                    className="input-premium"
                                    placeholder="Buscar y seleccionar producto"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => abrirModalBusquedaProductos('individual')}
                                    className="w-full"
                                >
                                    Buscar producto
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="label-premium">Lote existente</label>
                            <select
                                value={selectedLoteId}
                                onChange={(e) => handleSelectLote(e.target.value)}
                                className="input-premium"
                                disabled={!selectedProduct}
                            >
                                <option value="">Seleccione lote...</option>
                                {lotesDisponibles.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.numero_lote}
                                    </option>
                                ))}
                                <option value="OTRO">Otro (manual)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Lote</label>
                            <input
                                value={lote}
                                onChange={(e) => setLote(e.target.value)}
                                type="text"
                                className="input-premium"
                                placeholder="Ingrese lote..."
                                readOnly={selectedLoteId !== 'OTRO' && selectedLoteId !== ''}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Datos del Documento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="label-premium">Tipo de Documento</label>
                            <select
                                {...register('tipo_documento')}
                                className="input-premium"
                            >
                                <option value="">Seleccione...</option>
                                <option value="Factura">Factura</option>
                                <option value="Invoice">Invoice</option>
                                <option value="Boleta de Venta">Boleta de Venta</option>
                                <option value="Guía de Remisión Remitente">Guía de Remisión Remitente</option>
                                <option value="Guía de Remisión Transportista">Guía de Remisión Transportista</option>
                                <option value="Orden de Compra">Orden de Compra</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Número de Documento</label>
                            <input
                                {...register('numero_documento')}
                                type="text"
                                className="input-premium"
                                placeholder="Ej: F001-000213"
                            />
                        </div>
                        <div>
                            <label className="label-premium">Fecha de Ingreso</label>
                            <input
                                {...register('fecha', { required: 'Requerido' })}
                                type="date"
                                className="input-premium"
                            />
                        </div>
                    </div>
                </Card>

                {/* Agregar Productos */}
                <Card className="p-6 bg-blue-50/50 border-blue-100">
                    {/* Selector Masivo por Lista de Productos */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Selector Masivo de Productos
                        </h4>
                        <div className="flex gap-3 items-center">
                            <Button
                                type="button"
                                onClick={() => abrirModalBusquedaProductos('masivo')}
                                variant="primary"
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Seleccionar productos
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setErroresImportacion([]);
                                    setMostrarModalImportacion(true);
                                }}
                                variant="secondary"
                            >
                                Importar CSV
                            </Button>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                            💡 Elige productos de la lista, configura bultos/cajas/unidades/fracción y agrégalos al detalle.
                        </p>
                    </div>

                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Detalle de Productos (Lotes)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="label-premium">Vencimiento</label>
                            <input
                                value={vencimiento}
                                onChange={(e) => setVencimiento(e.target.value)}
                                type="date"
                                className="input-premium"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label-premium">UM</label>
                            <select
                                value={um}
                                onChange={(e) => setUm(e.target.value)}
                                className="input-premium"
                            >
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
                        <div className="md:col-span-2">
                            <label className="label-premium">Fabricante</label>
                            <input
                                value={fabricante}
                                onChange={(e) => setFabricante(e.target.value)}
                                type="text"
                                className="input-premium"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label-premium">Temperatura (°C)</label>
                            <input
                                value={temperatura}
                                onChange={(e) => setTemperatura(e.target.value)}
                                type="number"
                                step="0.01"
                                className="input-premium"
                            />
                        </div>

                        {/* Calculator Section */}
                        <div className="md:col-span-6 grid grid-cols-3 gap-2 p-2 bg-white rounded-lg border border-blue-200">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Bulto</label>
                                <input
                                    type="number"
                                    value={bultos}
                                    onChange={handleCalcChange(setBultos)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cajas</label>
                                <input
                                    type="number"
                                    value={cajas}
                                    onChange={handleCalcChange(setCajas)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Und/Caja</label>
                                <input
                                    type="number"
                                    value={unidadesCaja}
                                    onChange={handleCalcChange(setUnidadesCaja)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Fracción</label>
                                <input
                                    type="number"
                                    value={fraccion}
                                    onChange={handleCalcChange(setFraccion)}
                                    className="input-premium h-8 text-sm p-1"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-3 flex justify-between items-center pt-1 border-t border-slate-100 mt-1">
                                <span className="text-xs text-slate-400 font-medium">Total Unidades:</span>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        setQuantity(Number(e.target.value));
                                        setQuantityManual(true);
                                    }}
                                    className="input-premium h-8 text-sm p-1 w-24 text-right"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-12 flex justify-end">
                            <Button type="button" onClick={handleAddProduct} variant="primary" className="w-full md:w-auto">
                                + Agregar Item
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Tabla de Items */}
                <div className="rounded-xl border border-slate-200 overflow-x-auto overflow-y-hidden bg-white shadow-sm">
                    <table className="min-w-max w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 text-center">Sel</th>
                                <th className="px-6 py-4">Cod.Producto</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Lote</th>
                                <th className="px-6 py-4">Vencimiento</th>
                                <th className="px-6 py-4">UM</th>
                                <th className="px-6 py-4">Fabri.</th>
                                <th className="px-6 py-4">Temp (°C)</th>
                                <th className="px-6 py-4">Cant.Bulto</th>
                                <th className="px-6 py-4">Cant.Cajas</th>
                                <th className="px-6 py-4">Cant.x Caja</th>
                                <th className="px-6 py-4">Cant.Fracción</th>
                                <th className="px-6 py-4 text-right">Cant.Total</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fields.map((field, index) => (
                                <tr key={field.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(selectedDetalleIds[field.id])}
                                            onChange={() => handleToggleDetalle(field.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs">{field.producto_codigo || '-'}</td>
                                    <td className="px-6 py-3 font-medium text-slate-700">{field.producto_nombre}</td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="text"
                                            value={field.lote_numero || ''}
                                            onChange={(e) => handleUpdateDetalle(index, 'lote_numero', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 min-w-[120px]"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="date"
                                            value={field.fecha_vencimiento || ''}
                                            onChange={(e) => handleUpdateDetalle(index, 'fecha_vencimiento', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 min-w-[140px]"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="text"
                                            value={field.um || ''}
                                            onChange={(e) => handleUpdateDetalle(index, 'um', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 min-w-[70px]"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="text"
                                            value={field.fabricante || ''}
                                            onChange={(e) => handleUpdateDetalle(index, 'fabricante', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 min-w-[120px]"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="number"
                                            value={field.temperatura_min ?? field.temperatura_max ?? 25}
                                            onChange={(e) => handleUpdateDetalle(index, 'temperatura', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 w-20"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="number"
                                            value={field.cantidad_bultos ?? 0}
                                            onChange={(e) => handleUpdateDetalle(index, 'cantidad_bultos', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 w-20"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="number"
                                            value={field.cantidad_cajas ?? 0}
                                            onChange={(e) => handleUpdateDetalle(index, 'cantidad_cajas', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 w-20"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="number"
                                            value={field.cantidad_por_caja ?? 0}
                                            onChange={(e) => handleUpdateDetalle(index, 'cantidad_por_caja', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 w-20"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="number"
                                            value={field.cantidad_fraccion ?? 0}
                                            onChange={(e) => handleUpdateDetalle(index, 'cantidad_fraccion', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 w-20"
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold text-blue-600">
                                        <input
                                            type="number"
                                            value={field.cantidad_total ?? field.cantidad ?? 0}
                                            onChange={(e) => handleUpdateDetalle(index, 'cantidad_total', e.target.value)}
                                            className="input-premium h-8 text-xs p-1 w-24 text-right"
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title="Eliminar ítem"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {fields.length === 0 && (
                                <tr>
                                    <td colSpan={14} className="px-6 py-8 text-center text-slate-400 italic">
                                        No hay productos agregados a la nota.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleRemoveSelected}
                        disabled={fields.length === 0}
                    >
                        Quitar seleccionados
                    </Button>
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

            {/* Modal de Importación CSV - Simplificado */}
            {mostrarModalImportacion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMostrarModalImportacion(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">📊 Importar desde CSV</h2>
                                    <p className="text-white/90 text-sm mt-1">Carga múltiples productos de una vez</p>
                                </div>
                                <button
                                    onClick={() => setMostrarModalImportacion(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                            {/* Instrucciones Compactas */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <span className="text-xl">📋</span>
                                    Pasos Rápidos
                                </h3>
                                <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
                                    <li>Descarga la plantilla CSV</li>
                                    <li>Ábrela con Excel y completa los datos</li>
                                    <li>Guarda como CSV y selecciona el archivo</li>
                                </ol>
                            </div>

                            {/* Columnas Requeridas - Vista Compacta */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-200">
                                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <span className="text-xl">⚠️</span>
                                    Columnas Obligatorias
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                                        <p className="font-mono font-bold text-sm text-slate-800">ruc_cliente</p>
                                        <p className="text-xs text-slate-600 mt-1">RUC del cliente (una sola nota por archivo)</p>
                                        <p className="text-xs text-slate-500 mt-1">Ej: <span className="font-mono bg-slate-100 px-1 rounded">20123456789</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                                        <p className="font-mono font-bold text-sm text-slate-800">codigo_producto</p>
                                        <p className="text-xs text-slate-600 mt-1">Código del producto en el sistema</p>
                                        <p className="text-xs text-slate-500 mt-1">Ej: <span className="font-mono bg-slate-100 px-1 rounded">PROD001</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                                        <p className="font-mono font-bold text-sm text-slate-800">lote</p>
                                        <p className="text-xs text-slate-600 mt-1">Número de lote</p>
                                        <p className="text-xs text-slate-500 mt-1">Ej: <span className="font-mono bg-slate-100 px-1 rounded">LOTE-2024-001</span></p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                                        <p className="font-mono font-bold text-sm text-slate-800">cantidad_total</p>
                                        <p className="text-xs text-slate-600 mt-1">Cantidad total de unidades</p>
                                        <p className="text-xs text-slate-500 mt-1">Ej: <span className="font-mono bg-slate-100 px-1 rounded">505</span></p>
                                    </div>
                                </div>
                                <details className="mt-3">
                                    <summary className="text-xs text-amber-800 cursor-pointer hover:text-amber-900 font-medium">
                                        Ver todas las columnas disponibles (13 en total)
                                    </summary>
                                    <div className="mt-3 text-xs text-slate-600 bg-white p-3 rounded">
                                        <p className="font-mono">ruc_cliente, codigo_producto, lote, cantidad_total, fecha_vencimiento, cantidad_bultos, cantidad_cajas, cantidad_por_caja, cantidad_fraccion, um, fabricante, temperatura</p>
                                    </div>
                                </details>
                            </div>

                            {/* Ejemplo Compacto */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                    <span className="text-xl">✅</span>
                                    Ejemplo CSV Mínimo
                                </h3>
                                <div className="bg-slate-900 p-3 rounded-lg overflow-x-auto">
                                    <pre className="text-xs font-mono text-green-400">
                                        {`ruc_cliente,codigo_producto,lote,cantidad_total
20123456789,PROD001,LOTE-2024-001,505
20123456789,PROD002,LOTE-2024-002,500`}
                                    </pre>
                                </div>
                                <p className="text-xs text-green-800 mt-2">💡 Puedes agregar más columnas opcionales como: fecha_vencimiento, cantidad_cajas, um, fabricante, etc.</p>
                            </div>

                            {/* Errores */}
                            {erroresImportacion.length > 0 && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <h3 className="font-bold text-red-900 mb-2">⚠️ Errores Encontrados</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800 max-h-40 overflow-y-auto">
                                        {erroresImportacion.map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={descargarPlantillaCSV}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
                                >
                                    📥 Descargar Plantilla
                                </Button>
                                <label className="flex-1">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleImportarCSV}
                                        className="hidden"
                                    />
                                    <div className={`w-full px-4 py-3 rounded-lg text-center font-semibold cursor-pointer transition-all duration-300 shadow-lg ${selectedClient
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl transform hover:scale-105'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl transform hover:scale-105'
                                        }`}>
                                        📂 Seleccionar Archivo
                                    </div>
                                </label>
                            </div>
                            {!selectedClient && (
                                <p className="text-sm text-slate-600 text-center">ℹ️ El cliente se seleccionará automáticamente usando la columna ruc_cliente del CSV</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Carga Masiva */}
            {mostrarModalMasivo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setMostrarModalMasivo(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Selección de Productos ({productosSeleccionablesModal.length})
                            </h3>
                            <button
                                onClick={() => setMostrarModalMasivo(false)}
                                className="text-white hover:text-purple-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-3 border-b">
                                <p className="text-sm text-slate-600">
                                    Seleccione un producto y configure su detalle para agregarlo
                                </p>
                                <input
                                    type="text"
                                    value={filtroProductosMasivos}
                                    onChange={(e) => setFiltroProductosMasivos(e.target.value)}
                                    className="input-premium md:w-80"
                                    placeholder="Buscar por código o nombre (mínimo 2 caracteres)"
                                />
                            </div>

                            <div className="overflow-auto max-h-[50vh] border rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Código</th>
                                            <th className="px-4 py-3 text-left">Producto</th>
                                            <th className="px-4 py-3 text-left">Lote</th>
                                            <th className="px-4 py-3 text-left">Vencimiento</th>
                                            <th className="px-4 py-3 text-left">Cantidad</th>
                                            <th className="px-4 py-3 text-left">UM</th>
                                            <th className="px-4 py-3 text-left">Fabricante</th>
                                            <th className="px-4 py-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosSeleccionablesModal.map((producto) => (
                                            <tr
                                                key={producto.id}
                                                className="border-b hover:bg-purple-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs">{producto.codigo}</td>
                                                <td className="px-4 py-3">{producto.descripcion}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{producto.lote || '-'}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    {producto.fecha_vencimiento ? new Date(producto.fecha_vencimiento).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">{producto.cantidad_total || 0}</td>
                                                <td className="px-4 py-3">{producto.um || producto.unidad || '-'}</td>
                                                <td className="px-4 py-3 text-xs">{producto.fabricante || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            if (modoSeleccionProducto === 'individual') {
                                                                seleccionarProductoDesdeModal(producto);
                                                                return;
                                                            }
                                                            abrirModalDetalleProducto(producto);
                                                        }}
                                                        variant="primary"
                                                        className="bg-purple-600 hover:bg-purple-700 text-xs"
                                                    >
                                                        {modoSeleccionProducto === 'individual' ? 'Seleccionar' : 'Configurar'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!buscandoProductos && filtroProductosMasivos.trim().length < 2 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                    Escriba al menos 2 caracteres para buscar productos.
                                                </td>
                                            </tr>
                                        )}
                                        {buscandoProductos && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                    Buscando productos...
                                                </td>
                                            </tr>
                                        )}
                                        {!buscandoProductos && filtroProductosMasivos.trim().length >= 2 && productosSeleccionablesModal.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                    No se encontraron productos para la búsqueda ingresada.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end items-center mt-6 pt-4 border-t">
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => setMostrarModalMasivo(false)}
                                        variant="secondary"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Configuración de Detalle por Producto */}
            {mostrarModalDetalleProducto && productoDetalleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setMostrarModalDetalleProducto(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-purple-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
                            <h3 className="text-lg font-bold text-white">
                                Configurar detalle: {productoDetalleModal.codigo} - {productoDetalleModal.descripcion}
                            </h3>
                            <button
                                onClick={() => setMostrarModalDetalleProducto(false)}
                                className="text-white hover:text-purple-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-premium">Lote</label>
                                <input
                                    type="text"
                                    value={detalleProductoDraft.lote_numero}
                                    onChange={(e) => handleDetalleDraftChange('lote_numero', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Vencimiento</label>
                                <input
                                    type="date"
                                    value={detalleProductoDraft.fecha_vencimiento}
                                    onChange={(e) => handleDetalleDraftChange('fecha_vencimiento', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Cant. Bulto</label>
                                <input
                                    type="number"
                                    value={detalleProductoDraft.cantidad_bultos}
                                    onChange={(e) => handleDetalleDraftChange('cantidad_bultos', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Cajas</label>
                                <input
                                    type="number"
                                    value={detalleProductoDraft.cantidad_cajas}
                                    onChange={(e) => handleDetalleDraftChange('cantidad_cajas', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Und/Caja</label>
                                <input
                                    type="number"
                                    value={detalleProductoDraft.cantidad_por_caja}
                                    onChange={(e) => handleDetalleDraftChange('cantidad_por_caja', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Cant. Fracción</label>
                                <input
                                    type="number"
                                    value={detalleProductoDraft.cantidad_fraccion}
                                    onChange={(e) => handleDetalleDraftChange('cantidad_fraccion', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">UM</label>
                                <input
                                    type="text"
                                    value={detalleProductoDraft.um}
                                    onChange={(e) => handleDetalleDraftChange('um', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Fabricante</label>
                                <input
                                    type="text"
                                    value={detalleProductoDraft.fabricante}
                                    onChange={(e) => handleDetalleDraftChange('fabricante', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Temperatura (°C)</label>
                                <input
                                    type="number"
                                    value={detalleProductoDraft.temperatura}
                                    onChange={(e) => handleDetalleDraftChange('temperatura', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Total Unidades</label>
                                <input
                                    type="number"
                                    value={detalleProductoDraft.cantidad_total}
                                    onChange={(e) => handleDetalleDraftChange('cantidad_total', e.target.value)}
                                    className="input-premium font-bold"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setMostrarModalDetalleProducto(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleGuardarDetalleProductoModal}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Guardar y agregar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Resolución de Código Ambiguo en CSV */}
            {mostrarModalResolucionCSV && pendientesResolucionCSV.length > 0 && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={() => {}}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden">
                        <div className="bg-amber-600 px-6 py-4 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Resolver producto por código (CSV)</h3>
                                <p className="text-sm text-amber-100">
                                    Fila {pendientesResolucionCSV[indicePendienteCSV]?.rowNumber} de {pendientesResolucionCSV.length} con múltiples coincidencias
                                </p>
                            </div>
                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                                {indicePendienteCSV + 1}/{pendientesResolucionCSV.length}
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                                Código en CSV: <span className="font-mono font-bold">{pendientesResolucionCSV[indicePendienteCSV]?.row?.codigo_producto || '-'}</span>
                                {' '}| Lote CSV: <span className="font-mono font-bold">{pendientesResolucionCSV[indicePendienteCSV]?.row?.lote || '-'}</span>
                                {' '}| Cantidad: <span className="font-bold">{pendientesResolucionCSV[indicePendienteCSV]?.row?.cantidad_total || '-'}</span>
                            </div>

                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Código</th>
                                            <th className="px-4 py-3 text-left">Producto</th>
                                            <th className="px-4 py-3 text-left">Lote</th>
                                            <th className="px-4 py-3 text-left">UM</th>
                                            <th className="px-4 py-3 text-left">Fabricante</th>
                                            <th className="px-4 py-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(pendientesResolucionCSV[indicePendienteCSV]?.opciones || []).map((opcion) => (
                                            <tr key={`${opcion.id}-${opcion.lote || ''}`} className="border-t hover:bg-amber-50/40">
                                                <td className="px-4 py-3 font-mono text-xs">{opcion.codigo}</td>
                                                <td className="px-4 py-3">{opcion.descripcion}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{opcion.lote || '-'}</td>
                                                <td className="px-4 py-3">{opcion.um || opcion.unidad || '-'}</td>
                                                <td className="px-4 py-3">{opcion.fabricante || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        onClick={() => resolverPendienteCSV(opcion)}
                                                        className="bg-amber-600 hover:bg-amber-700"
                                                    >
                                                        Elegir este
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="primary" onClick={resolverTodosConPrimeraOpcionCSV} className="bg-emerald-600 hover:bg-emerald-700">
                                    Primera opción para todos
                                </Button>
                                <Button type="button" variant="secondary" onClick={omitirPendienteCSV}>
                                    Omitir fila
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
