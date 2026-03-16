import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { operationService } from '../../services/operation.service';
import { productService } from '../../services/product.service';
import { clientesService } from '../../services/clientes.service';
import { API_ORIGIN } from '../../services/api';
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

    const [selectedDetalleIds, setSelectedDetalleIds] = useState({});

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

    const [numeroDocBusqueda, setNumeroDocBusqueda] = useState('');
    const [buscandoDoc, setBuscandoDoc] = useState(false);

    // Estados para modal de edición de cantidades
    const [mostrarModalEdicionCantidades, setMostrarModalEdicionCantidades] = useState(false);
    const [detallesAEditar, setDetallesAEditar] = useState([]);
    const [cantidadesEditadas, setCantidadesEditadas] = useState({});
    const [cargandoNotas, setCargandoNotas] = useState(false);
    const [errorNotas, setErrorNotas] = useState('');

    // Toast
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('success');
    const showToast = (msg, type = 'success') => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(''), 4000);
    };

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
        // Si el backend envía cantidad_disponible (real del lote), usarla directamente
        if (detalle?.cantidad_disponible != null) {
            return Math.max(0, Number(detalle.cantidad_disponible));
        }
        // Fallback: usar cantidad_total o cantidad si no viene del lote
        const fallback = Number(detalle?.cantidad_total || detalle?.cantidad || 0);
        return Math.max(0, fallback);
    };

    const getNotaStockDisponible = (nota) => {
        return (nota?.detalles || []).reduce((acc, detalle) => acc + getDetalleDisponible(detalle), 0);
    };

    const getNotaStockSeleccionado = (notaId) => {
        return fields.reduce((acc, field) => {
            if (Number(field.nota_ingreso_id) === Number(notaId)) {
                return acc + Number(field.cantidad || 0);
            }
            return acc;
        }, 0);
    };

    const formatCantidad = (valor) => Number(valor || 0).toFixed(2);

    const getStockPorProductoLote = () => {
        const mapa = new Map();

        (notasIngreso || []).forEach((nota) => {
            (nota.detalles || []).forEach((detalle) => {
                const productoId = Number(detalle.producto_id || 0);
                const loteNumero = String(detalle.lote_numero || 'SIN_LOTE');
                const key = `${productoId}__${loteNumero}`;
                const disponible = getDetalleDisponible(detalle);

                if (!mapa.has(key)) {
                    mapa.set(key, {
                        key,
                        productoId,
                        codigo: detalle.producto?.codigo || '-',
                        producto: detalle.producto?.descripcion || '-',
                        lote: detalle.lote_numero || '-',
                        um: detalle.um || detalle.producto?.um || detalle.producto?.unidad || '-',
                        disponible: 0,
                        descontar: 0
                    });
                }

                const actual = mapa.get(key);
                actual.disponible += Number(disponible || 0);
            });
        });

        (fields || []).forEach((field) => {
            const productoId = Number(field.producto_id || 0);
            const loteNumero = String(field.lote_numero || 'SIN_LOTE');
            const key = `${productoId}__${loteNumero}`;

            if (!mapa.has(key)) {
                mapa.set(key, {
                    key,
                    productoId,
                    codigo: field.producto_codigo || '-',
                    producto: field.producto_nombre || '-',
                    lote: field.lote_numero || '-',
                    um: field.um || '-',
                    disponible: Number(field.cantidad_disponible || 0),
                    descontar: 0
                });
            }

            const actual = mapa.get(key);
            actual.descontar += Number(field.cantidad || 0);
        });

        return Array.from(mapa.values())
            .map((item) => ({
                ...item,
                saldo: Math.max(Number(item.disponible || 0) - Number(item.descontar || 0), 0)
            }))
            .filter((item) => Number(item.disponible) > 0 || Number(item.descontar) > 0)
            .sort((a, b) => {
                if (a.codigo === b.codigo) return String(a.lote).localeCompare(String(b.lote));
                return String(a.codigo).localeCompare(String(b.codigo));
            });
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
            showToast('Error al cargar lista de Clientes.', 'error');
        }
    };

    const loadProducts = async (clienteId = null) => {
        try {
            const params = clienteId ? { cliente_id: clienteId } : {};
            const productsResponse = await productService.getProducts(params);
            setProducts(Array.isArray(productsResponse) ? productsResponse : []);
        } catch (error) {
            console.error('Error loading products:', error);
            showToast('Error al cargar lista de Productos.', 'error');
        }
    };

    const loadNotasIngreso = async (clienteId) => {
        if (!clienteId) {
            setNotasIngreso([]);
            return;
        }
        setCargandoNotas(true);
        setErrorNotas('');
        try {
            const client = clients.find(c => String(c.id) === String(clienteId));
            if (!client) { setCargandoNotas(false); return; }

            // Buscar las notas de ingreso del cliente por proveedor (razon_social)
            const response = await fetch(`${API_ORIGIN}/api/ingresos?proveedor=${encodeURIComponent(client.razon_social)}`);
            const result = await response.json();
            const notas = result.data || [];

            // Cargar detalles de cada nota
            const notasConDetalles = await Promise.all(
                notas.map(async (nota) => {
                    try {
                        const detRes = await fetch(`${API_ORIGIN}/api/ingresos/${nota.id}`);
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
            
            // Ordenar descendente por fecha (últimas primero)
            const notasOrdenadas = notasConSaldo.sort((a, b) => {
                const fechaA = new Date(a.fecha || 0).getTime();
                const fechaB = new Date(b.fecha || 0).getTime();
                return fechaB - fechaA;
            });
            
            setNotasIngreso(notasOrdenadas);
        } catch (error) {
            console.error('Error loading notas de ingreso:', error);
            setNotasIngreso([]);
            setErrorNotas('Error al cargar notas de ingreso. Intente de nuevo.');
        } finally {
            setCargandoNotas(false);
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

    const handleBuscarPorDocumento = async () => {
        if (!numeroDocBusqueda) {
            showToast('Ingrese un número de documento para buscar', 'warning');
            return;
        }
        setBuscandoDoc(true);
        try {
            const response = await fetch(`${API_ORIGIN}/api/ingresos?numero_documento=${encodeURIComponent(numeroDocBusqueda)}`);
            const result = await response.json();
            const notas = result.data || [];
            if (notas.length === 0) {
                showToast('No se encontró ninguna nota de ingreso con ese número de documento.', 'warning');
                setBuscandoDoc(false);
                return;
            }

            // Tomamos la primera coincidencia
            const nota = notas[0];

            // Buscar el cliente por razon_social = nota.proveedor
            const client = clients.find(c => c.razon_social?.toUpperCase() === nota.proveedor?.toUpperCase());
            if (client) {
                setSelectedClient(client.id);
            } else {
                showToast(`No se encontró cliente para "${nota.proveedor}". Selecciónelo manualmente.`, 'warning');
            }

            // Cargar detalles de esa nota
            const detRes = await fetch(`${API_ORIGIN}/api/ingresos/${nota.id}`);
            const detJson = await detRes.json();
            const detallesRaw = detJson?.data?.detalles || [];
            const disponibles = detallesRaw.filter((detalle) => getDetalleDisponible(detalle) > 0);

            if (disponibles.length === 0) {
                showToast('La nota de ingreso no tiene productos con saldo disponible.', 'warning');
                setBuscandoDoc(false);
                return;
            }

            let agregados = 0;
            disponibles.forEach(detalle => {
                const disponible = getDetalleDisponible(detalle);
                const existingIndex = fields.findIndex(
                    f => Number(f.producto_id) === Number(detalle.producto_id) &&
                        f.lote_numero === detalle.lote_numero
                );

                if (existingIndex < 0) {
                    append({
                        producto_id: Number(detalle.producto_id),
                        nota_ingreso_id: Number(detalle.nota_ingreso_id || nota.id),
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
                    agregados++;
                }
            });

            if (agregados > 0) {
                showToast(`Se agregaron ${agregados} productos asociados a este documento.`, 'success');
            } else {
                showToast('Todos los productos con saldo ya estaban en la lista.', 'info');
            }

        } catch (error) {
            console.error('Error buscando por documento:', error);
            showToast('Ocurrió un error al buscar el documento.', 'error');
        } finally {
            setBuscandoDoc(false);
        }
    };

    const handleSelectTodaNota = (notaId) => {
        const nota = notasIngreso.find(n => n.id === notaId);
        if (!nota || !nota.detalles || nota.detalles.length === 0) {
            showToast('Esta nota no tiene productos disponibles.', 'warning');
            return;
        }

        // Abrir modal con todos los productos de la nota
        const disponibles = nota.detalles.filter((detalle) => getDetalleDisponible(detalle) > 0);
        setDetallesAEditar(disponibles);
        
        // Inicializar cantidades con los disponibles
        const cantidadesInicial = {};
        disponibles.forEach(detalle => {
            const disponible = getDetalleDisponible(detalle);
            cantidadesInicial[detalle.id] = disponible;
        });
        setCantidadesEditadas(cantidadesInicial);
        setMostrarModalEdicionCantidades(true);
    };

    const handleToggleProductoFromNota = (notaId, detalle) => {
        const key = `${notaId}-${detalle.id}`;
        const isSelected = selectedProductosFromNota[key];
        const disponible = getDetalleDisponible(detalle);

        if (!isSelected && disponible <= 0) {
            showToast('Este detalle ya no tiene saldo disponible.', 'warning');
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
            // Seleccionar - abrir modal de edición
            setDetallesAEditar([detalle]);
            const disponible = getDetalleDisponible(detalle);
            setCantidadesEditadas({ [detalle.id]: disponible });
            setMostrarModalEdicionCantidades(true);
        }
    };

    const handleConfirmarCantidades = () => {
        // Agregar los productos editados a la nota de salida
        let agregados = 0;
        
        detallesAEditar.forEach(detalle => {
            const cantidadSalida = Number(cantidadesEditadas[detalle.id]) || 0;
            
            if (cantidadSalida <= 0) {
                return; // Saltar si cantidad es 0
            }
            
            // Verificar si ya existe este producto con el mismo lote
            const existingIndex = fields.findIndex(
                f => Number(f.producto_id) === Number(detalle.producto_id) &&
                    f.lote_numero === detalle.lote_numero
            );

            if (existingIndex >= 0) {
                // Actualizar cantidad del existente
                const existing = fields[existingIndex];
                update(existingIndex, {
                    ...existing,
                    cant_total: (Number(existing.cant_total) || 0) + cantidadSalida,
                    cantidad: (Number(existing.cantidad) || 0) + cantidadSalida
                });
            } else {
                // Agregar nuevo producto
                append({
                    producto_id: Number(detalle.producto_id),
                    nota_ingreso_id: Number(detalle.nota_ingreso_id || 0),
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
                    cant_total: cantidadSalida,
                    cantidad: cantidadSalida,
                    cantidad_disponible: getDetalleDisponible(detalle)
                });
            }
            agregados++;
        });
        
        if (agregados > 0) {
            showToast(`Se agregaron ${agregados} producto(s) a la nota de salida.`, 'success');
        }
        
        setMostrarModalEdicionCantidades(false);
        setDetallesAEditar([]);
        setCantidadesEditadas({});
        setSelectedProductosFromNota({});
    };

    const handleCambiarCantidad = (detalleId, nuevaCantidad) => {
        const cantidad = Math.max(0, Math.floor(Number(nuevaCantidad) || 0));
        setCantidadesEditadas(prev => ({
            ...prev,
            [detalleId]: cantidad
        }));
    };

    const handleAddLine = () => {
        const isOtro = selectedLoteOption === OTHER_LOTE_OPTION;
        const loteFinal = isOtro ? loteManual : selectedLoteOption;
        const hasLote = Boolean(loteFinal);
        if (!selectedProduct || !hasLote || Number(cantidadTotal) <= 0) {
            showToast('Complete producto, lote y cantidad total.', 'warning');
            return;
        }

        const product = products.find(p => p.id === parseInt(selectedProduct));
        const lote = lotesDisponibles.find(l => String(l.numero_lote) === String(selectedLoteOption));
        const disponible = lote?.cantidad_disponible != null ? Number(lote.cantidad_disponible) : null;
        if (disponible != null && Number(cantidadTotal) > disponible) {
            showToast(`La cantidad supera el disponible del lote (${disponible}).`, 'error');
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
            showToast('Seleccione al menos un producto para quitar.', 'warning');
            return;
        }

        remove(indices);
        setSelectedDetalleIds({});
    };

    const handleRemoveSingle = (index) => {
        const currentId = fields[index]?.id;
        remove(index);
        if (!currentId) {
            return;
        }
        setSelectedDetalleIds((prev) => {
            const next = { ...prev };
            delete next[currentId];
            return next;
        });
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
        setSelectedDetalleIds({});
    };

    const onSubmit = async (data) => {
        try {
            // Validación robusta de detalles
            if (!data.detalles || data.detalles.length === 0) {
                showToast('Debe agregar al menos un producto a la nota.', 'error');
                return;
            }

            // Validar que cada detalle tiene datos válidos
            for (let i = 0; i < data.detalles.length; i++) {
                const det = data.detalles[i];
                if (!det.producto_id || Number.isNaN(Number(det.producto_id))) {
                    showToast(`Detalle ${i + 1}: Producto no válido.`, 'error');
                    return;
                }
                if (!det.cantidad || Number.isNaN(Number(det.cantidad))) {
                    showToast(`Detalle ${i + 1}: Cantidad no es un número.`, 'error');
                    return;
                }
                if (Number(det.cantidad) <= 0) {
                    showToast(`Detalle ${i + 1}: Cantidad debe ser mayor a 0.`, 'error');
                    return;
                }
                if (det.cantidad_disponible != null && Number(det.cantidad) > Number(det.cantidad_disponible)) {
                    showToast(`Detalle ${i + 1}: Cantidad supera el disponible (${det.cantidad_disponible}).`, 'error');
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
            showToast('Nota de salida registrada correctamente.', 'success');
            resetAllStates();
        } catch (error) {
            console.error(error);
            const mensaje = error?.response?.data?.error || error?.message || 'Verifique los datos.';
            showToast(`Error al registrar salida: ${mensaje}`, 'error');
        }
    };

    const handleExportPdf = async () => {
        if (!lastSalidaId) {
            showToast('Primero guarda la nota de salida para exportar PDF.', 'warning');
            return;
        }
        try {
            const pdfUrl = `${API_ORIGIN}/api/salidas/${lastSalidaId}/pdf`;
            if (window.electron?.ipcRenderer) {
                await window.electron.ipcRenderer.invoke('open-external', pdfUrl);
            } else {
                const opened = window.open(pdfUrl, '_blank');
                if (!opened) {
                    showToast('No se pudo abrir el PDF. Verifica los bloqueos de ventanas emergentes.', 'warning');
                }
            }
        } catch (error) {
            console.error(error);
            showToast('Error al exportar PDF.', 'error');
        }
    };

    const handleLimpiar = () => {
        resetAllStates();
        setLastSalidaId(null);
    };

    const stockPorProductoLote = getStockPorProductoLote();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Toast */}
            {toastMsg && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all
                    ${toastType === 'success' ? 'bg-emerald-600' : toastType === 'error' ? 'bg-red-600' : toastType === 'info' ? 'bg-blue-600' : 'bg-amber-500'}`}>
                    {toastMsg}
                </div>
            )}
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
                    <Card className="p-6 bg-linear-to-br from-purple-50 to-blue-50 border-purple-200 border-2">
                        <h3 className="text-xl font-bold text-purple-900 mb-5 flex items-center gap-3 pb-3 border-b-2 border-purple-200">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Selecciona Nota de Ingreso
                            {notasIngreso.length > 0 && (
                                <span className="ml-auto bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                    {notasIngreso.length} disponible(s)
                                </span>
                            )}
                        </h3>

                        <div className="space-y-3">
                            {notasIngreso.length > 0 && (
                                <div className="bg-white rounded-lg border border-purple-200 p-4">
                                    <p className="text-sm font-semibold text-purple-900 mb-2">Stock para descontar por Nota de Ingreso</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-purple-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-purple-800">Nota Ingreso</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-purple-800">Stock Disponible</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-purple-800">A Descontar</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-purple-800">Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {notasIngreso.map((nota) => {
                                                    const disponible = getNotaStockDisponible(nota);
                                                    const descontar = getNotaStockSeleccionado(nota.id);
                                                    const saldo = Math.max(disponible - descontar, 0);
                                                    return (
                                                        <tr key={`resumen-${nota.id}`}>
                                                            <td className="px-3 py-2 font-medium text-slate-800">{nota.numero_ingreso || `NI-${nota.id}`}</td>
                                                            <td className="px-3 py-2 text-right text-green-700 font-semibold">{formatCantidad(disponible)}</td>
                                                            <td className="px-3 py-2 text-right text-amber-700 font-semibold">{formatCantidad(descontar)}</td>
                                                            <td className="px-3 py-2 text-right text-blue-700 font-semibold">{formatCantidad(saldo)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {stockPorProductoLote.length > 0 && (
                                <div className="bg-white rounded-lg border border-blue-200 p-4">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">Stock actualizado por Producto y Lote</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-blue-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-semibold text-blue-800">Código</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-blue-800">Producto</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-blue-800">Lote</th>
                                                    <th className="px-3 py-2 text-left font-semibold text-blue-800">UM</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-blue-800">Disponible</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-blue-800">A Descontar</th>
                                                    <th className="px-3 py-2 text-right font-semibold text-blue-800">Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {stockPorProductoLote.map((item) => (
                                                    <tr key={`stock-lote-${item.key}`}>
                                                        <td className="px-3 py-2 font-mono text-slate-700">{item.codigo}</td>
                                                        <td className="px-3 py-2 text-slate-800">{item.producto}</td>
                                                        <td className="px-3 py-2 text-slate-700">{item.lote}</td>
                                                        <td className="px-3 py-2 text-slate-700">{item.um}</td>
                                                        <td className="px-3 py-2 text-right text-green-700 font-semibold">{formatCantidad(item.disponible)}</td>
                                                        <td className="px-3 py-2 text-right text-amber-700 font-semibold">{formatCantidad(item.descontar)}</td>
                                                        <td className={`px-3 py-2 text-right font-semibold ${item.saldo <= 0 ? 'text-red-700' : 'text-blue-700'}`}>{formatCantidad(item.saldo)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {cargandoNotas ? (
                                <div className="text-center py-10 text-purple-600">
                                    <p className="text-sm font-medium animate-pulse">⏳ Cargando notas de ingreso...</p>
                                </div>
                            ) : errorNotas ? (
                                <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg px-4">
                                    <p className="text-sm font-medium">{errorNotas}</p>
                                    <button type="button" onClick={() => loadNotasIngreso(selectedClient)}
                                        className="mt-2 text-xs underline text-red-700 hover:text-red-900">Reintentar</button>
                                </div>
                            ) : notasIngreso.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <p className="text-lg">📭 No hay notas de ingreso con saldo para este cliente</p>
                                    <p className="text-sm mt-2">Registra una nota de ingreso o ya fueron entregadas completamente</p>
                                </div>
                            ) : (
                                notasIngreso.map(nota => (
                                        <Card key={nota.id} className="p-5 bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all">
                                        <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-slate-100">
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-3">
                                                    <h4 className="text-lg font-bold text-slate-800">
                                                        {nota.numero_ingreso}
                                                    </h4>
                                                    <span className="text-sm text-slate-600">
                                                        📅 {new Date(nota.fecha).toLocaleDateString('es-PE')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    📦 {nota.detalles?.length || 0} producto(s) disponible(s)
                                                </p>
                                                <p className="text-xs mt-1 text-slate-600">
                                                    Stock disp.: <span className="font-semibold text-green-700">{formatCantidad(getNotaStockDisponible(nota))}</span>
                                                    {' '}| A descontar: <span className="font-semibold text-amber-700">{formatCantidad(getNotaStockSeleccionado(nota.id))}</span>
                                                    {' '}| Saldo: <span className="font-semibold text-blue-700">{formatCantidad(Math.max(getNotaStockDisponible(nota) - getNotaStockSeleccionado(nota.id), 0))}</span>
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => handleSelectTodaNota(nota.id)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm whitespace-nowrap"
                                            >
                                                ✓ Todo
                                            </Button>
                                        </div>

                                        {nota.detalles && nota.detalles.length > 0 && (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-purple-50">
                                                        <tr className="border-b border-purple-200">
                                                            <th className="px-3 py-2 text-left font-semibold text-purple-800">✓</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-purple-800">Código</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-purple-800">Producto</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-purple-800">Lote</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-purple-800">Vencimiento</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-purple-800">UM</th>
                                                            <th className="px-3 py-2 text-right font-semibold text-purple-800">Disp.</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {nota.detalles.map(detalle => {
                                                            const key = `${nota.id}-${detalle.id}`;
                                                            const isSelected = selectedProductosFromNota[key];
                                                            const disponible = getDetalleDisponible(detalle);
                                                            const total = Number(detalle.cantidad_total || detalle.cantidad || 0);
                                                            return (
                                                                <tr key={detalle.id} className={`${isSelected ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'hover:bg-slate-50'}`}>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected || false}
                                                                            onChange={() => handleToggleProductoFromNota(nota.id, detalle)}
                                                                            disabled={disponible <= 0}
                                                                            className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                                                                        />
                                                                    </td>
                                                                    <td className="px-3 py-2 font-mono text-slate-700">{detalle.producto?.codigo || '-'}</td>
                                                                    <td className="px-3 py-2 font-medium text-slate-800">{detalle.producto?.descripcion || '-'}</td>
                                                                    <td className="px-3 py-2 text-slate-700">{detalle.lote_numero || '-'}</td>
                                                                    <td className="px-3 py-2">
                                                                        {detalle.fecha_vencimiento ? new Date(detalle.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                                                                    </td>
                                                                    <td className="px-3 py-2">{detalle.um || detalle.producto?.um || '-'}</td>
                                                                    <td className="px-3 py-2 text-right font-bold">
                                                                        <span className={disponible === 0 ? 'text-red-600' : 'text-green-600'}>
                                                                            {disponible}
                                                                        </span>
                                                                        <span className="text-slate-400 ml-1">{total}</span>
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
                            onClick={handleRemoveSelected}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            disabled={fields.length === 0}
                            title="Quitar productos seleccionados"
                        >
                            ➖ Quitar seleccionados
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
                                onClick={handleRemoveSelected}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold w-full md:w-auto"
                                disabled={fields.length === 0}
                            >
                                ➖ Quitar seleccionados
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
                                <th className="px-6 py-4 text-center">Sel</th>
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
                                    <td className="px-6 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(selectedDetalleIds[field.id])}
                                            onChange={() => handleToggleDetalle(field.id)}
                                        />
                                    </td>
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
                                            step="1"
                                            value={field.cantidad ?? 0}
                                            onChange={(event) => {
                                                const raw = Number(event.target.value);
                                                const max = field.cantidad_disponible != null
                                                    ? Number(field.cantidad_disponible)
                                                    : null;
                                                const nextBase = Number.isNaN(raw)
                                                    ? 0
                                                    : (max != null ? Math.min(raw, max) : raw);
                                                const next = Math.max(0, Math.floor(nextBase));
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
                                            onClick={() => handleRemoveSingle(index)}
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
                                    <td colSpan={12} className="px-6 py-8 text-center text-slate-400 italic">
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
                        onClick={handleRemoveSelected}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={fields.length === 0}
                    >
                        ➖ Quitar seleccionados
                    </Button>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button
                        type="button"
                        onClick={handleRemoveSelected}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        disabled={fields.length === 0}
                    >
                        ➖ Quitar seleccionados
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

            {/* Modal de Edición de Cantidades */}
            {mostrarModalEdicionCantidades && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setMostrarModalEdicionCantidades(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v14a2 2 0 11-4 0V4z" />
                                </svg>
                                Editar Cantidades de Salida
                            </h3>
                            <button
                                onClick={() => setMostrarModalEdicionCantidades(false)}
                                className="text-white hover:text-blue-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-auto max-h-[calc(80vh-140px)]">
                            <p className="text-sm text-slate-600 mb-4">
                                Ajusta las cantidades que deseas que salgan. Los valores no pueden exceder lo disponible.
                            </p>

                            <div className="space-y-4">
                                {detallesAEditar.map((detalle) => {
                                    const disponible = getDetalleDisponible(detalle);
                                    const cantidad = cantidadesEditadas[detalle.id] || 0;

                                    return (
                                        <div key={detalle.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">Producto</p>
                                                    <p className="text-sm text-slate-600">{detalle.producto?.descripcion || '-'}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Código: <span className="font-mono">{detalle.producto?.codigo || '-'}</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">Lote</p>
                                                    <p className="text-sm text-slate-600">{detalle.lote_numero || '-'}</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Vencimiento: {detalle.fecha_vencimiento ? new Date(detalle.fecha_vencimiento).toLocaleDateString('es-PE') : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Cantidad Disponible
                                                    </label>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {disponible}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Total en stock: {detalle.cantidad_total || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Cantidad a Salir
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={disponible}
                                                        step="1"
                                                        value={cantidad}
                                                        onChange={(e) => handleCambiarCantidad(detalle.id, e.target.value)}
                                                        className="input-premium text-lg font-bold text-right"
                                                        autoFocus
                                                    />
                                                    {cantidad > disponible && (
                                                        <p className="text-xs text-red-600 mt-1">⚠️ Supera el disponible</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <p className="text-xs text-slate-600">
                                                    <span className="font-semibold">UM:</span> {detalle.um || detalle.producto?.um || '-'} | 
                                                    <span className="font-semibold ml-2">Fabricante:</span> {detalle.fabricante || detalle.producto?.fabricante || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                            <p className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-800">{detallesAEditar.length}</span> producto(s) a procesar
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    onClick={() => setMostrarModalEdicionCantidades(false)}
                                    variant="secondary"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleConfirmarCantidades}
                                    variant="primary"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    ✅ Confirmar y Agregar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
