import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { API_ORIGIN } from '../../services/api';
import * as XLSX from 'xlsx';
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

const buildNuevoProductoState = (defaults = {}) => ({
    codigo: defaults.codigo || '',
    descripcion: defaults.descripcion || '',
    fecha_ingreso: defaults.fecha_ingreso || new Date().toISOString().split('T')[0],
    lote: defaults.lote || '',
    fecha_vencimiento: defaults.fecha_vencimiento || '',
    tipo_documento: defaults.tipo_documento || '',
    numero_documento: defaults.numero_documento || '',
    categoria_ingreso: defaults.categoria_ingreso || '',
    fabricante: defaults.fabricante || '',
    procedencia: defaults.procedencia || '',
    unidad: defaults.unidad || 'UND',
    um: defaults.um || 'UND',
    temperatura_min: defaults.temperatura_min || '15',
    temperatura_max: defaults.temperatura_max || '25',
    observaciones: defaults.observaciones || '',
    cantidad_bultos: defaults.cantidad_bultos || 1,
    cantidad_cajas: defaults.cantidad_cajas || 1,
    cantidad_por_caja: defaults.cantidad_por_caja || 1,
    cantidad_fraccion: defaults.cantidad_fraccion || 0,
    cantidad_total: defaults.cantidad_total || 1,
    quantityManual: defaults.quantityManual || false
});

const getProductoNombreVisible = (producto) => (
    (() => {
        const descripcion = String(producto?.descripcion || producto?.nombre || producto?.producto_nombre || '').trim();
        const codigo = String(producto?.codigo || producto?.producto_codigo || '').trim();
        if (descripcion && codigo && descripcion.toUpperCase() === codigo.toUpperCase()) {
            return '';
        }
        return descripcion || '';
    })()
);

const getProductoCodigoVisible = (producto) => (
    producto?.codigo
    || producto?.producto_codigo
    || '-'
);

const PLANTILLA_INGRESO_HEADERS = [
    'ruc_cliente',
    'codigo_producto',
    'nombre',
    'lote',
    'fecha_vencimiento',
    'fecha de ingreso',
    'cantidad_bultos',
    'cantidad_cajas',
    'cantidad_por_caja',
    'cantidad_fraccion',
    'cantidad_total',
    'um',
    'fabricante',
    'temperatura'
];

const PLANTILLA_INGRESO_EJEMPLOS = [
    ['20123456789', 'MED-003', 'PARACETAMOL 500MG', 'LOTE-2024-001', '2025-12-31', '2026-03-30', '2', '10', '50', '5', '505', 'UND', 'Laboratorio ABC', '25'],
    ['20123456789', 'MED-007', 'AMOXICILINA 500MG', 'LOTE-2024-002', '2026-06-15', '2026-03-30', '1', '5', '100', '0', '500', 'UND', 'Farmacia XYZ', '25'],
    ['20123456789', 'INS-004', 'GUANTES LATEX TALLA M', 'LOTE-2024-003', '2027-03-20', '2026-03-30', '3', '8', '25', '10', '210', 'UND', 'Insumos Med', '25']
];

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
    const [cajas, setCajas] = useState(1);
    const [unidadesCaja, setUnidadesCaja] = useState(1);
    const [fraccion, setFraccion] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [quantityManual, setQuantityManual] = useState(false);

    const [bultos, setBultos] = useState(1);
    const [um, setUm] = useState('UND');
    const [fabricante, setFabricante] = useState('');
    const [temperaturaMin, setTemperaturaMin] = useState('15');
    const [temperaturaMax, setTemperaturaMax] = useState('25');

    const [lote, setLote] = useState('');
    const [vencimiento, setVencimiento] = useState('');

    // Estados para importación CSV
    const [mostrarModalImportacion, setMostrarModalImportacion] = useState(false);
    const [erroresImportacion, setErroresImportacion] = useState([]);
    const [pendientesResolucionCSV, setPendientesResolucionCSV] = useState([]);
    const [indicePendienteCSV, setIndicePendienteCSV] = useState(0);
    const [mostrarModalResolucionCSV, setMostrarModalResolucionCSV] = useState(false);
    const [importSummaryState, setImportSummaryState] = useState(null);

    // Estados para selector masivo de productos
    const [filtroProductosMasivos, setFiltroProductosMasivos] = useState('');
    const [productosBusquedaModal, setProductosBusquedaModal] = useState([]);
    const [buscandoProductos, setBuscandoProductos] = useState(false);
    const [lotesPorProductoModal, setLotesPorProductoModal] = useState({});
    const [productoDetalleModal, setProductoDetalleModal] = useState(null);
    const [mostrarModalDetalleProducto, setMostrarModalDetalleProducto] = useState(false);
    const [detalleProductoDraft, setDetalleProductoDraft] = useState({
        lote_numero: '',
        fecha_vencimiento: '',
        um: 'UND',
        fabricante: '',
        temperatura_min: '15',
        temperatura_max: '25',
        cantidad_bultos: 1,
        cantidad_cajas: 1,
        cantidad_por_caja: 1,
        cantidad_fraccion: 0,
        cantidad_total: 1
    });
    const [mostrarModalMasivo, setMostrarModalMasivo] = useState(false);
    const [mostrarModalEditarCliente, setMostrarModalEditarCliente] = useState(false);
    const [guardandoCliente, setGuardandoCliente] = useState(false);
    const [clienteDraft, setClienteDraft] = useState({
        id: null,
        codigo: '',
        razon_social: '',
        cuit: '',
        persona_contacto: '',
        telefono: '',
        email: '',
        direccion: '',
        distrito: '',
        provincia: '',
        departamento: '',
        categoria_riesgo: 'Bajo',
        estado: 'Activo'
    });
    const [mostrarModalNuevoProducto, setMostrarModalNuevoProducto] = useState(false);
    const [guardandoNuevoProducto, setGuardandoNuevoProducto] = useState(false);
    const [nuevoProductoForm, setNuevoProductoForm] = useState(buildNuevoProductoState());
    const [uiError, setUiError] = useState('');
    const [uiSuccess, setUiSuccess] = useState('');
    const [resumenImportacionProductos, setResumenImportacionProductos] = useState(null);
    const selectedClientRuc = normalizarRuc(clienteRuc);

    const normalizarHeaderCSV = (header) => String(header || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.\-]+/g, ' ')
        .replace(/\s+/g, '_');

    const HEADER_ALIAS_CSV = {
        ruc: 'ruc_cliente',
        ruc_proveedor: 'ruc_cliente',
        cod_producto: 'codigo_producto',
        codigo: 'codigo_producto',
        producto_codigo: 'codigo_producto',
        nombre_producto: 'nombre',
        producto: 'nombre',
        descripcion: 'nombre',
        fecha_vcto: 'fecha_vencimiento',
        fecha_venc: 'fecha_vencimiento',
        fecha_de_ingreso: 'fecha_ingreso',
        fecha_ingreso: 'fecha_ingreso',
        fecha_de_h_ingreso: 'fecha_ingreso',
        cant_bultos: 'cantidad_bultos',
        cant_bulto: 'cantidad_bultos',
        cant_cajas: 'cantidad_cajas',
        cant_x_caja: 'cantidad_por_caja',
        cant_por_caja: 'cantidad_por_caja',
        cant_fraccion: 'cantidad_fraccion',
        cant_total: 'cantidad_total',
        cant_total_ingreso: 'cantidad_total',
        cant_total__ingreso: 'cantidad_total',
        unidad_medida: 'um'
    };

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
            setLotesPorProductoModal({});
            return;
        }

        const cargarListadoModal = async () => {
            try {
                setBuscandoProductos(true);
                const filtros = {
                    page: 1,
                    limit: 1000,
                    orderBy: 'descripcion',
                    order: 'ASC'
                };

                if (!showAllProducts && selectedClient) {
                    if (selectedClientRuc) {
                        filtros.cliente_ruc = selectedClientRuc;
                    } else {
                        filtros.cliente_id = Number(selectedClient);
                    }
                }

                const response = await productService.getProducts(filtros);
                const productos = Array.isArray(response) ? response : [];
                setProductosBusquedaModal(productos);

                const filtrosLotes = {
                    page: 1,
                    limit: 2000
                };

                if (!showAllProducts && selectedClient) {
                    if (selectedClientRuc) {
                        filtrosLotes.cliente_ruc = selectedClientRuc;
                    } else {
                        filtrosLotes.cliente_id = Number(selectedClient);
                    }
                }

                const lotes = await productService.getLotes(filtrosLotes);
                const lotesArray = Array.isArray(lotes) ? lotes : [];

                const porProducto = lotesArray.reduce((acc, loteItem) => {
                    const productoId = Number(loteItem?.producto_id);
                    if (!Number.isFinite(productoId)) {
                        return acc;
                    }

                    if (!acc[productoId]) {
                        acc[productoId] = [];
                    }

                    acc[productoId].push(loteItem);
                    return acc;
                }, {});

                const loteRepresentativo = Object.entries(porProducto).reduce((acc, [productoId, lista]) => {
                    const ordenados = [...lista].sort((a, b) => {
                        const aDisp = Number(a?.cantidad_disponible || 0) > 0 ? 1 : 0;
                        const bDisp = Number(b?.cantidad_disponible || 0) > 0 ? 1 : 0;
                        if (aDisp !== bDisp) {
                            return bDisp - aDisp;
                        }

                        const aFecha = new Date(a?.fecha_vencimiento || '2999-12-31').getTime();
                        const bFecha = new Date(b?.fecha_vencimiento || '2999-12-31').getTime();
                        return aFecha - bFecha;
                    });

                    acc[Number(productoId)] = ordenados[0];
                    return acc;
                }, {});

                setLotesPorProductoModal(loteRepresentativo);
            } catch (error) {
                console.error('Error cargando productos para selector:', error);
                setProductosBusquedaModal([]);
                setLotesPorProductoModal({});
                showError('No se pudo cargar el listado de productos. Intente nuevamente.');
            } finally {
                setBuscandoProductos(false);
            }
        };

        cargarListadoModal();
    }, [mostrarModalMasivo, showAllProducts, selectedClient, selectedClientRuc]);

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
        setUm(product?.um || product?.unidad || 'UND');
        setFabricante(product?.fabricante || '');
        setTemperaturaMin(String(product?.temperatura_min_c ?? product?.temperatura ?? 15));
        setTemperaturaMax(String(product?.temperatura_max_c ?? product?.temperatura ?? 25));
        setLote(product?.lote || '');
        setVencimiento(normalizarFechaInput(product?.fecha_vencimiento || product?.proximo_vencimiento));
        setBultos(product?.cantidad_bultos ?? 1);
        setCajas(product?.cantidad_cajas ?? 1);
        setUnidadesCaja(product?.cantidad_por_caja ?? 1);
        setFraccion(product?.cantidad_fraccion ?? 0);
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
                            fecha_vencimiento: product.fecha_vencimiento || product.proximo_vencimiento || null,
                            cantidad_ingresada: product.cantidad_total ?? null,
                            cantidad_disponible: product.stock_actual ?? null
                        });
                    }
                }

                const loteCoincidente = normalized.find((l) => String(l.numero_lote || '').trim() === String(product?.lote || '').trim())
                    || (normalized.length === 1 ? normalized[0] : null);

                if (loteCoincidente) {
                    setSelectedLoteId(String(loteCoincidente.id));
                    setLote(loteCoincidente.numero_lote || '');
                    setVencimiento(normalizarFechaInput(loteCoincidente.fecha_vencimiento || product?.fecha_vencimiento || product?.proximo_vencimiento));
                    setFabricante(product?.fabricante || loteCoincidente.producto?.fabricante || '');
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

    const abrirModalNuevoProducto = () => {
        if (!selectedClient) {
            showError('Seleccione primero el cliente para registrar un producto nuevo.');
            return;
        }

        const tipoDocumentoActual = getValues('tipo_documento') || '';
        const numeroDocumentoActual = getValues('numero_documento') || '';
        setNuevoProductoForm(buildNuevoProductoState({
            lote,
            fecha_vencimiento: vencimiento,
            fabricante,
            um: um || 'UND',
            temperatura_min: String(temperaturaMin || '15'),
            temperatura_max: String(temperaturaMax || '25'),
            tipo_documento: tipoDocumentoActual,
            numero_documento: numeroDocumentoActual
        }));
        setMostrarModalNuevoProducto(true);
    };

    const abrirModalEditarCliente = () => {
        if (!selectedClient) {
            showError('Seleccione un cliente para editar.');
            return;
        }

        const cliente = clients.find((c) => String(c.id) === String(selectedClient));
        if (!cliente) {
            showError('No se encontró el cliente seleccionado.');
            return;
        }

        setClienteDraft({
            id: cliente.id,
            codigo: cliente.codigo || '',
            razon_social: cliente.razon_social || '',
            cuit: cliente.cuit || '',
            persona_contacto: cliente.persona_contacto || '',
            telefono: cliente.telefono || '',
            email: cliente.email || '',
            direccion: cliente.direccion || '',
            distrito: cliente.distrito || '',
            provincia: cliente.provincia || '',
            departamento: cliente.departamento || '',
            categoria_riesgo: cliente.categoria_riesgo || 'Bajo',
            estado: cliente.estado || 'Activo'
        });
        setMostrarModalEditarCliente(true);
    };

    const handleClienteDraftChange = (field, value) => {
        setClienteDraft((prev) => ({ ...prev, [field]: value }));
    };

    const guardarEdicionCliente = async () => {
        if (!clienteDraft.id) {
            showError('No se pudo identificar el cliente a editar.');
            return;
        }

        if (!String(clienteDraft.codigo || '').trim() || !String(clienteDraft.razon_social || '').trim() || !String(clienteDraft.cuit || '').trim()) {
            showError('Código, razón social y RUC son obligatorios para editar el cliente.');
            return;
        }

        try {
            setGuardandoCliente(true);
            await clientesService.actualizar(clienteDraft.id, {
                codigo: String(clienteDraft.codigo || '').trim(),
                razon_social: String(clienteDraft.razon_social || '').trim(),
                cuit: String(clienteDraft.cuit || '').trim(),
                persona_contacto: String(clienteDraft.persona_contacto || '').trim() || null,
                direccion: String(clienteDraft.direccion || '').trim() || null,
                distrito: String(clienteDraft.distrito || '').trim() || null,
                provincia: String(clienteDraft.provincia || '').trim() || null,
                departamento: String(clienteDraft.departamento || '').trim() || null,
                categoria_riesgo: clienteDraft.categoria_riesgo || 'Bajo',
                estado: clienteDraft.estado || 'Activo',
                telefono: String(clienteDraft.telefono || '').trim() || null,
                email: String(clienteDraft.email || '').trim() || null
            });

            await loadData();
            setMostrarModalEditarCliente(false);
            showSuccess('Cliente actualizado correctamente.');
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            const mensaje = error?.response?.data?.error || error?.response?.data?.message || 'No se pudo actualizar el cliente.';
            showError(mensaje);
        } finally {
            setGuardandoCliente(false);
        }
    };

    const cerrarModalNuevoProducto = () => {
        setMostrarModalNuevoProducto(false);
        setGuardandoNuevoProducto(false);
    };

    const handleNuevoProductoChange = (field, value) => {
        setNuevoProductoForm((prev) => {
            const updated = { ...prev, [field]: value };
            
            if (['cantidad_bultos', 'cantidad_cajas', 'cantidad_por_caja', 'cantidad_fraccion'].includes(field)) {
                if (!updated.quantityManual) {
                    const c = parseInt(updated.cantidad_cajas) || 0;
                    const u = parseInt(updated.cantidad_por_caja) || 0;
                    const f = parseInt(updated.cantidad_fraccion) || 0;
                    updated.cantidad_total = (c * u) + f;
                }
            }
            if (field === 'cantidad_total') {
                updated.quantityManual = true;
            }
            
            return updated;
        });
    };

    const guardarNuevoProducto = async () => {
        const codigo = String(nuevoProductoForm.codigo || '').trim();
        const descripcion = String(nuevoProductoForm.descripcion || '').trim();

        if (!codigo || !descripcion) {
            showError('Código y descripción son obligatorios para crear el producto.');
            return;
        }

        const tempMin = Number(nuevoProductoForm.temperatura_min ?? 15);
        const tempMax = Number(nuevoProductoForm.temperatura_max ?? 25);
        if (!Number.isFinite(tempMin) || !Number.isFinite(tempMax)) {
            showError('Las temperaturas deben ser valores numéricos válidos.');
            return;
        }

        try {
            setGuardandoNuevoProducto(true);
            const payload = {
                codigo,
                descripcion,
                cliente_id: Number(selectedClient),
                cliente_ruc: clienteRuc || null,
                proveedor: proveedorNombre || null,
                proveedor_ruc: clienteRuc || null,
                fecha_ingreso: nuevoProductoForm.fecha_ingreso || null,
                lote: String(nuevoProductoForm.lote || '').trim() || null,
                tipo_documento: nuevoProductoForm.tipo_documento || null,
                numero_documento: nuevoProductoForm.numero_documento || null,
                categoria_ingreso: nuevoProductoForm.categoria_ingreso || null,
                fabricante: String(nuevoProductoForm.fabricante || '').trim() || null,
                procedencia: String(nuevoProductoForm.procedencia || '').trim() || null,
                unidad: nuevoProductoForm.unidad || 'UND',
                um: nuevoProductoForm.um || 'UND',
                temperatura: tempMin,
                temperatura_min: tempMin,
                temperatura_max: tempMax,
                observaciones: String(nuevoProductoForm.observaciones || '').trim() || null
            };

            const creado = await productService.createProduct(payload);
            await loadProducts();

            const nuevoId = creado?.id || creado?.data?.id; // In case of standard API {success, data} response
            if (nuevoId) {
                setSelectedProduct(String(nuevoId));
            }

            const cantidadTotal = Number(nuevoProductoForm.cantidad_total || 0);
            if (cantidadTotal > 0 && nuevoId) {
                append({
                    producto_id: Number(nuevoId),
                    producto_codigo: payload.codigo,
                    producto_nombre: payload.descripcion,
                    cantidad: Number(cantidadTotal),
                    lote_numero: String(payload.lote || '').trim(),
                    fecha_vencimiento: normalizarFechaInput(nuevoProductoForm.fecha_vencimiento) || null,
                    um: payload.um || '',
                    fabricante: payload.fabricante || '',
                    temperatura_min: tempMin,
                    temperatura_max: tempMax,
                    cantidad_bultos: Number(nuevoProductoForm.cantidad_bultos || 0),
                    cantidad_cajas: Number(nuevoProductoForm.cantidad_cajas || 0),
                    cantidad_por_caja: Number(nuevoProductoForm.cantidad_por_caja || 0),
                    cantidad_fraccion: Number(nuevoProductoForm.cantidad_fraccion || 0),
                    cantidad_total: Number(cantidadTotal),
                    detalle_calculo: buildDetalleCalculo({
                        cantidad_bultos: nuevoProductoForm.cantidad_bultos,
                        cantidad_cajas: nuevoProductoForm.cantidad_cajas,
                        cantidad_por_caja: nuevoProductoForm.cantidad_por_caja,
                        cantidad_fraccion: nuevoProductoForm.cantidad_fraccion
                    })
                });
                showSuccess('Producto creado y agregado al detalle de la nota.');
            } else {
                showSuccess('Producto creado correctamente.');
            }

            setSelectedLoteId(payload.lote ? 'PRODUCTO_LOTE' : 'OTRO');
            setLote(payload.lote || '');
            setVencimiento(normalizarFechaInput(nuevoProductoForm.fecha_vencimiento) || '');
            setUm(payload.um || 'UND');
            setFabricante(payload.fabricante || '');
            setTemperaturaMin(String(tempMin));
            setTemperaturaMax(String(tempMax));
            setMostrarModalNuevoProducto(false);
        } catch (error) {
            console.error('Error creando producto desde ingreso:', error);
            const mensaje = error?.response?.data?.error || error?.response?.data?.message || 'No se pudo crear el producto.';
            showError(mensaje);
        } finally {
            setGuardandoNuevoProducto(false);
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
                setTemperaturaMin(String(productoDetalle.temperatura_min_c ?? productoDetalle.temperatura ?? 15));
                setTemperaturaMax(String(productoDetalle.temperatura_max_c ?? productoDetalle.temperatura ?? 25));
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
                temperatura_min: Number(temperaturaMin || existing.temperatura_min || 15),
                temperatura_max: Number(temperaturaMax || existing.temperatura_max || 25)
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
                temperatura_min: Number(temperaturaMin || 15),
                temperatura_max: Number(temperaturaMax || 25),
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
        setCajas(1);
        setUnidadesCaja(1);
        setFraccion(0);
        setQuantity(0);
        setQuantityManual(false);
        setBultos(1);
        setUm('UND');
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
        const cantidadBultos = Number(producto.cantidad_bultos);
        const cantidadCajas = Number(producto.cantidad_cajas);
        const cantidadPorCaja = Number(producto.cantidad_por_caja);
        const cantidadFraccion = Number(producto.cantidad_fraccion);
        const bultosIniciales = Number.isFinite(cantidadBultos) && cantidadBultos > 0 ? cantidadBultos : 1;
        const cajasIniciales = Number.isFinite(cantidadCajas) && cantidadCajas > 0 ? cantidadCajas : 1;
        const unidadesPorCajaIniciales = Number.isFinite(cantidadPorCaja) && cantidadPorCaja > 0 ? cantidadPorCaja : 1;
        const fraccionInicial = Number.isFinite(cantidadFraccion) && cantidadFraccion >= 0 ? cantidadFraccion : 0;
        setDetalleProductoDraft({
            lote_numero: producto.lote || '',
            fecha_vencimiento: normalizarFechaInput(producto.fecha_vencimiento),
            um: producto.um || producto.unidad || 'UND',
            fabricante: producto.fabricante || '',
            temperatura_min: String(producto.temperatura_min_c ?? 15),
            temperatura_max: String(producto.temperatura_max_c ?? 25),
            cantidad_bultos: bultosIniciales,
            cantidad_cajas: cajasIniciales,
            cantidad_por_caja: unidadesPorCajaIniciales,
            cantidad_fraccion: fraccionInicial,
            cantidad_total: (cajasIniciales * unidadesPorCajaIniciales) + fraccionInicial
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

    const terminoBusquedaProductos = normalizarTexto(filtroProductosMasivos || '');
    const canonicoPorCodigoModal = (productosBusquedaModal || []).reduce((acc, item) => {
        const codigo = String(item?.codigo || '').trim();
        if (!codigo) return acc;

        const descripcion = String(item?.descripcion || item?.nombre || '').trim();
        const fabricante = String(item?.fabricante || '').trim();
        const umValor = String(item?.um || item?.unidad || '').trim();
        const nombreValido = descripcion && descripcion.toUpperCase() !== codigo.toUpperCase();

        const score = (nombreValido ? 50 : 0) + (fabricante ? 20 : 0) + (umValor ? 10 : 0) + (descripcion.length > codigo.length ? 10 : 0);
        const current = acc[codigo];
        if (!current || score > current._score) {
            acc[codigo] = {
                descripcion,
                fabricante,
                um: umValor,
                _score: score
            };
        }

        return acc;
    }, {});

    const productosSeleccionablesModal = (productosBusquedaModal || []).filter((producto) => {
        if (!terminoBusquedaProductos) {
            return true;
        }

        const codigo = normalizarTexto(producto?.codigo || '');
        const nombre = normalizarTexto(producto?.descripcion || producto?.nombre || '');
        return codigo.includes(terminoBusquedaProductos) || nombre.includes(terminoBusquedaProductos);
    }).map((producto) => {
        const loteRef = lotesPorProductoModal[Number(producto?.id)] || null;
        const loteVisible = String(producto?.lote || loteRef?.numero_lote || '').trim();
        const codigo = String(producto?.codigo || '').trim();
        const canonico = canonicoPorCodigoModal[codigo] || {};
        const nombreVisible = getProductoNombreVisible(producto) || canonico.descripcion || codigo || '-';
        const fabricanteVisible = producto?.fabricante || loteRef?.producto?.fabricante || canonico.fabricante || '';
        const umVisible = producto?.um || producto?.unidad || loteRef?.producto?.um || canonico.um || '';
        return {
            ...producto,
            nombre_visible: nombreVisible,
            codigo_visible: getProductoCodigoVisible(producto),
            lote: loteVisible,
            fecha_vencimiento: loteRef?.fecha_vencimiento || producto?.fecha_vencimiento || null,
            um: umVisible,
            fabricante: fabricanteVisible,
            cantidad_total: producto?.cantidad_total
                ?? loteRef?.cantidad_disponible
                ?? loteRef?.cantidad_ingresada
                ?? 0
        };
    }).filter((producto) => Boolean(String(producto.lote || '').trim()));

    const productoSeleccionado = products.find((p) => String(p.id) === String(selectedProduct));

    const abrirModalBusquedaProductos = () => {
        setFiltroProductosMasivos('');
        setMostrarModalMasivo(true);
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
                cliente_id: selectedClient ? Number(selectedClient) : undefined,
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
        setCajas(1);
        setUnidadesCaja(1);
        setFraccion(0);
        setQuantity(0);
        setQuantityManual(false);
        setBultos(1);
        setUm('UND');
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
        setResumenImportacionProductos(null);
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

    const deduplicarOpcionesCSV = (opciones = []) => {
        const unicosPorId = new Map();
        opciones.forEach((opcion) => {
            const id = Number(opcion?.id);
            if (Number.isFinite(id) && !unicosPorId.has(id)) {
                unicosPorId.set(id, opcion);
            }
        });
        return Array.from(unicosPorId.values());
    };

    const seleccionarOpcionDeterministicaCSV = (opciones = []) => {
        if (!opciones.length) return null;
        // DESCENDENTE (LIFO): Number(b.id) - Number(a.id)
        // Esto garantiza que si hay productos duplicados, se considere el último ingresado (ID mayor).
        return [...opciones].sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0] || null;
    };

    const resolverProductoCSV = ({ row, candidatosCodigo = [], candidatosPorLote = [] }) => {
        const base = candidatosPorLote.length > 0 ? candidatosPorLote : candidatosCodigo;
        const opcionesUnicas = deduplicarOpcionesCSV(base);

        if (opcionesUnicas.length === 0) {
            return { producto: null, opciones: [] };
        }

        if (opcionesUnicas.length === 1) {
            return { producto: opcionesUnicas[0], opciones: opcionesUnicas };
        }

        const nombreCsv = normalizarTexto(row?.nombre || row?.producto_nombre || '');
        if (nombreCsv) {
            const porNombre = opcionesUnicas.filter((p) => {
                const nombreProducto = normalizarTexto(p?.descripcion || p?.nombre || '');
                return nombreProducto === nombreCsv
                    || nombreProducto.includes(nombreCsv)
                    || nombreCsv.includes(nombreProducto);
            });

            if (porNombre.length === 1) {
                return { producto: porNombre[0], opciones: porNombre };
            }

            if (porNombre.length > 1) {
                const elegida = seleccionarOpcionDeterministicaCSV(porNombre);
                return { producto: elegida, opciones: porNombre };
            }
        }

        // Si todas las opciones son equivalentes a nivel funcional (mismo código/lote/fabricante), tomar una automáticamente.
        const firmaSet = new Set(opcionesUnicas.map((p) => [
            normalizarCodigoProducto(p?.codigo || ''),
            normalizarTexto(obtenerLoteProducto(p) || ''),
            normalizarTexto(p?.fabricante || ''),
            normalizarTexto(p?.um || p?.unidad || '')
        ].join('|')));

        if (firmaSet.size === 1) {
            const elegida = seleccionarOpcionDeterministicaCSV(opcionesUnicas);
            return { producto: elegida, opciones: opcionesUnicas };
        }

        return { producto: null, opciones: opcionesUnicas };
    };

    const parseTemperaturaCSV = (value, fallback = 25) => {
        const raw = String(value || '').trim();
        if (!raw) return fallback;

        const rango = raw
            .replace(/,/g, '.')
            .match(/(-?\d+(?:\.\d+)?)\s*(?:°|º)?\s*(?:a|hasta|\-|:)\s*(-?\d+(?:\.\d+)?)\s*(?:°|º)?/i);

        if (rango) {
            const min = Number(rango[1]);
            return Number.isFinite(min) ? min : fallback;
        }

        const unico = raw.replace(/,/g, '.').match(/-?\d+(?:\.\d+)?/);
        if (!unico) return fallback;

        const parsed = Number(unico[0]);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const construirDetalleDesdeCSV = (producto, row) => {
        const temperatura = parseTemperaturaCSV(
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
        setResumenImportacionProductos(null);
        const isExcel = file.name.match(/\.(xlsx|xls)$/i);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                let rows = [];
                let delimiter = ',';

                if (isExcel) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    rows = jsonRows.filter(row => row.some(cell => String(cell || '').trim() !== ''));
                } else {
                    const text = String(e.target.result || '').replace(/^\uFEFF/, '');
                    const parsed = parseCSVDocument(text);
                    delimiter = parsed.delimiter;
                    rows = parsed.rows;
                }

                if (rows.length < 2) {
                    showError('El archivo está vacío o no tiene datos.');
                    return;
                }

                // Parsear y normalizar encabezados
                const headers = rows[0]
                    .map((h) => normalizarHeaderCSV(h))
                    .map((h) => HEADER_ALIAS_CSV[h] || h);
                const errores = [];
                const productosImportados = [];
                const pendientes = [];
                const codigosCreados = new Set();
                const codigosExistentes = new Set();
                const cacheProductosResueltos = new Map();

                // Validar encabezados requeridos
                const requeridos = ['ruc_cliente', 'codigo_producto', 'lote', 'fecha_ingreso', 'cantidad_total'];
                const faltantes = requeridos.filter(r => !headers.includes(r));

                if (faltantes.length > 0) {
                    showError(`Faltan columnas requeridas: ${faltantes.join(', ')}`);
                    setErroresImportacion([`Columnas faltantes: ${faltantes.join(', ')}`]);
                    return;
                }

                let rucDetectado = '';
                let fechaIngresoDetectada = '';
                const fechasIngresoDistintas = new Set();

                // Procesar cada fila
                for (let i = 1; i < rows.length; i++) {
                    let values = Array.isArray(rows[i]) ? [...rows[i]] : [];

                    // Algunas exportaciones mezclan delimitador por fila.
                    const posiblesDelimitadores = ['\t', ';', ','].filter((d) => d !== delimiter);
                    const rawLine = values.join(delimiter);
                    if (values.length <= 1 || values.length < headers.length) {
                        for (const altDelimiter of posiblesDelimitadores) {
                            if (!rawLine.includes(altDelimiter)) {
                                continue;
                            }
                            const altValues = parseCSVLine(rawLine, altDelimiter);
                            if (altValues.length > values.length) {
                                values = altValues;
                            }
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

                    const fechaIngresoFila = normalizarFechaInput(row.fecha_ingreso || '');
                    if (row.fecha_ingreso && !fechaIngresoFila) {
                        errores.push(`Fila ${i + 1}: fecha de ingreso inválida (${row.fecha_ingreso})`);
                        continue;
                    }

                    if (fechaIngresoFila) {
                        fechasIngresoDistintas.add(fechaIngresoFila);
                        if (!fechaIngresoDetectada) {
                            fechaIngresoDetectada = fechaIngresoFila;
                        }
                    }

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

                        if (!Number.isFinite(cantidadTotal) || cantidadTotal <= 0) {
                            errores.push(`Fila ${i + 1}: Cantidad total inválida`);
                            continue;
                        }

                        const codigoBuscado = normalizarCodigoProducto(row.codigo_producto);
                        const loteBuscado = normalizarTexto(row.lote);
                        let candidatosCodigo = deduplicarOpcionesCSV(products.filter(
                            (p) => coincideCodigoProducto(p, codigoBuscado)
                        ));

                        if (candidatosCodigo.length === 0) {
                            if (!cacheProductosResueltos.has(codigoBuscado)) {
                                try {
                                    const clienteFila = buscarClientePorRuc(rucFila);
                                    const respuestaResolucion = await productService.resolveOrCreateProducts({
                                        cliente_id: clienteFila ? Number(clienteFila.id) : null,
                                        cliente_ruc: rucFila,
                                        proveedor: String(proveedorNombre || clienteFila?.razon_social || '').trim() || null,
                                        proveedor_ruc: rucFila,
                                        productos: [{
                                            codigo: codigoBuscado,
                                            descripcion: row.nombre || row.descripcion || '',
                                            lote: row.lote || '',
                                            fabricante: row.fabricante || '',
                                            um: row.um || '',
                                            temperatura: parseTemperaturaCSV(row.temperatura, 25),
                                            tipo_documento: row.tipo_documento || getValues('tipo_documento') || '',
                                            numero_documento: row.numero_documento || getValues('numero_documento') || ''
                                        }]
                                    });

                                    const resolucion = (respuestaResolucion?.data || []).find(
                                        (item) => normalizarCodigoProducto(item?.codigo) === codigoBuscado
                                    ) || null;

                                    if (resolucion) {
                                        cacheProductosResueltos.set(codigoBuscado, resolucion);
                                        if (String(resolucion.status || '').toLowerCase() === 'created') {
                                            codigosCreados.add(resolucion.codigo);
                                        } else {
                                            codigosExistentes.add(resolucion.codigo);
                                        }
                                    } else {
                                        cacheProductosResueltos.set(codigoBuscado, null);
                                    }
                                } catch (resolveError) {
                                    console.error('Error al resolver/crear producto en importación:', resolveError);
                                    cacheProductosResueltos.set(codigoBuscado, null);
                                }
                            }

                            const productoResuelto = cacheProductosResueltos.get(codigoBuscado);
                            if (productoResuelto) {
                                candidatosCodigo = deduplicarOpcionesCSV([
                                    ...candidatosCodigo,
                                    {
                                        ...productoResuelto,
                                        descripcion: productoResuelto.descripcion || row.nombre || codigoBuscado,
                                        lote: row.lote || productoResuelto.lote || '',
                                        fabricante: row.fabricante || productoResuelto.fabricante || '',
                                        um: row.um || productoResuelto.um || productoResuelto.unidad || 'UND'
                                    }
                                ]);
                            }
                        }

                        if (candidatosCodigo.length === 0) {
                            errores.push(`Fila ${i + 1}: Producto con código "${row.codigo_producto}" no encontrado ni se pudo crear`);
                            continue;
                        }

                        const candidatosPorLote = loteBuscado
                            ? candidatosCodigo.filter((p) => normalizarTexto(obtenerLoteProducto(p)) === loteBuscado)
                            : candidatosCodigo;

                        const { producto: productoSeleccionado, opciones: opcionesResolucion } = resolverProductoCSV({
                            row,
                            candidatosCodigo,
                            candidatosPorLote
                        });

                        if (!productoSeleccionado) {
                            pendientes.push({
                                row,
                                rowNumber: i + 1,
                                opciones: opcionesResolucion.length > 0 ? opcionesResolucion : candidatosCodigo
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
                if (fechaIngresoDetectada) {
                    setValue('fecha', fechaIngresoDetectada);
                }

                if (fechasIngresoDistintas.size > 1) {
                    const listaFechas = Array.from(fechasIngresoDistintas).sort();
                    errores.push(`Se detectaron ${fechasIngresoDistintas.size} fechas de ingreso distintas en el archivo. Se aplicó ${fechaIngresoDetectada} en el formulario actual. Fechas detectadas: ${listaFechas.join(', ')}`);
                }

                const resumenCreado = Array.from(codigosCreados).sort();
                const resumenExistente = Array.from(codigosExistentes).sort();
                if (resumenCreado.length > 0 || resumenExistente.length > 0) {
                    setResumenImportacionProductos({
                        creados: resumenCreado,
                        existentes: resumenExistente
                    });
                    await loadProducts();
                }

                // Mostrar errores iniciales si existieron, pero preparar confirmación
                if (errores.length > 0) {
                    setErroresImportacion(errores);
                }

                if (productosImportados.length > 0 || pendientes.length > 0) {
                    // Retener en estado para confirmación manual antes de ingresarlos
                    setImportSummaryState({
                        productos: productosImportados,
                        pendientes: pendientes,
                        errores: errores,
                        resumenCreado: resumenCreado,
                        resumenExistente: resumenExistente
                    });
                } else if (errores.length > 0) {
                    console.error('Errores de importación:', errores);
                } else {
                    setMostrarModalImportacion(false);
                }
                event.target.value = ''; // Limpiar input file
            } catch (error) {
                console.error('Error al procesar archivo:', error);
                showError('Error al procesar el archivo: ' + error.message);
            }
        };

        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    const handleConfirmarImportacionCSV = () => {
        if (!importSummaryState) return;
        const { productos, pendientes, errores, resumenCreado, resumenExistente } = importSummaryState;

        if (productos.length > 0) {
            productos.forEach((producto) => agregarDetalleImportado(producto));
            if (resumenCreado.length > 0 || resumenExistente.length > 0) {
                showSuccess(`${productos.length} productos importados correctamente. Resolución automática: ${resumenCreado.length} creado(s), ${resumenExistente.length} existente(s).`);
            } else {
                showSuccess(`${productos.length} productos ingresados correctamente al borrador.`);
            }
        }

        if (pendientes.length > 0) {
            setPendientesResolucionCSV(pendientes);
            setIndicePendienteCSV(0);
            setMostrarModalResolucionCSV(true);
            showError(`Hay ${pendientes.length} fila(s) con múltiples opciones. Resuelva y se añadirán automáticamente.`);
        }

        if (pendientes.length === 0) {
            setMostrarModalImportacion(false);
            setImportSummaryState(null);
        } else {
            setImportSummaryState(null);
        }
    };

    const descargarPlantillaExcel = () => {
        const wb = XLSX.utils.book_new();
        const aoa = [PLANTILLA_INGRESO_HEADERS, ...PLANTILLA_INGRESO_EJEMPLOS];
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws['!cols'] = [
            { wch: 14 }, { wch: 18 }, { wch: 42 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
            { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 10 },
            { wch: 28 }, { wch: 14 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'IngresoMasivo');

        const manual = [
            ['INSTRUCCIONES', ''],
            ['1) Complete las filas en la hoja IngresoMasivo.', ''],
            ['2) Use una sola fecha de ingreso por archivo.', ''],
            ['3) ruc_cliente, codigo_producto, lote y cantidad_total son obligatorios.', ''],
            ['4) Formato de fecha recomendado: YYYY-MM-DD.', ''],
            ['5) Puede importar este archivo directamente desde el botón Importar Excel/CSV.', '']
        ];
        const wsManual = XLSX.utils.aoa_to_sheet(manual);
        wsManual['!cols'] = [{ wch: 80 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, wsManual, 'Instrucciones');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'plantilla_ingreso_masivo.xlsx';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

            <Card className="p-6 border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                        <h3 className="text-lg font-bold text-emerald-900">Portada De Carga Masiva De Notas De Ingreso</h3>
                        <p className="text-sm text-emerald-800 mt-1">
                            Descargue la plantilla Excel, complete los campos requeridos y cargue el archivo para importar productos en lote.
                        </p>
                        <p className="text-xs text-emerald-700 mt-2">
                            Campos obligatorios: ruc_cliente, codigo_producto, lote, fecha de ingreso, cantidad_total.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            onClick={descargarPlantillaExcel}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                            Descargar Plantilla Excel
                        </Button>
                    </div>
                </div>
                <div className="mt-4 rounded-lg border border-emerald-200 bg-white/80 p-3 text-xs text-slate-700 overflow-x-auto">
                    <div className="font-semibold text-slate-800 mb-1">Ejemplo de fila:</div>
                    <div className="font-mono whitespace-nowrap">
                        20123456789 | MED-003 | PARACETAMOL 500MG | LOTE-2024-001 | 2025-12-31 | 2026-03-30 | 2 | 10 | 50 | 5 | 505 | UND | Laboratorio ABC | 25
                    </div>
                </div>
            </Card>

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

            {resumenImportacionProductos && (resumenImportacionProductos.creados.length > 0 || resumenImportacionProductos.existentes.length > 0) && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    <div className="font-semibold mb-2">Resumen de productos resueltos en la importación</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <div className="font-medium text-emerald-700 mb-1">Creados ({resumenImportacionProductos.creados.length})</div>
                            <div className="flex flex-wrap gap-1">
                                {resumenImportacionProductos.creados.length > 0
                                    ? resumenImportacionProductos.creados.map((codigo) => (
                                        <span key={`creado-${codigo}`} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono">
                                            {codigo}
                                        </span>
                                    ))
                                    : <span className="text-xs text-slate-500">Sin productos creados</span>}
                            </div>
                        </div>
                        <div>
                            <div className="font-medium text-blue-700 mb-1">Existentes reutilizados ({resumenImportacionProductos.existentes.length})</div>
                            <div className="flex flex-wrap gap-1">
                                {resumenImportacionProductos.existentes.length > 0
                                    ? resumenImportacionProductos.existentes.map((codigo) => (
                                        <span key={`existente-${codigo}`} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-mono">
                                            {codigo}
                                        </span>
                                    ))
                                    : <span className="text-xs text-slate-500">Sin productos existentes reutilizados</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Datos Generales */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Datos de la Nota</h3>
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
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={abrirModalEditarCliente}
                                disabled={!selectedClient}
                                className="mt-2 w-full"
                            >
                                Editar cliente seleccionado
                            </Button>
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
                        <div className="md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Agregue los productos en la sección <span className="font-semibold text-slate-700">Agregar productos</span> (manual, búsqueda o Excel/CSV) para evitar duplicidad de pasos.
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
                                onClick={() => abrirModalBusquedaProductos()}
                                variant="primary"
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Seleccionar productos
                            </Button>
                            <Button
                                type="button"
                                onClick={abrirModalNuevoProducto}
                                variant="secondary"
                            >
                                + Nuevo producto
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setErroresImportacion([]);
                                    setResumenImportacionProductos(null);
                                    setMostrarModalImportacion(true);
                                }}
                                variant="secondary"
                            >
                                Importar Excel/CSV
                            </Button>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                            💡 Busca por código, abre el detalle del producto y agrégalo con sus cantidades, o usa Importar Excel/CSV.
                        </p>
                    </div>

                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        El flujo principal es: <span className="font-semibold">Seleccionar productos</span> o <span className="font-semibold">Importar Excel/CSV</span>.
                    </div>

                    {/* El Modo Avanzado manual ha sido fusionado dentro de Nuevo Producto */}
                </Card>

                {/* Tabla de Items */}
                <div className="table-scroll-top rounded-xl border border-slate-200 bg-white shadow-sm">
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
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                title="Temperatura mínima (°C)"
                                                value={field.temperatura_min ?? 15}
                                                onChange={(e) => handleUpdateDetalle(index, 'temperatura_min', e.target.value)}
                                                className="input-premium h-8 text-xs p-1 w-14"
                                            />
                                            <span className="text-xs text-slate-400">a</span>
                                            <input
                                                type="number"
                                                title="Temperatura máxima (°C)"
                                                value={field.temperatura_max ?? 25}
                                                onChange={(e) => handleUpdateDetalle(index, 'temperatura_max', e.target.value)}
                                                className="input-premium h-8 text-xs p-1 w-14"
                                            />
                                        </div>
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

            {mostrarModalNuevoProducto && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={cerrarModalNuevoProducto}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-700 to-cyan-700 px-6 py-4 text-white flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold">Nuevo producto para esta Nota de Ingreso</h3>
                                <p className="text-sm text-cyan-100">Se crea el producto y queda disponible para agregarlo al detalle.</p>
                            </div>
                            <button type="button" onClick={cerrarModalNuevoProducto} className="text-white hover:text-cyan-100">✕</button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-premium">Código de producto *</label>
                                <input
                                    type="text"
                                    value={nuevoProductoForm.codigo}
                                    onChange={(e) => handleNuevoProductoChange('codigo', e.target.value)}
                                    className="input-premium"
                                    placeholder="Ej: PROD-0001"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Descripción *</label>
                                <input
                                    type="text"
                                    value={nuevoProductoForm.descripcion}
                                    onChange={(e) => handleNuevoProductoChange('descripcion', e.target.value)}
                                    className="input-premium"
                                    placeholder="Nombre del producto"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Fecha de ingreso</label>
                                <input
                                    type="date"
                                    value={nuevoProductoForm.fecha_ingreso}
                                    onChange={(e) => handleNuevoProductoChange('fecha_ingreso', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Lote</label>
                                <input
                                    type="text"
                                    value={nuevoProductoForm.lote}
                                    onChange={(e) => handleNuevoProductoChange('lote', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Fecha de vencimiento (referencial)</label>
                                <input
                                    type="date"
                                    value={nuevoProductoForm.fecha_vencimiento}
                                    onChange={(e) => handleNuevoProductoChange('fecha_vencimiento', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Fabricante</label>
                                <input
                                    type="text"
                                    value={nuevoProductoForm.fabricante}
                                    onChange={(e) => handleNuevoProductoChange('fabricante', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Tipo de documento</label>
                                <select
                                    value={nuevoProductoForm.tipo_documento}
                                    onChange={(e) => handleNuevoProductoChange('tipo_documento', e.target.value)}
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
                                <label className="label-premium">Número de documento</label>
                                <input
                                    type="text"
                                    value={nuevoProductoForm.numero_documento}
                                    onChange={(e) => handleNuevoProductoChange('numero_documento', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Categoría ingreso</label>
                                <select
                                    value={nuevoProductoForm.categoria_ingreso}
                                    onChange={(e) => handleNuevoProductoChange('categoria_ingreso', e.target.value)}
                                    className="input-premium"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="IMPORTACION">IMPORTACION</option>
                                    <option value="COMPRA_LOCAL">COMPRA LOCAL</option>
                                    <option value="TRASLADO">TRASLADO</option>
                                    <option value="DEVOLUCION">DEVOLUCION</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-premium">Procedencia</label>
                                <input
                                    type="text"
                                    value={nuevoProductoForm.procedencia}
                                    onChange={(e) => handleNuevoProductoChange('procedencia', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Unidad</label>
                                <select
                                    value={nuevoProductoForm.unidad}
                                    onChange={(e) => handleNuevoProductoChange('unidad', e.target.value)}
                                    className="input-premium"
                                >
                                    <option value="UND">UND</option>
                                    <option value="OTRO">OTRO</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-premium">UM</label>
                                <select
                                    value={nuevoProductoForm.um}
                                    onChange={(e) => handleNuevoProductoChange('um', e.target.value)}
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
                            <div>
                                <label className="label-premium">Temp. Mínima (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="15"
                                    value={nuevoProductoForm.temperatura_min}
                                    onChange={(e) => handleNuevoProductoChange('temperatura_min', e.target.value)}
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium">Temp. Máxima (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="25"
                                    value={nuevoProductoForm.temperatura_max}
                                    onChange={(e) => handleNuevoProductoChange('temperatura_max', e.target.value)}
                                    className="input-premium"
                                />
                            </div>

                            {/* Section added for quantity calculation inside the Modal */}
                            <div className="md:col-span-2 grid grid-cols-3 gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200 mt-2">
                                <div className="col-span-3 text-sm font-bold text-blue-800 mb-1 border-b border-blue-100 pb-1">
                                    Cantidades para el ingreso
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Bulto</label>
                                    <input
                                        type="number"
                                        value={nuevoProductoForm.cantidad_bultos}
                                        onChange={(e) => handleNuevoProductoChange('cantidad_bultos', e.target.value)}
                                        className="input-premium h-8 text-sm p-1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cajas</label>
                                    <input
                                        type="number"
                                        value={nuevoProductoForm.cantidad_cajas}
                                        onChange={(e) => handleNuevoProductoChange('cantidad_cajas', e.target.value)}
                                        className="input-premium h-8 text-sm p-1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Und/Caja</label>
                                    <input
                                        type="number"
                                        value={nuevoProductoForm.cantidad_por_caja}
                                        onChange={(e) => handleNuevoProductoChange('cantidad_por_caja', e.target.value)}
                                        className="input-premium h-8 text-sm p-1"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Cant. Fracción</label>
                                    <input
                                        type="number"
                                        value={nuevoProductoForm.cantidad_fraccion}
                                        onChange={(e) => handleNuevoProductoChange('cantidad_fraccion', e.target.value)}
                                        className="input-premium h-8 text-sm p-1"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end items-center pt-1 mt-1">
                                    <span className="text-xs text-slate-500 font-medium mr-2">Total Unidades:</span>
                                    <input
                                        type="number"
                                        value={nuevoProductoForm.cantidad_total}
                                        onChange={(e) => handleNuevoProductoChange('cantidad_total', e.target.value)}
                                        className="input-premium h-8 text-sm p-1 w-24 text-right border-blue-300 font-bold text-blue-800"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="label-premium">Observaciones</label>
                                <textarea
                                    value={nuevoProductoForm.observaciones}
                                    onChange={(e) => handleNuevoProductoChange('observaciones', e.target.value)}
                                    className="input-premium min-h-24"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex flex-wrap justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={cerrarModalNuevoProducto}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={guardarNuevoProducto}
                                isLoading={guardandoNuevoProducto}
                                className="btn-gradient-primary"
                            >
                                Guardar producto y continuar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {mostrarModalEditarCliente && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMostrarModalEditarCliente(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 text-white flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-xl font-bold">Editar Cliente</h3>
                            <button type="button" onClick={() => setMostrarModalEditarCliente(false)} className="text-white hover:text-emerald-100">✕</button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-premium">Código *</label>
                                <input type="text" value={clienteDraft.codigo} onChange={(e) => handleClienteDraftChange('codigo', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">RUC *</label>
                                <input type="text" value={clienteDraft.cuit} onChange={(e) => handleClienteDraftChange('cuit', e.target.value)} className="input-premium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-premium">Razón social *</label>
                                <input type="text" value={clienteDraft.razon_social} onChange={(e) => handleClienteDraftChange('razon_social', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Contacto</label>
                                <input type="text" value={clienteDraft.persona_contacto} onChange={(e) => handleClienteDraftChange('persona_contacto', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Teléfono</label>
                                <input type="text" value={clienteDraft.telefono} onChange={(e) => handleClienteDraftChange('telefono', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Email</label>
                                <input type="email" value={clienteDraft.email} onChange={(e) => handleClienteDraftChange('email', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Dirección</label>
                                <input type="text" value={clienteDraft.direccion} onChange={(e) => handleClienteDraftChange('direccion', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Distrito</label>
                                <input type="text" value={clienteDraft.distrito} onChange={(e) => handleClienteDraftChange('distrito', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Provincia</label>
                                <input type="text" value={clienteDraft.provincia} onChange={(e) => handleClienteDraftChange('provincia', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Departamento</label>
                                <input type="text" value={clienteDraft.departamento} onChange={(e) => handleClienteDraftChange('departamento', e.target.value)} className="input-premium" />
                            </div>
                            <div>
                                <label className="label-premium">Categoría riesgo</label>
                                <select value={clienteDraft.categoria_riesgo} onChange={(e) => handleClienteDraftChange('categoria_riesgo', e.target.value)} className="input-premium">
                                    <option value="Bajo">Bajo</option>
                                    <option value="Alto">Alto</option>
                                    <option value="No verificado">No verificado</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-premium">Estado</label>
                                <select value={clienteDraft.estado} onChange={(e) => handleClienteDraftChange('estado', e.target.value)} className="input-premium">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="Potencial">Potencial</option>
                                    <option value="Bloqueado">Bloqueado</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex flex-wrap justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => setMostrarModalEditarCliente(false)}>
                                Cancelar
                            </Button>
                            <Button type="button" onClick={guardarEdicionCliente} isLoading={guardandoCliente} className="btn-gradient-primary">
                                Guardar cambios
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Importación CSV - Simplificado */}
            {mostrarModalImportacion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMostrarModalImportacion(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">📊 Carga masiva por Excel/CSV</h2>
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

                        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)]">
                            {importSummaryState ? (
                                <div className="bg-white py-4 rounded-lg text-center space-y-6">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800">Archivo analizado con éxito</h3>
                                        <p className="text-slate-500">Revise las cantidades antes de confirmar el ingreso al borrador</p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-6 my-6">
                                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col items-center min-w-[160px] shadow-sm transform transition-transform hover:scale-105">
                                            <span className="text-4xl font-black text-blue-600">{importSummaryState.productos.length}</span>
                                            <span className="font-semibold text-blue-800 text-sm mt-1">Líneas de producto</span>
                                        </div>
                                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex flex-col items-center min-w-[160px] shadow-sm transform transition-transform hover:scale-105">
                                            <span className="text-4xl font-black text-emerald-600">
                                                {importSummaryState.productos.reduce((acc, curr) => acc + (Number(curr.cantidad_total) || 0), 0)}
                                            </span>
                                            <span className="font-semibold text-emerald-800 text-sm mt-1">Unidades en total</span>
                                        </div>
                                        {importSummaryState.pendientes?.length > 0 && (
                                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex flex-col items-center min-w-[160px] shadow-sm transform transition-transform hover:scale-105">
                                                <span className="text-4xl font-black text-amber-600">{importSummaryState.pendientes.length}</span>
                                                <span className="font-semibold text-amber-800 text-sm mt-1">Requieren revisión</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="text-sm bg-slate-50 p-4 rounded-xl text-slate-600">
                                        💡 Al confirmar, estos productos se añadirán a la lista de detalles y podrás seguir editándolos si es necesario antes de grabar finalmente la Nota de Ingreso.
                                    </div>

                                    <div className="flex gap-4 justify-center pt-4 border-t">
                                        <Button variant="secondary" onClick={() => setImportSummaryState(null)} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border-0">
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleConfirmarImportacionCSV} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105">
                                            Confirmar e Ingresar Total
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Instrucciones Compactas */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                            <span className="text-xl">📋</span>
                                            Pasos Rápidos
                                        </h3>
                                        <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
                                            <li>Descarga la plantilla Excel</li>
                                            <li>Ábrela con Excel y completa los datos</li>
                                            <li>Guarda y selecciona el archivo (.xlsx, .xls o .csv)</li>
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
                                                <p className="font-mono font-bold text-sm text-slate-800">fecha de ingreso</p>
                                                <p className="text-xs text-slate-600 mt-1">Fecha única para la nota (YYYY-MM-DD o DD/MM/YYYY)</p>
                                                <p className="text-xs text-slate-500 mt-1">Ej: <span className="font-mono bg-slate-100 px-1 rounded">2026-03-30</span></p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                                                <p className="font-mono font-bold text-sm text-slate-800">cantidad_total</p>
                                                <p className="text-xs text-slate-600 mt-1">Cantidad total de unidades</p>
                                                <p className="text-xs text-slate-500 mt-1">Ej: <span className="font-mono bg-slate-100 px-1 rounded">505</span></p>
                                            </div>
                                        </div>
                                        <details className="mt-3">
                                            <summary className="text-xs text-amber-800 cursor-pointer hover:text-amber-900 font-medium">
                                                Ver formato completo compatible
                                            </summary>
                                            <div className="mt-3 text-xs text-slate-600 bg-white p-3 rounded">
                                                <p className="font-mono">ruc_cliente, codigo_producto, nombre, lote, fecha_vencimiento, fecha de ingreso, cantidad_bultos, cantidad_cajas, cantidad_por_caja, cantidad_fraccion, cantidad_total, um, fabricante, temperatura</p>
                                            </div>
                                        </details>
                                    </div>

                                    {/* Ejemplo Compacto */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                                        <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                            <span className="text-xl">✅</span>
                                            Ejemplo de Formato Mínimo
                                        </h3>
                                        <div className="bg-slate-900 p-3 rounded-lg overflow-x-auto">
                                            <pre className="text-xs font-mono text-green-400">
                                                {`ruc_cliente,codigo_producto,nombre,lote,fecha_vencimiento,fecha de ingreso,cantidad_bultos,cantidad_cajas,cantidad_por_caja,cantidad_fraccion,cantidad_total,um,fabricante,temperatura
20123456789,PROD001,PARACETAMOL 500MG,LOTE-2024-001,2025-12-31,2026-03-30,2,10,50,5,505,UND,LAB ABC,25
20123456789,PROD002,AMOXICILINA 500MG,LOTE-2024-002,2026-06-15,2026-03-30,1,5,100,0,500,UND,LAB XYZ,25`}
                                            </pre>
                                        </div>
                                        <p className="text-xs text-green-800 mt-2">💡 También acepta separador por coma, punto y coma o tabulación.</p>
                                    </div>

                                    {/* Errores */}
                                    {erroresImportacion.length > 0 && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
                                            <h3 className="font-bold text-red-900 mb-2">⚠️ Errores Encontrados</h3>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-red-800 max-h-40 overflow-y-auto">
                                                {erroresImportacion.map((error, idx) => (
                                                    <li key={idx}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Botones de acción */}
                                    <div className="flex gap-3 pt-4 mt-6">
                                        <Button
                                            type="button"
                                            onClick={descargarPlantillaExcel}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
                                        >
                                            📥 Descargar Plantilla Excel
                                        </Button>
                                        <label className="flex-1">
                                            <input
                                                type="file"
                                                accept=".csv, .xlsx, .xls"
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
                                        <p className="text-sm text-slate-600 text-center mt-2">ℹ️ El cliente se seleccionará automáticamente usando la columna ruc_cliente del CSV</p>
                                    )}
                                </>
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
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={abrirModalNuevoProducto}
                                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                                >
                                    + Agregar producto
                                </Button>
                                <button
                                    onClick={() => setMostrarModalMasivo(false)}
                                    className="text-white hover:text-purple-200 transition-colors"
                                    title="Cerrar"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-3 border-b">
                                <p className="text-sm text-slate-600">
                                    Busque el producto por código y luego añádalo con su detalle
                                </p>
                                <input
                                    type="text"
                                    value={filtroProductosMasivos}
                                    onChange={(e) => setFiltroProductosMasivos(e.target.value)}
                                    className="input-premium md:w-80"
                                    placeholder="Filtrar por código o nombre"
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
                                                <td className="px-4 py-3 font-mono text-xs">{producto.codigo_visible || producto.codigo}</td>
                                                <td className="px-4 py-3">{producto.nombre_visible || producto.descripcion}</td>
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
                                                        onClick={() => abrirModalDetalleProducto(producto)}
                                                        variant="primary"
                                                        className="bg-purple-600 hover:bg-purple-700 text-xs"
                                                    >
                                                        Añadir
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {!buscandoProductos && productosSeleccionablesModal.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                                    No se encontraron productos para el filtro ingresado.
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
